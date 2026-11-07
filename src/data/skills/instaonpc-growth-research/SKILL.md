---
name: instaonpc-growth-research
description: "Run bounded website keyword, competitor and trend research with dated evidence and prior-run comparison. Use for growth briefs and monitoring; unavailable metrics stay unknown."
---

# Growth Research and Opportunity Monitor

## Role and objective

Maintain a bounded keyword, competitor and trend evidence ledger with meaningful changes between runs.

Intended user: Growth strategist, research analyst.

## Supported use cases

- Baseline opportunity research
- Update/no-change comparison
- Bounded competitor review

## Required inputs

Site profile, owned-page inventory, current/prior windows, prior successful run, approved sources and any authorized metrics.

Reuse known inputs. Mark missing optional values unknown and ask only for blocking decisions.

## Operating workflow

Read [the shared standard](references/shared-standard.md) for evidence, voice, output and approval rules. Use [factual context](references/brand-context.md) only for InstaOnPC work; client facts come from client sources.

1. Define site/client, objectives, geographic/device/language context, current/prior windows, source scope and run ID.
2. Read the prior successful run and owned-page inventory; initialize an explicit baseline when absent.
3. Collect customer/query language, consistent competitor fields and relevant trend evidence. Record source/date/location and metric provider where available.
4. Normalize terms and cluster by intent; distinguish existing coverage, refresh needs and true gaps.
5. Compare windows without claiming a trend from one isolated observation. Missing comparable data means direction unknown.
6. Score using the stated 100-point rubric with component reasons; create zero to three justified briefs. Do not fill a quota.
7. Validate, report material deltas, and update authorized state once. Keep prior successful state on failure; scheduling is a separate approved action.

## Decision rules

- No volume, difficulty, rank, CPC or traffic without an actual source.
- Use the same comparison fields for each competitor and separate direct competitors from product alternatives.
- Historical studies and prior generated research are not current observations.
- Quiet/no-change is valid; no baseline means no measured trend.

## Quality-control checklist

- [ ] Research scope, windows and source dates are visible.
- [ ] Each opportunity has evidence and an explained score.
- [ ] Briefs are distinct from existing work.
- [ ] Unknowns are not zeros.
- [ ] State and draft status are accurate.

## Output format

Summary/delta; keyword ledger; competitor matrix; trend table; component-scored opportunity queue; zero to three briefs; NEEDS REVIEW; next-state note. Automation may use the versioned growth-pack contract supplied with S08.

## Limitations and human-approval points

This is research and draft planning, not a rank guarantee or background service. Live data requires actual access; sensitive news or unsupported claims require review before use.

## Example input

Fictional update: prior source hashes and the current scoped hashes match; no new approved metrics are available. What should this run produce?

## Example output

Run status: no_change.
No new or changed evidence was found in the scoped inputs. No new briefs were created.
Metrics: unavailable; not assumed zero.
State proposal: record this check time and retain the prior successful baseline.
NEEDS REVIEW: none within the unchanged-source check; this does not establish that the wider market is unchanged.

## Sources and automation handoff

Read [source provenance](references/provenance.md) when resolving an instruction or updating this module.

Run on demand first; later use an approved cadence and durable state. Unknown metrics stay unknown; unchanged runs produce a concise no-change result.
