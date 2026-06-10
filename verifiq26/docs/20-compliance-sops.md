# VerifIQ — Compliance Standard Operating Procedures

**Doc ID:** `verifiq-compliance-v0.1`  
**Status:** Internal operating procedures · publish where customer-facing  
**Purpose:** The procedural backbone — DPIA, GDPR data-subject-request handling, breach notification, refund / re-run, reviewer SLA, incident response, Article 22 position.  
**Date:** 2026-06-01

---

## 1 · Data Protection Impact Assessment (DPIA) Summary

A full Article 35 DPIA is held internally as `data-protection/dpia-v0.1.pdf`. This is the customer-facing summary.

**Processing purpose:** Reading customer-uploaded design documents to produce a source-quoted findings register for the registered design professional. The output is delivered to the customer; nothing is shared externally.

**Lawful basis (GDPR Article 6):** Performance of contract with the customer (the practice that signed up). Where personal data of incidentally-identified individuals appears within uploaded documents (designer names on title blocks etc.), the lawful basis is legitimate interest, balanced against minimal-intrusion processing (no profiling, no automated decisions affecting them, deletion at 14 days).

**Personal data processed:**

- Customer user data: name, email, organisation, billing identity, session metadata.
- Incidental: names and signatures of design professionals visible on title blocks within uploaded documents.
- Incidental: addresses and references inside documents that may include personal information (residents in housing surveys, etc.).

**Special category data:** None expected. Healthcare project documents may include incidental references to clinical functions; they are not patient records and not processed as healthcare data. US healthcare packs refused without a BAA.

**Risks identified and mitigations:**

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| Unauthorised access to uploaded documents | Low | High | Encryption at rest in Convex EU-West; access restricted to founder + reviewer queue; magic-link upload with single-use tokens; 14-day deletion |
| Re-identification of incidental personal data | Low | Medium | Documents not searchable post-deletion; findings register references documents not personal identities; reviewer trained on minimisation |
| Cross-border transfer | Low | Medium | EU data residency mandatory; sub-processors with EU regions only |
| Sub-processor compromise | Low | High | Limited sub-processor list, all with published DPAs; quarterly review |
| AI model training on customer data | None | High | Locked anti-training policy with Anthropic + OpenAI; published commitment |
| Data subject rights handling | Low | Medium | DSR procedure (section 2 below); 14-day response target |

**Conclusion:** Residual risk is low. No DPC consultation required under Article 36. DPIA reviewed quarterly or on material change (new sub-processor, new market, schema change involving new personal data).

**Next review:** 2026-09-01.

---

## 2 · GDPR Data Subject Request (DSR) Procedure

**Eligible requests:** Access (Article 15), rectification (16), erasure (17), restriction (18), portability (20), objection (21), withdraw consent (7).

**Routing:** Customer (the practice) is typically the controller for documents they upload. VerifIQ is the processor and assists per Article 28. Personal data of customer users is controlled by VerifIQ.

**Response time:** 14 days target, 30 days statutory maximum (Article 12).

**Workflow:**

1. **Receive** request at `hello@verifiq.ie` or `privacy@verifiq.ie`. Log in DSR tracker with date, requester, request type.
2. **Verify identity.** For customer users — confirm via authenticated email. For data subjects identified in uploaded documents — request proof of identity + lawful basis for the request; refer to controller (customer practice) where appropriate.
3. **Determine scope.** What data is held about the requester? What sub-processors hold copies?
4. **Execute** the request:
   - Access: assemble data export (account profile, billing records, audit log entries) in JSON or CSV. Deliver via secure download.
   - Rectification: update record, confirm.
   - Erasure: delete record from Convex + revoke Stripe customer + Clerk user + Resend contact + clear browser fingerprint cookie. Hashes are retained 90 days (legitimate interest — abuse prevention) and disclosed in the response.
   - Restriction: flag record `restricted=true`; suspend processing pending resolution.
   - Portability: provide machine-readable JSON of account + activity.
   - Objection: cease specific processing if no overriding legitimate interest; document the decision.
   - Withdraw consent: where consent was the lawful basis; not applicable to contract-based processing.
5. **Respond** within target. Include: what was done, what was retained and why, escalation path (DPC complaint route).
6. **Log** completion in DSR tracker with date and outcome.

**Refusal grounds (rare):** Manifestly unfounded or excessive; we may charge a reasonable fee or refuse, with reasons and DPC complaint route. Document the refusal in the tracker.

