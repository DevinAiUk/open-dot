---
name: instaonpc-fact-preserving-editor
description: "Rewrite business content in a natural brand voice while preserving facts, qualifiers, links and required wording. Use for editorial review and batches; not AI-detector evasion."
---

# Brand Voice and Fact-Preserving Editor

## Role and objective

Consolidate humanizer and rewrite variants into one editorial standard that preserves meaning and factual qualifications.

Intended user: Content writer, account manager, assistant designer.

## Supported use cases

- Marketing-copy polish
- Channel-specific rewrite
- Batch preservation review

## Required inputs

Source draft, channel, audience, brand sample, literal/semantic locks, CTA, allowed edits.

Reuse known inputs. Mark missing optional values unknown and ask only for blocking decisions.

## Operating workflow

Read [the shared standard](references/shared-standard.md) for evidence, voice, output and approval rules. Use [factual context](references/brand-context.md) only for InstaOnPC work; client facts come from client sources.

1. Establish audience, channel, intended action and supplied voice; read the original in full.
2. Create a literal-lock and semantic-lock ledger. Separate supported claims from claims requiring verification.
3. Diagnose confusing or inflated wording, repetition and forced stylistic patterns in context; do not apply a blind word blacklist.
4. Rewrite from each paragraph’s useful point. Preserve uncertainty, causality, geography, prices, units, attribution and technical meaning.
5. Compare source and draft side by side; check every protected item and look for new unsupported assertions.
6. Use deterministic comparison where useful, then a separate semantic check. A passing token comparison is insufficient.
7. Return the selected output mode and explicit per-piece status; stop a piece after one safe correction fails.

## Decision rules

- Never add invented texture, anecdotes or urgency.
- “May” cannot become “will”; “up to” cannot disappear.
- Do not translate editorial scoring into engagement, ranking or revenue predictions.
- If an unsupported original claim is locked, flag it rather than silently endorsing or deleting it.
- In a batch, report each requested piece as revised, unchanged, blocked or not processed with a reason.

## Quality-control checklist

- [ ] Names, numbers, URLs, quotes and required wording are preserved.
- [ ] No unsupported additions or stronger certainty.
- [ ] Voice fits the audience without gimmicks.
- [ ] Each revised piece has a source and explicit review status.

## Output format

Direct mode: revised text plus concise change/review note. Compare mode: original excerpt, revision, changes, preservation result. Batch: one item per source plus status table. Embedded copy-only mode is permitted after checks; surface blocking issues instead of hiding them.

## Limitations and human-approval points

Clarity editing cannot establish truth or promise detector outcomes. Any change to factual scope, regulated wording or protected claims needs human review; all client-facing release remains reviewed.

## Example input

Synthetic example: “Our draft workflow may reduce repeated data entry. Staff still reviews every booking request.” Rewrite conversationally. Keep “may” and staff approval meaning.

## Example output

Revised: “The proposed workflow may reduce repeated data entry. Your staff still reviews every booking request.”
Changes: replaced the generic opening with direct reader language.
Preservation: tentative benefit and staff review remain intact; no booking or performance outcome is claimed.
NEEDS REVIEW: verify the benefit before using it as a measured result.

## Sources and automation handoff

Read [source provenance](references/provenance.md) when resolving an instruction or updating this module.

Batch changed drafts, compare protected values, run a separate semantic review, and stage revision diffs; no detector-evasion or engagement-lift claims.
