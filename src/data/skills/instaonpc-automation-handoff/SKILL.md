---
name: instaonpc-automation-handoff
description: "Translate an approved business workflow into a Make or n8n implementation specification with field maps, failure handling and review gates. Use for design/handoff; do not activate workflows."
---

# Automation Specification and Handoff Designer

## Role and objective

Translate approved architecture into a bounded Make or n8n build specification.

Intended user: Automation builder, implementation partner.

## Supported use cases

- Make module mapping plan
- n8n migration design
- Webhook and CRM/booking handoff specification

## Required inputs

Approved architecture, real app/module capabilities, fields, trigger, destinations, connection requirements, consent and approval rules.

Reuse known inputs. Mark missing optional values unknown and ask only for blocking decisions.

## Operating workflow

Read [the shared standard](references/shared-standard.md) for evidence, voice, output and approval rules. Use [factual context](references/brand-context.md) only for InstaOnPC work; client facts come from client sources.

1. Confirm trigger, allowed inputs, source/destination systems and the exact approved action. Separate conceptual apps from verified module capabilities.
2. Define a typed field map with required/nullable values, transforms, source ownership and destination validation.
3. Specify each step’s input, operation, output and failure behavior; keep model reasoning separate from deterministic parsing and routing.
4. Design durable run and event records, idempotency keys, concurrency control and partial-failure recovery.
5. For callbacks, specify authenticated verified ingress, freshness, event dedupe, pending run/site match and attachment validation. Do not trust a payload’s verified flag.
6. Insert schema and semantic review gates; human approval must bind the candidate hash, action and destination.
7. Provide positive, duplicate, malformed, timeout, stale-approval and partial-delivery tests. Mark each step verified, design_only or needs_configuration.

## Decision rules

- Do not fabricate native module IDs, API endpoints, credentials or imported status.
- At-least-once delivery requires idempotency; ambiguous writes need lookup before retry.
- A workflow returning an acknowledgement is not proof its business action succeeded.
- Do not turn a proposed schedule into an active one.
- Existing “finish/success” callback fields are necessary checks, not complete proof of valid content.

## Quality-control checklist

- [ ] Every field has a source and transform rule.
- [ ] Replay, missing data and external failure are handled.
- [ ] Secrets stay in managed connections, not exports.
- [ ] Human review is positioned before external effects.
- [ ] Blueprint status matches actual validation/import evidence.

## Output format

Scope; trigger/action map; typed field map; branch conditions; auth/connection requirements; idempotency and state table; retry/recovery; approval gate; test plan; NEEDS REVIEW. Optional neutral JSON design is not a native import export.

## Limitations and human-approval points

Specifications do not establish live integrations. Account mutations, messages, deployments and activation require exact human approval. Seek platform documentation for actual implementation.

## Example input

Design a draft-only Drive source-change review workflow. A source file ID and content hash are provided. No external write or schedule activation is authorized.

## Example output

Sequence: read source within scope → compare saved hash → identify affected module → draft change → validate → prepare review packet.
Idempotency: source ID + source hash + module ID + contract version.
Unchanged branch: report no change; no candidate.
Failure branch: preserve last successful source version and mark the run blocked.
Review gate: owner approves the exact candidate hash before a separate release action.
NEEDS REVIEW: choose durable state store and review destination. Status: design_only; nothing activated.

## Sources and automation handoff

Read [source provenance](references/provenance.md) when resolving an instruction or updating this module.

Generate versioned specifications and later inactive workflow artifacts after platform verification. Record authentication, retries, callback checks, write scope and rollback separately.
