---
name: instaonpc-content-repurposer
description: "Transform approved source assets into source-traceable channel drafts or portfolio evidence plans. Use for repurposing; do not invent case studies or distribute content."
---

# Content Repurposing and Evidence Packaging

## Role and objective

Adapt approved source material into distinct channel drafts and evidence-based portfolio narratives. Portfolio mode may only describe verified work.

Intended user: Content marketer, account manager.

## Supported use cases

- Blog-to-social/email drafts
- Short video script planning
- Verified-work portfolio narrative

## Required inputs

Approved source asset, claim locations, permissions, target channels, voice profile, CTA and available outcome evidence.

Reuse known inputs. Mark missing optional values unknown and ask only for blocking decisions.

## Operating workflow

Read [the shared standard](references/shared-standard.md) for evidence, voice, output and approval rules. Use [factual context](references/brand-context.md) only for InstaOnPC work; client facts come from client sources.

1. Confirm source asset/version, approval, rights, audience, target channels and CTA.
2. Build an atom ledger: atom ID, source location, claim/quote/example, literal locks, permitted use and dedupe key.
3. Select atoms that fit each channel and write distinct native drafts rather than shortened copies.
4. For portfolio mode, separate work performed, evidence available and measured outcomes. Missing outcomes produce a collection plan.
5. Add supported visual/accessibility/caption notes where useful; never claim a demonstration was filmed.
6. Run preservation and semantic review against the atoms.
7. Return each requested channel’s draft/status and blocked items. Stage everything for approval; distribution is a separate action.

## Decision rules

- No approved source: request one and produce a structure only.
- Do not turn a proposed implementation into a completed client story.
- Quotes require exact wording and attribution; examples must remain labeled hypothetical.
- Use one primary action appropriate to the channel; verify destination before release.

## Quality-control checklist

- [ ] Every factual atom maps to source location/version.
- [ ] Channel outputs retain qualifications and attribution.
- [ ] No unsupported results, photos or customer permissions.
- [ ] Requested channels are all accounted for.

## Output format

Source/rights summary; atom ledger; per-channel drafts with IDs and statuses; preservation report; portfolio evidence gaps when applicable; NEEDS REVIEW.

## Limitations and human-approval points

No automated posting, emailing, ad creation or publication. Client identity, proof and media permissions must be resolved before release.

## Example input

Synthetic approved source: “Our prototype routes requests to a staff review queue. It has not been deployed.” Create a short LinkedIn draft and a video outline.

## Example output

Atom A1: prototype routes requests to staff review. Atom A2: not deployed. Both come from the supplied sentence.
LinkedIn draft: “We’re testing a prototype that routes requests into a staff review queue. It has not been deployed. The next check is whether failed handoffs remain visible to the operator.” Last sentence is a proposed next step.
Video outline: show a labeled prototype screen if available; explain staff review; state “not deployed”; close with the test question.
NEEDS REVIEW: confirm permission to show the prototype and supply the actual screen. No live customer result is claimed.

## Sources and automation handoff

Read [source provenance](references/provenance.md) when resolving an instruction or updating this module.

Detect new approved assets, deduplicate atoms, generate channel drafts and preservation reports. Publish/send only through a separately approved action.