---

## 3 · Breach Notification Process (Article 33 + 34)

**Internal SLA:** Awareness → DPC notification within 72 hours. Affected data subjects notified without undue delay where breach is likely to result in high risk.

**Workflow:**

**Hour 0 — Awareness.** Whoever notices alerts founder immediately. Founder is the Data Protection contact during pilot phase.

**Hour 0-4 — Triage.**
- What happened? What systems affected?
- What data types involved? (Customer documents? User accounts? Audit logs?)
- How many data subjects?
- Is processing still active or contained?

**Hour 4-24 — Contain + assess.**
- Stop the leak: rotate keys, revoke tokens, take affected systems offline if necessary.
- Engage sub-processors (Anthropic / OpenAI / Convex / Vercel / Clerk / Stripe / Resend) per their incident protocols if implicated.
- Engage solicitor (Phase 2 retained).
- Engage cyber insurer if cover triggered.
- Document the incident in `incidents/{{date}}-{{slug}}.md`.

**Hour 24-72 — Notify DPC** if breach is reportable (Article 33). Reportable unless "unlikely to result in a risk." Default to reporting; under-report carries higher penalty than over-report.

**Notification content (Article 33(3)):**
- Nature of breach; categories and approximate number of data subjects + records affected.
- Name + contact of DPO / data protection contact.
- Likely consequences.
- Measures taken / proposed.

**Notify data subjects** (Article 34) without undue delay if breach likely to result in high risk to their rights and freedoms — unless exception applies (encrypted data unreadable to attacker, subsequent measures eliminate risk, disproportionate effort + public communication used instead).

**Customer notification:** All affected customers notified by email within 72 hours regardless of statutory threshold. Transparency is the brand.

**Post-mortem:** Within 14 days, written post-mortem (root cause, lessons, preventive actions, timeline). Filed in `incidents/`. Quarterly review of all incidents.

**No-blame culture internally. Full transparency externally.**

---

## 4 · Refund / Re-run Policy (customer-facing)

**Material complaint about a finding:** Re-run the affected discipline at no charge within 14 days of original release. Customer raises by email to `hello@verifiq.ie` with the specific finding(s) in dispute and their reasoning.

**Platform failure:** Refund in full within 14 days. Platform failure = scan did not complete, scan delivered no findings register, scan crashed without recoverable output.

**Finding-quality dispute (where finding is technically correct but customer disagrees):** Not a refund situation. Customer's professional judgement governs whether to act on the finding. Re-run available on request to confirm the source quote was accurate.

**Annual seat cancellation:** Non-refundable mid-term but transferable within the practice. Up to 60 days pause per annual term with concierge approval. No auto-renew.

**Outside-scope finding (Solo Reviewer Phase):** If a customer raises a complaint about an "AI-surfaced · pending chartered review" finding that turns out to be wrong, that is a Solo Reviewer Phase honesty failure, not a customer fault. Re-run with the specialist (Option C invoked retrospectively) at no charge.

**Force-majeure:** If sub-processor outage (Anthropic / OpenAI / Convex) prevents scan release, SLA pauses for the duration of the outage. Customer notified within 4 hours. Refund issued if outage exceeds 5 business days.

---

## 5 · Reviewer SLA (customer-facing)

| Tier | Reviewer SLA | Notes |
|---|---|---|
| Free taster | 22 min target, 60 min max | Automated Haiku skim only; no chartered reviewer |
| Tier I — Small | 24 hours | Single discipline; single reviewer pass |
| Tier II — Mid | 36 hours | Multi-discipline; coordination pass included |
| Tier III — Large | 48 hours | Full team; cross-pass; reviewer queue prioritised |
| Tier IV — Programme | 72 hours | Multi-pack programme; concierge included |
| Tier V — Mega | By arrangement | Dedicated reviewer panel; SLA in MSA |

**Out-of-scope (Solo Reviewer Phase) findings:** Marked at the same SLA as in-scope findings; no separate timeline.

**SLA breaches:** Customer entitled to a free re-run + 20% credit toward next pack. SLA breach defined as: reviewer-signed release missing the target by more than 24 hours without prior notice from concierge.

**Force-majeure:** SLA pauses during sub-processor outages or reviewer absence (>48 hour). Customer notified within 4 hours.

---

## 6 · Incident Response Runbook

