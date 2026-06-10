# VerifIQ — Phase 2 Solicitor Brief

**Doc ID:** `verifiq-solicitor-brief-v0.1`  
**To:** GovIQ Ltd retained solicitor  
**From:** Liam Doolan, Director, GovIQ Ltd  
**Re:** VerifIQ product line — pre-launch legal pack (Ireland)  
**Date:** 2026-06-01

---

## Executive summary

GovIQ Ltd is launching VerifIQ as a product line — not a separate entity. VerifIQ is a software-based reading aid for tender packs and design documents, sold to chartered design professionals in Ireland. We need a Phase 2 legal pack in place before the first paid customer:

1. **Terms of Service** — VerifIQ rider on the existing GovIQ MSA.
2. **Privacy Notice** — VerifIQ-specific, mirroring GovIQ posture with additional sub-processor disclosure.
3. **Data Processing Agreement template** — for B2B customers, GDPR Article 28 compliant.
4. **Tech E&O insurance rider language review** — coordinate with carrier on uplift language.

**Budget:** €1,500–€3,000 fixed quote requested.  
**Timeline:** Quote within 7 days; deliverables within 21 days of engagement.

---

## Background

The full strategic + legal frame is in five internal docs that I can share in the same email:

- Doc 13 — Global Legal Council (multi-jurisdiction posture; Irish section is the one binding here)
- Doc 15 — Shoestring Bootstrap (operational frame for VerifIQ inside GovIQ)
- Doc 16 — Solo Reviewer Phase (current reviewer scope and honesty rules)
- Doc 20 — Compliance SOPs (DPIA, DSR, breach, refund, SLA, incident, Article 22)
- The full website at `verifiq.ie` with the locked language already published

The key positioning is non-negotiable and is locked into the design of the product:

> *VerifIQ is a software-based reading aid. It surfaces, in the documents' own words, what a registered professional may wish to read closely. It does not certify, sign, opine, or substitute for professional judgement. The registered designer reads our output, exercises their own judgement, verifies locally, and signs. The professional indemnity remains theirs. We carry product-quality risk only.*

Every contractual instrument must defend this posture.

---

## Specific deliverables required

### Deliverable 1 — Terms of Service (VerifIQ rider on GovIQ MSA)

**Form:** A rider/addendum to the existing GovIQ Ltd Master Services Agreement, not a standalone document — so customers contract with GovIQ Ltd, with VerifIQ as the named product.

**Core clauses needed (Irish-law-governed, Irish-courts):**

1. **Service description.** "VerifIQ provides a software-based document-reading aid for use by registered design professionals. The Service surfaces, in the documents' own words, items that may merit closer reading. It is not a certification, regulated service, or substitute for professional judgement."

2. **No regulated service / no statutory role.** "The Service is not a regulated service under the Building Control Act 1990 or the Architects Act 2007. The Service does not act as Design Certifier, Assigned Certifier, or any other person to whom statutory functions are assigned. The Service does not constitute the provision of architectural, engineering, surveying, or fire-safety services within the meaning of the relevant Acts."

3. **No professional opinion.** "No part of the Service constitutes architectural, engineering, surveying, fire-safety, or any other professional opinion within the meaning of any applicable Act. Customer acknowledges that all output is indicative and that Customer or Customer's registered professionals are solely responsible for verification, decision-making, and certification."

4. **Customer obligations.** "Customer warrants that documents uploaded are owned by Customer or uploaded with appropriate permission, do not contain personal data of any person from whom consent has not been obtained for processing as described, and do not contain content subject to legal privilege or export-controlled material."

5. **Limitation of liability.** Standard B2B-permissible: aggregate liability capped at fees paid in preceding 12 months; no liability for indirect / consequential / loss of profit / loss of contract / loss of goodwill; carve-out for death/personal-injury negligence, fraud, and anything non-excludable under Irish law.

6. **No fitness-for-purpose beyond stated.** "The Service is provided for the purpose described and no other. Customer must not rely on the Service for safety-critical decisions without exercising independent professional judgement and verification."

7. **Indemnity by Customer for misuse.** "Customer shall indemnify GovIQ Ltd against claims arising from Customer's use of the Service outside the stated purpose, Customer's reliance on output without verification, or Customer's misrepresentation of the Service to third parties."

8. **Termination + data return.** "On termination, Customer's documents are returned or deleted at Customer's election within 14 days. Hashes for abuse-prevention purposes are retained 90 days."

9. **Refund / re-run.** Material complaint on a finding within 14 days → free re-run of affected discipline. Platform failure → full refund. (Per Doc 20 Section 4.)

10. **Reviewer scope acknowledgement.** Customer acknowledges the Solo Reviewer Phase policy — full text linked, customer ticks acceptance at signup that findings outside reviewer discipline are marked "AI-surfaced · pending chartered review."

11. **Sub-processor list.** Acknowledges the published list at `verifiq.ie/sub-processors`; 30-day notification of material changes.

12. **Governing law / jurisdiction.** Irish law; Irish courts.

**Specific carve-outs / Acts to reference:**

