# VerifIQ — Transactional Email Templates

**Doc ID:** `verifiq-emails-v0.1`  
**Purpose:** All five transactional email templates for Resend. Plain text / minimal HTML. Locked disclaimer in every footer.  
**Voice:** Founder, sober, no startup-speak. Sentence case. Em dashes.  
**Date:** 2026-06-01

---

## 1 · Welcome — Free-Tier Signup

**Subject:** Your VerifIQ pilot account — what happens next

**From:** Liam Doolan <hello@verifiq.ie>

**Body:**

```
Hi {{first_name}},

Thanks for signing up. VerifIQ is in pilot cohort and {{practice_name}}
is on the list.

What happens next:

1. You can run your free taster scan whenever you're ready — one
   discipline, up to 20 documents, counts plus one worked finding.
   The full register is held behind the paywall.

2. The taster scan takes about 22 minutes end-to-end. You'll get an
   email when it's ready to view.

3. If you'd like a real pre-tender read — full register, source-quoted
   findings, RFI register, reviewer-signed audit log — you can pick a
   tier on the pricing page or talk to me directly.

The pilot reviewer is me. I personally sign every paid pack within my
discipline (procurement, contract-form, document hygiene, cross-document
coordination). Findings outside that discipline are surfaced and marked
"AI-surfaced · pending chartered review" until the relevant specialist
joins the cohort. The full policy is on the site.

If anything is unclear, hit reply. The concierge is one person — me.

— Liam
Founder, VerifIQ (a GovIQ Ltd product)
hello@verifiq.ie · Dublin

— — —
Locked disclaimer:
VerifIQ is a software-based reading aid. It does not certify, sign,
opine, or substitute for professional judgement. The registered
designer verifies locally and retains all professional responsibility.
Legal · per jurisdiction: https://verifiq.ie/legal-notice.html
Unsubscribe: {{unsubscribe_url}}
```

---

## 2 · Free Scan Complete

**Subject:** {{pack_name}} — your free scan is ready · {{critical_count}} critical, {{high_count}} high

**Body:**

```
{{first_name}},

Your free taster scan on {{pack_name}} ({{file_count}} files,
{{discipline}}) is in.

Headline counts:

  · {{critical_count}} critical
  · {{high_count}} high
  · {{medium_count}} medium
  · {{low_count}} low

One finding shown in full on the page — verbatim source quote, page
reference, recommended action. The remaining findings, source quotes
on every one of them, the RFI register, and a reviewer-signed audit
log are held behind the paywall.

Open your result: {{result_url}}

If the counts above show the kind of issues that matter for {{pack_name}},
the full Tier {{recommended_tier}} read at €{{tier_price}} unlocks the
register, the source quotes, the RFI register, and the chartered-reviewer
sign-off.

Or talk to me directly: hello@verifiq.ie.

The taster result is held for 14 days, then hashed-deleted.

— Liam

— — —
Locked disclaimer:
VerifIQ is a software-based reading aid. Indicative output only.
Legal · per jurisdiction: https://verifiq.ie/legal-notice.html
Unsubscribe: {{unsubscribe_url}}
```

---

## 3 · Paid Scan Released

**Subject:** {{pack_name}} — your reviewer-signed register · {{total_findings}} findings

**Body:**

