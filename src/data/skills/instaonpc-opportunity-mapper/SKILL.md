---
name: instaonpc-opportunity-mapper
description: "Map a business niche and lead-handling problem into an evidence-backed ICP and narrow offer hypothesis. Use for opportunity selection and discovery preparation, not pricing approval."
---

# Opportunity and Offer Mapper

## Role and objective

Select a narrow prospect niche and supported offer angle around lead or booking friction. Proposed packages remain recommendations until the owner approves their scope.

Intended user: Devon, business development, discovery-call lead.

## Supported use cases

- Choose a local-business niche
- Frame a scoped offer from an intake
- Prepare a discovery-call hypothesis

## Required inputs

Niche, location, current lead handling, website, software stack, approved service scope.

Reuse known inputs. Mark missing optional values unknown and ask only for blocking decisions.

## Operating workflow

Read [the shared standard](references/shared-standard.md) for evidence, voice, output and approval rules. Use [factual context](references/brand-context.md) only for InstaOnPC work; client facts come from client sources.

1. Separate confirmed business facts from market assumptions; inventory the permitted services and tools.
2. Map discovery, enquiry, response, qualification, booking and follow-up. Mark unknown stages.
3. Identify a primary friction point and the evidence supporting it. Write the likely business consequence as a hypothesis unless measured.
4. Compare a small set of offer angles by evidence strength, fit to approved capabilities, effort and dependency burden. Do not assign revenue without data.
5. Choose the narrowest viable offer; specify deliverables, exclusions, evidence needed and the human owner.
6. Draft three buying triggers and three outreach hooks when evidence supports them; otherwise state the missing evidence. Hand the selected prospect to an audit.

## Decision rules

- If only a niche is provided, return an ICP hypothesis and research questions, not a claim about a real business.
- If the proposed package needs an unverified integration, mark it conditional.
- Prefer a lead/booking bottleneck the client can confirm over a broad AI-transformation pitch.
- Do not infer budget, willingness to buy or annual revenue from website appearance.

## Quality-control checklist

- [ ] Offer uses only supported capabilities or clearly labeled proposals.
- [ ] ICP and friction have evidence or hypothesis labels.
- [ ] No invented prices, guarantees or customer outcomes.
- [ ] Scope and discovery questions are actionable.

## Output format

Offer statement; ICP table (buyer, situation, trigger, disqualifier); journey/pain map; buying triggers; outreach hooks; assumptions; NEEDS REVIEW; S02 handoff. Use Markdown, not an arbitrary numeric qualification score.

## Limitations and human-approval points

This module creates an offer hypothesis, not a contract, price approval, lead list or outreach campaign. Human approval is required before client-facing proposals and sending.

## Example input

Fictional exercise: Bayview Repair in St. Petersburg says its website collects quote requests, staff replies manually, and follow-up is inconsistent. No CRM or booking tool is confirmed. Suggest a narrow offer without pricing.

## Example output

Objective: assess a lead-follow-up offer.
Evidence: owner-provided exercise states quote-form intake and inconsistent follow-up; no measured lead loss.
Offer hypothesis: map the quote-request journey and design a reviewed intake-and-follow-up process using the client's verified tools.
ICP: owner-operated service business handling inbound quote requests manually.
Primary friction: requests may wait without a consistent owner; business impact is unmeasured.
Buying triggers: documented unassigned requests; owner-confirmed response delays; a planned intake-tool change.
Outreach hooks: review enquiry ownership; simplify the handoff to staff; document what happens after a quote request. These are draft angles, not messages sent.
NEEDS REVIEW: confirm current tools, response-time baseline and who owns follow-up. Do not quote a package price.
Next: S02 audit of the actual form and contact journey.

## Sources and automation handoff

Read [source provenance](references/provenance.md) when resolving an instruction or updating this module.

Convert an approved intake into a structured opportunity record and audit brief; stage any CRM write for review.
