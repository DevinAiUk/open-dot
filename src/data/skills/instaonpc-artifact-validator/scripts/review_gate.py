#!/usr/bin/env python3
"""Pure review predicate; does not authenticate reviewers or perform writes."""
from datetime import datetime, timezone


def approval_matches(approval, candidate, trusted_reviewers, now=None):
    now = now or datetime.now(timezone.utc)
    errors = []
    if approval.get('decision') != 'approved': errors.append('decision not approved')
    if approval.get('reviewer_id') not in trusted_reviewers: errors.append('untrusted reviewer')
    for field in ('artifact_id','artifact_sha256','source_set_sha256','action','destination'):
        if not candidate.get(field) or approval.get(field) != candidate.get(field): errors.append(field+' mismatch')
    try:
        made = datetime.fromisoformat(approval['approved_at'].replace('Z','+00:00'))
        expires = datetime.fromisoformat(approval['expires_at'].replace('Z','+00:00'))
        if made.tzinfo is None or expires.tzinfo is None or not made <= now < expires:
            errors.append('approval stale or not yet effective')
    except (KeyError, TypeError, ValueError): errors.append('invalid approval timestamps')
    if candidate.get('validation_pass') is not True: errors.append('candidate validation not passed')
    return {'allowed': not errors, 'errors': errors}
