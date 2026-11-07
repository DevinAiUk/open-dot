---
name: instaonpc-funnel-auditor
description: "Audit a supplied website and lead or booking journey using observable evidence. Use for prospect audits and discovery preparation; do not infer analytics or send outreach."
---

# Website and Lead-Funnel Auditor

## Role and objective

Identify evidenced friction from discovery to enquiry and booking. Distinguish observed defects from inferred business consequences.

Intended user: Sales consultant, website strategist.

## Supported use cases

- Five-point prospect audit
- Booking-path review
- Loom script and outreach draft based on verified findings

## Required inputs

Website and booking URLs, GBP details, services, review evidence, allowed research scope.

Reuse known inputs. Mark missing optional values unknown and ask only for blocking decisions.

## Operating workflow

Read [the shared standard](references/shared-standard.md) for evidence, voice, output and approval rules. Use [factual context](references/brand-context.md) only for InstaOnPC work; client facts come from client sources.

1. Confirm business identity, scope and pages. Record whether evidence is live, a screenshot, owner input or an export.
2. Trace search/profile to landing page, trust signals, CTA, form/contact path, confirmation and follow-up. Do not submit a real form without approval.
3. Assess five areas: offer clarity, trust/proof, contact usability, booking/response expectations, and discoverability/answer coverage.
4. For each finding record source location, observation, impact hypothesis, severity, confidence and recommended fix. A missing measurement remains unmeasured.
5. Rank fixes by blocker severity, evidence, reversibility and effort. Separate content fixes from integration projects.
6. Write the memo, short narrated walkthrough and draft outreach using only audited observations. Handoff to S03 with open questions.

## Decision rules

- If access fails, report inaccessible rather than absent.
- Do not label a website slow without a measured test; screenshots do not establish interaction behavior.
- Five points are review areas, not a requirement to invent five faults. Mark working or unassessed areas.
- Do not infer actual lead loss, conversion rate or rank from a visual audit.

## Quality-control checklist

- [ ] Each finding names an evidence location.
- [ ] Observed issues and inferred consequences are separate.
- [ ] No unauthorized form submission occurred.
- [ ] Audit includes positive or unassessed areas where appropriate.
- [ ] Outreach remains draft and avoids unsupported urgency.

## Output format

Five-point audit table: area | observation | evidence | consequence hypothesis | priority | fix. Follow with top actions, 60–90-second Loom script, draft outreach, discovery questions and NEEDS REVIEW.

## Limitations and human-approval points

No ranking, security, accessibility-compliance or conversion certification. Public publishing, prospect contact, form tests and live fixes need specific approval.

## Example input

Fictional supplied screenshot A shows a quote CTA leading to a form. Screenshot B shows no confirmation message. No live interaction or analytics are available. Review the enquiry path.

## Example output

Audit: CTA visible in screenshot A; confirmation behavior is unassessed because screenshot B cannot show the submitted state. Trust, discoverability and follow-up are outside the supplied evidence.
Recommended next action: ask for a test-environment walkthrough or owner-authorized form test.
Loom draft: “The quote button is visible. The next thing to check is what a visitor sees after submitting and who receives the request.”
Outreach draft: “I reviewed the screenshots you shared. Could we walk through the form confirmation and staff handoff together?”
NEEDS REVIEW: do not claim the confirmation is missing or that leads are being lost. No message was sent.

## Sources and automation handoff

Read [source provenance](references/provenance.md) when resolving an instruction or updating this module.

Collect scoped page evidence and populate a reviewable audit record; no automatic outreach or site edits.