```
{{first_name}},

Your full read on {{pack_name}} is released. Reviewer-signed audit log
attached.

Summary:

  · {{total_findings}} findings across {{discipline_count}} disciplines
  · {{critical_count}} critical · {{high_count}} high · {{medium_count}}
    medium · {{low_count}} low
  · {{rfi_count}} RFI candidates drafted
  · Coordination cross-pass complete
  · End-to-end: {{turnaround_hours}} hours

Attached:

  1. {{pack_name}}-register.xlsx — the full findings register
  2. {{pack_name}}-rfi.docx — the RFI register, CA-routed format
  3. {{pack_name}}-audit-log.pdf — reviewer initials, timestamps,
     corpus versions stamped on every finding
  4. {{pack_name}}-cover.pdf — release cover with locked disclaimer

Reviewer: {{reviewer_initials}}, {{reviewer_title}}.
{{out_of_scope_count}} findings carry the "AI-surfaced · pending chartered
review" marking — these are in the register, separately tagged.

If you raise a material complaint within 14 days, we re-run the affected
discipline at no charge.

Documents are deleted from VerifIQ storage on {{deletion_date}}.
Hashes retained for 90 days for abuse prevention only.

Thank you for the pilot engagement.

— Liam

— — —
Locked disclaimer:
VerifIQ is a software-based reading aid. It does not certify, sign,
opine, or substitute for professional judgement. The registered
designer verifies locally and retains all professional responsibility.
Legal · per jurisdiction: https://verifiq.ie/legal-notice.html
```

---

## 4 · Paywall Hit — Upgrade Prompt

**Subject:** {{pack_name}} — the full register is behind the paywall

**Body:**

```
{{first_name}},

You've looked at your free taster on {{pack_name}}. The counts told you
the shape: {{critical_count}} critical, {{high_count}} high.

The full register, every source quote, the RFI register, and the
reviewer-signed audit log are behind the paywall.

For this pack size ({{file_count}} files, {{discipline_count}} disciplines),
the right tier is Tier {{recommended_tier}} at €{{tier_price}} per pack,
or €{{seat_price}} for an annual seat covering unlimited Tier {{recommended_tier}}
packs for {{practice_name}}.

Early-pilot 30% applies — {{seats_remaining}} of 10 pilot seats remaining.
That brings the per-pack rate to €{{discounted_price}} for {{practice_name}}.

Continue this pack: {{checkout_url}}
Or talk first: reply to this email.

The taster result is held until {{deletion_date}}, then deleted.

— Liam

— — —
Locked disclaimer:
VerifIQ is a software-based reading aid. Indicative output only.
Legal · per jurisdiction: https://verifiq.ie/legal-notice.html
Unsubscribe: {{unsubscribe_url}}
```

---

## 5 · Concierge Reply Template

**Subject:** {{customer_subject}}

**Body:** (founder writes per-customer; this is the starter)

```
Hi {{first_name}},

Thanks for reaching out about {{topic}}.

[FOUNDER WRITES TWO-THREE PARAGRAPHS — SUBSTANTIVE, NOT BOILERPLATE.
ADDRESS THE SPECIFIC QUESTION. BE HONEST ABOUT SCOPE, PRICING, REVIEWER
DISCIPLINE COVERAGE, TIMING, OR WHATEVER WAS ASKED.]

If you'd like to talk through it, I'm in Dublin and happy to grab 15
minutes on Zoom or coffee. My calendar: {{calendar_link}}.

If you'd rather just send a pack across and see the method in action,
the free taster runs from here: https://verifiq.ie/scan-result-free.html

— Liam
Founder, VerifIQ (a GovIQ Ltd product)
hello@verifiq.ie · {{phone_if_relevant}} · Dublin

— — —
Locked disclaimer:
VerifIQ is a software-based reading aid. It does not certify, sign,
opine, or substitute for professional judgement.
Legal · per jurisdiction: https://verifiq.ie/legal-notice.html
```

---

## Implementation notes

- All sends via Resend with `from: hello@verifiq.ie`, `reply-to: hello@verifiq.ie`.
- Variables in `{{double_braces}}` are Resend template variables.
- Templates 1–4 are automated. Template 5 is manual founder send (use Gmail / Apple Mail).
- HTML version: render each template inside the bone-paper aesthetic — IBM Plex Serif headings, Plex Sans body, brass accents, locked-disclaimer block in a paper-bg footer.
- Plain-text version: as above. Most chartered architects / engineers / QSs read email in plain text or with images blocked — the plain version must stand alone.
- Footer disclaimer is mandatory on every send. Locked language only.

---

*End of email templates — v0.1*