For platform / security / sub-processor / reviewer-availability incidents.

**Severity levels:**

| Sev | Definition | Response time | Escalation |
|---|---|---|---|
| SEV-1 | Customer documents exposed; reviewer-signed output incorrect at scale; full platform down | Immediate | Founder + solicitor + cyber insurer + affected customers within 4 hours |
| SEV-2 | Sub-processor outage; reviewer unavailable; scan pipeline degraded but not down | Within 4 hours | Founder + status page update |
| SEV-3 | Single-customer issue; non-critical bug; cosmetic | Within 24 hours | Founder only |

**Workflow (SEV-1 / SEV-2):**

1. **Acknowledge** within 30 minutes (status page + internal log entry).
2. **Triage** — what failed, how, who affected, can it be contained.
3. **Communicate** — affected customers within 4 hours (SEV-1) / 24 hours (SEV-2). Email + status page.
4. **Resolve** or apply workaround.
5. **Post-mortem** within 7 days. Filed in `incidents/`. Quarterly review.

**Communication template (SEV-1 customer notice):**

```
Subject: VerifIQ incident notice — {{summary}}

{{first_name}},

At {{time}} {{date}}, we detected {{brief description}}. {{Impact on
your service}}. The incident is {{contained / under investigation /
resolved}}.

What we did:
{{numbered list}}

What we recommend you do:
{{numbered list, often "nothing — we have handled this for you"}}

Next update by: {{time}}.

I am the responsible contact: hello@verifiq.ie · {{phone if SEV-1}}.

— Liam
```

**On-call:** Founder is sole on-call during pilot phase. Email + phone monitored 09:00-22:00 Mon-Fri local. Outside hours, target acknowledgement within 4 hours.

---

## 7 · Article 22 Position Statement

**GDPR Article 22:** Right not to be subject to a decision based solely on automated processing producing legal or similarly significant effects.

**VerifIQ's position:** Our output is information to a registered design professional, not a decision affecting any data subject. Findings surface candidate items for the professional to read; the professional decides whether to act, how to act, and on what timeline. No automated decision is made about any individual.

**Implication:** Article 22 is not directly triggered by VerifIQ's processing. The position is documented internally and referred to in the Privacy Notice. Where customer or regulator queries the position, the response references this statement and offers DPIA review.

**Caveat:** If the product evolves to make automated decisions about individuals (e.g., scoring contractor bids, ranking architects, ranking patient applications) the Article 22 position must be re-examined and explicit consent or contractual basis confirmed. **Current product does none of these — but the boundary is flagged for any future feature.**

---

## 8 · Cookie + Tracking Posture

**Cookies set by VerifIQ:**

- `viq_session` — authentication session (strict necessary, no consent required).
- `viq_fp_v1` — browser fingerprint for abuse prevention (strict necessary, no consent required, documented in Privacy Notice).

**Cookies set by sub-processors:**

- Stripe checkout: necessary for payment processing.
- Clerk: necessary for authentication.

**No marketing cookies. No retargeting. No social-media trackers.**

**Analytics:** Plausible Analytics — cookie-free, no personal data, EU-hosted. No consent banner required for analytics specifically; cookie consent banner shown on first visit for transparency on session/fingerprint cookies.

---

## 9 · Sub-processor Onboarding Checklist

Before adding any new sub-processor:

- [ ] Identify need (what processing requires this sub-processor)
- [ ] Confirm sub-processor has published DPA / SCCs
- [ ] Confirm EU data residency for processing of EU-origin data (or SCCs in place)
- [ ] Confirm security certifications (SOC 2 Type II or ISO 27001 typical floor)
- [ ] Add to public sub-processor list (`sub-processors.html`)
- [ ] Notify existing customers via email at least 30 days before processing begins
- [ ] Document in `sub-processors/{{name}}/onboarding.md` — purpose, data flows, retention, security review
- [ ] Sub-processor reviewed annually thereafter

**Sub-processor removal:** Same notification timeline; data migrated before cut-over.

---

## 10 · Annual Review Calendar

| Month | Review |
|---|---|
| March | DPIA refresh; AI Act technical documentation update |
| June | Sub-processor list review; cyber insurance renewal review |
| September | Privacy Notice + TOS review; tariff / pricing review |
| December | Annual compliance audit (self-assessment); incident retrospective; next-year planning |

---

*End of compliance SOPs — v0.1*