- Building Control Act 1990
- Building Control (Amendment) Regulations 2014 (SI 9/2014)
- Architects Act 2007
- Consumer Protection Act 2007 (we are B2B but the Act sometimes still applies to sole-practitioner customers)
- Sale of Goods and Supply of Services Act 1980

---

### Deliverable 2 — Privacy Notice

**Form:** Standalone HTML / PDF page at `verifiq.ie/privacy.html`.

**Sections required:**

1. Identity of controller (GovIQ Ltd, address, DPC registration number, contact `privacy@verifiq.ie`).
2. What data we collect — user data, billing data, document content (for duration of scan), document hashes (90 days), inference logs (30 days).
3. Lawful bases — contract performance (Article 6(1)(b)); legitimate interest for abuse prevention.
4. Purposes of processing — strictly limited to producing findings register.
5. Recipients / sub-processors — link to `sub-processors.html`.
6. International transfers — none for IE/EU customers; for other markets, SCCs / adequacy decision.
7. Retention — documents 14 days; hashes 90 days; logs 30 days; audit logs per tier (2 or 7 years).
8. Rights — Article 15-22; how to exercise; 14-day response target.
9. No automated decisions affecting individuals — Article 22 position (per Doc 20 Section 7).
10. No training of AI models on customer documents.
11. Cookie notice — strict-necessary only; analytics cookie-free (Plausible).
12. Right to complain to Data Protection Commission (Ireland).
13. Update history / version.

**Important framing:** the Privacy Notice must reference VerifIQ as a product of GovIQ Ltd — not as a separate controller. Single legal entity (GovIQ Ltd) is the controller for both products.

---

### Deliverable 3 — Data Processing Agreement template (B2B)

**Form:** Standard Article 28-compliant DPA, executable as schedule to the MSA rider. Customer signs at first paid scan.

**Standard clauses:**

- Subject matter / duration / nature / purpose of processing.
- Categories of data subject + type of personal data.
- Controller obligations / processor obligations.
- Sub-processor authorisation (general authorisation under Article 28(2) with 30-day objection right).
- Article 32 security measures (encryption at rest, access controls, audit log).
- Assistance with DSRs / DPIAs / breach notifications.
- Audit rights (annual, with reasonable notice; or compliance-report acceptance in lieu).
- Termination / return / deletion.
- SCCs incorporated by reference where customer is non-EU.

---

### Deliverable 4 — Tech E&O Rider language review

**Context:** GovIQ Ltd holds a Tech E&O policy with [carrier name]. We will request a VerifIQ rider uplift to €2m cover, monthly-paid. The carrier will likely provide rider wording; we'd like your eyes on the language to confirm:

- Coverage explicitly extends to VerifIQ activity (document-scanning aid for design professionals).
- No exclusion for "AI-generated output" or, if such exclusion exists, the carve-back appropriately covers VerifIQ.
- No exclusion for processing of healthcare-adjacent design documents (we operate on healthcare facility design packs — NOT patient records).
- Locked-language disclaimer language acceptable to carrier as defensive posture.
- Retroactive date appropriate for first paid scan.

We will share the carrier's draft rider with you within 2 weeks.

---

## Reviewer scope / honesty position

You should be aware that VerifIQ operates in a **Solo Reviewer Phase** during pilot cohort:

- Liam Doolan is the sole chartered-reviewer signing audit logs on every paid pack within his discipline (procurement / contract / coordination).
- Findings outside that discipline are surfaced but marked "AI-surfaced · pending chartered review" until specialists join.
- The full policy is at `verifiq.ie/solo-reviewer-policy.html` and is referenced contractually so customers contractually accept this posture before paid scan.

The TOS rider must reflect this — specifically clause 10 (Reviewer scope acknowledgement).

---

## What I do NOT need from this engagement

- Trademark filings (separate engagement when triggered)
- Cyber / GL / D&O insurance (separate from Tech E&O rider; arranged through GovIQ's broker)
- Standalone VerifIQ incorporation (we are deliberately NOT incorporating separately)
- UK / EU / AU / CA / US legal advice (separate engagements when those markets are entered)
- Detailed AI Act compliance (defer to EU launch — separate Phase 4 work)

---

## Timeline + commercial

- **Quote requested by:** 2026-06-08 (one week).
- **Engagement signed by:** 2026-06-15.
- **Deliverables in draft by:** 2026-06-29.
- **Final + countersigned by:** 2026-07-06.
- **First paid customer eligibility:** 2026-07-08 (subject to all four deliverables in place + insurance rider bound).

**Budget envelope:** €1,500–€3,000 fixed-fee preferred. Hourly acceptable if you have a strong estimate and a cap.

If any of the above looks like it expands the scope materially, please flag in your quote so we can scope down — the goal is the minimum legally-defensible pack to take first paid customer, not a comprehensive enterprise contract suite.

---

## Practical next step

Reply confirming:
1. Capacity to take this on within the timeline above.
2. Fixed-fee quote (or hourly with cap).
3. Anything in the brief that's missing or needs reframing.

Happy to talk through it in 30 mins if useful — my calendar: [calendar_link].

Thanks,

Liam Doolan  
Director, GovIQ Ltd  
liam@goviq.ie · [phone] · Dublin

---

*End of solicitor brief — v0.1*
