#!/usr/bin/env python3
"""Validate the bundled growth-pack contract and report review eligibility.

Offline only. Structural validity is not proof of factual truth or approval.
Exit 0: ready for human review; 1: invalid structure; 2: review blocked.
"""
import argparse
import datetime as dt
import hashlib
import json
import math
from pathlib import Path
from urllib.parse import urlsplit


def is_url(value):
    if not isinstance(value, str) or any(c.isspace() for c in value):
        return False
    try:
        u = urlsplit(value)
        return u.scheme in ('http', 'https') and bool(u.hostname) and not u.username and not u.password
    except (ValueError, TypeError):
        return False


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def check_node(value, schema, path, errors):
    kinds = schema.get('type', [])
    kinds = kinds if isinstance(kinds, list) else [kinds]
    checks = {'object': lambda v: isinstance(v, dict), 'array': lambda v: isinstance(v, list),
              'string': lambda v: isinstance(v, str), 'integer': lambda v: type(v) is int,
              'number': lambda v: type(v) in (int, float) and math.isfinite(v),
              'boolean': lambda v: type(v) is bool, 'null': lambda v: v is None}
    if not kinds or not any(k in checks and checks[k](value) for k in kinds):
        errors.append(f'{path}: expected {kinds}'); return
    if 'enum' in schema and not any(type(value) is type(x) and value == x for x in schema['enum']):
        errors.append(f'{path}: value outside enum')
    if isinstance(value, dict):
        props = schema.get('properties', {})
        for key in schema.get('required', []):
            if key not in value: errors.append(f'{path}.{key}: required')
        if schema.get('additionalProperties') is False:
            for key in value.keys() - props.keys(): errors.append(f'{path}.{key}: unexpected field')
        for key in value.keys() & props.keys(): check_node(value[key], props[key], f'{path}.{key}', errors)
    elif isinstance(value, list):
        for i, item in enumerate(value): check_node(item, schema['items'], f'{path}[{i}]', errors)


def validate(pack, schema):
    errors = []
    check_node(pack, schema, '$', errors)
    if errors: return errors
    if pack['schema_version'] != '1.0': errors.append('$.schema_version: unsupported contract; expected 1.0')
    for key in ('site', 'run_id', 'generated_at', 'summary'):
        if not nonempty(pack[key]): errors.append(f'$.{key}: empty')
    if not is_url(pack['site']): errors.append('$.site: invalid HTTP(S) URL')
    try:
        stamp = dt.datetime.fromisoformat(pack['generated_at'].replace('Z', '+00:00'))
        if stamp.tzinfo is None: raise ValueError('timezone required')
    except (TypeError, ValueError): errors.append('$.generated_at: expected ISO datetime with timezone')
    seen = set(); opportunities = set(); briefs = set(); domains = set()
    for group in ('keywords', 'competitors', 'trends', 'opportunities', 'briefs', 'repurposed_drafts'):
        for i, item in enumerate(pack[group]):
            path = f'$.{group}[{i}]'
            for k, v in item.items():
                if isinstance(v, str) and not v.strip(): errors.append(f'{path}.{k}: empty')
                if k == 'source_url' and not is_url(v): errors.append(f'{path}.{k}: invalid URL')
                if k in ('source_urls', 'internal_links'):
                    if k == 'source_urls' and not v: errors.append(f'{path}.{k}: missing sources')
                    for j, url in enumerate(v):
                        if not is_url(url): errors.append(f'{path}.{k}[{j}]: invalid URL')
            if 'id' in item:
                identity = item['id']
                if not nonempty(identity): errors.append(f'{path}.id: empty')
                if identity in seen: errors.append(f'{path}.id: duplicate {identity}')
                seen.add(identity)
                if group == 'opportunities': opportunities.add(identity)
                if group == 'briefs': briefs.add(identity)
            if group == 'competitors':
                domain = item['domain'].lower().rstrip('/')
                candidate = domain if '://' in domain else 'https://' + domain
                if not is_url(candidate): errors.append(f'{path}.domain: invalid domain')
                if domain in domains: errors.append(f'{path}.domain: duplicate')
                domains.add(domain)
            for key in ('fit', 'score'):
                if key in item and (type(item[key]) is not int or not 0 <= item[key] <= 100):
                    errors.append(f'{path}.{key}: expected integer 0..100 (not Boolean)')
    for i, b in enumerate(pack['briefs']):
        if b['opportunity_id'] not in opportunities: errors.append(f'$.briefs[{i}].opportunity_id: broken reference')
    for i, d in enumerate(pack['repurposed_drafts']):
        if d['source_brief_id'] not in briefs: errors.append(f'$.repurposed_drafts[{i}].source_brief_id: broken reference')
    return errors


def assess(pack, schema, artifact_hash=None):
    errors = validate(pack, schema)
    blockers = []
    humanizer = 'not_evaluated'
    if not errors:
        q = pack['quality']
        for key in ('source_check', 'dedupe_check'):
            if q[key] is not True: blockers.append(f'quality.{key}: failed')
        if pack['repurposed_drafts']:
            humanizer = 'pass' if q['humanizer_check'] is True else 'fail'
            if humanizer == 'fail': blockers.append('quality.humanizer_check: failed for generated drafts')
        else:
            humanizer = 'not_applicable_no_drafts'
        if q['unsupported_claims']: blockers.append('quality.unsupported_claims: unresolved claims')
        if q['human_review_items']: blockers.append('quality.human_review_items: unresolved decisions')
    return {'validator_version': '1.0.0', 'contract_version': '1.0', 'artifact_sha256': artifact_hash,
            'structural_valid': not errors, 'structural_errors': errors, 'review_blockers': blockers,
            'humanizer_status': humanizer, 'ready_for_human_review': not errors and not blockers,
            'approved_for_external_action': False,
            'limitation': 'Offline checks do not verify source truth, tool availability, or human approval.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pack', type=Path)
    parser.add_argument('--schema', type=Path, default=Path(__file__).resolve().parents[1]/'references/growth-pack.schema.json')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    try:
        raw = args.pack.read_bytes(); pack = json.loads(raw)
        schema = json.loads(args.schema.read_text())
        report = assess(pack, schema, hashlib.sha256(raw).hexdigest())
    except (OSError, ValueError, TypeError, KeyError) as exc:
        report = {'structural_valid': False, 'structural_errors': [type(exc).__name__+': cannot read or validate contract'],
                  'ready_for_human_review': False, 'approved_for_external_action': False}
    result = json.dumps(report, indent=2)+'\n'
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True); args.report.write_text(result)
    print(result, end='')
    return 1 if not report['structural_valid'] else (0 if report['ready_for_human_review'] else 2)


if __name__ == '__main__': raise SystemExit(main())
