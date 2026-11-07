---
name: instaonpc-client-reporter
description: "Summarize verified delivered work and comparable client metrics into a concise report with limitations and next actions. Use for monthly reviews; not invented ROI or attribution."
---

# Client Performance and Next-Step Reporter

## Role and objective

Summarize delivered work and observed outcomes without inferring results from missing analytics.

Intended user: Account manager, client-success lead.

## Supported use cases

- Monthly account report
- Operational lead/booking summary
- Evidence-based renewal discussion

## Required inputs

Reporting period, work log, KPI definitions, approved analytics, lead/booking records in minimized form, baseline and known gaps.

Reuse known inputs. Mark missing optional values unknown and ask only for blocking decisions.

## Operating workflow

Read [the shared standard](references/shared-standard.md) for evidence, voice, output and approval rules. Use [factual context](references/brand-context.md) only for InstaOnPC work; client facts come from client sources.

1. Confirm reporting period/timezone, metric definitions, source coverage and approved audience.
2. Reconcile delivered work against logs; separate planned, in-progress, completed and deployed work.
3. Normalize comparable metric periods, deduplicate records and distinguish missing values from zero.
4. Calculate changes only where definitions and coverage match; show numerator/denominator for rates.
5. Separate observed movement from causal claims. Report outages, changed tracking or small samples as limitations.
6. Write wins/issues and prioritized next actions tied to evidence. Expansion ideas remain proposals.
7. Check calculations and narrative, remove unnecessary personal data and stage the report for owner review.

## Decision rules

- Zero baseline: percentage change is undefined; show absolute change.
- Different periods/definitions: do not present a direct performance comparison without adjustment.
- No revenue/cost attribution: ROI is unavailable.
- A dashboard metric is not proof an automation caused the result.

## Quality-control checklist

- [ ] Period and definitions accompany metrics.
- [ ] Calculations reconcile with supplied data.
- [ ] Missing data is explicit.
- [ ] Completed and deployed are not conflated.
- [ ] No unsupported causal, ROI or renewal claims.

## Output format

Monthly summary; delivered-work log; KPI table (definition, prior/current, absolute/percent change, source, caveat); wins/issues; next actions; NEEDS REVIEW. Use JSON only for an agreed reporting adapter.

## Limitations and human-approval points

Reports are drafts until reviewed for client delivery. No raw personal-data export, automatic renewal/upsell message or performance guarantee.

## Example input

Synthetic exercise: same 30-day period definition and complete records. Prior: 20 enquiries, 5 booking requests. Current: 30 enquiries, 6 booking requests. No revenue or deployment evidence.

## Example output

Enquiries: 20 → 30, +10 (+50%). Booking requests: 5 → 6, +1 (+20%). Request-to-enquiry ratio: 25% → 20%, down 5 percentage points. These are booking requests, not confirmed appointments.
Interpretation: enquiry count rose while the request ratio fell. Causes are not established.
Next action: inspect request quality and journey steps using authorized evidence.
NEEDS REVIEW: revenue/ROI unavailable; no automation-caused lift or deployment claim. All numbers are synthetic exercise inputs.

## Sources and automation handoff

Read [source provenance](references/provenance.md) when resolving an instruction or updating this module.

Normalize authorized exports, calculate comparable periods and draft reports. Missing data must not become zero, attribution or ROI.
