# VerifIQ — Shoestring Bootstrap (Ireland, today)

**Doc ID:** `verifiq-bootstrap-v0.1`  
**Status:** Operating plan · For founder execution this week  
**Frame:** VerifIQ is a product line INSIDE GovIQ Ltd. It does not incorporate separately. It inherits GovIQ's company entity, banking, contracts pack, accountant relationship, brand parent, and core infrastructure. Only the **VerifIQ-specific increment** is real new cash spend.  
**Purpose:** Get VerifIQ live in Ireland this week on minimum incremental spend. Sequence the legitimization upgrades as paying customers materialise.  
**Date:** 2026-06-01

---

## The frame

Doc 14 modelled VerifIQ as a standalone company at €442k year-1 spend. That model is now superseded. VerifIQ is launched as a product line inside GovIQ Ltd, which means most of those line items are already paid for or are marginal additions to an existing cost base.

This document re-bases the numbers on the parent-entity reality, lists the **incremental** spend by phase, and identifies the legal and operational red lines that cannot be cut even on a shoestring.

---

## What VerifIQ inherits from GovIQ — €0 incremental

| Inherited from GovIQ | Saved vs standalone (Doc 14 figure) |
|---|---|
| Company incorporation, CRO filings, registered office | €1,200 |
| Founders' agreement, basic cap table | €3,500 |
| Standard B2B contracts pack (MSA shell) | €5,500 |
| Bank account, Revolut Business / AIB business | €1,200 |
| Stripe account + Stripe Tax onboarding (VAT) | €1,200 |
| Accountant relationship + Xero | €8,400 |
| Tech E&O base policy (rider added for VerifIQ) | €18,000 of €22,000 |
| Vercel + Convex + Anthropic + OpenAI base accounts | €5,000–€10,000 of B-bucket |
| Brand parent identity + design system + website chrome | already built |
| Founder time (not cash) | n/a |
| **Total inherited** | **~€45,000–€55,000 saved vs standalone** |

This is the leverage. The VerifIQ-specific true new cash is everything below.

---

## Phase 1 — Today (this week) · Get VerifIQ live

**Cash budget: €120–€500.**

### Items to action this week

| Line | Item | Cost | Status now |
|---|---|---|---|
| 1 | Buy `verifiq.ie` (and `.com` if available, defensive) | €15–€60 | Action today |
| 2 | DNS + email forward `hello@verifiq.ie` → existing GovIQ inbox | €0 | Action today |
| 3 | Deploy current website to Vercel under GovIQ org | €0 | Action today |
| 4 | Add VerifIQ as a product page on GovIQ Ltd website (one-liner + link) | €0 | Action this week |
| 5 | Stripe Products created under existing GovIQ Stripe — Tier I–V SKUs | €0 | Action this week |
| 6 | Anthropic + OpenAI prod keys provisioned under GovIQ org, VerifIQ tag | €0 | Action this week |
| 7 | Convex prod deployment in EU-West under GovIQ workspace | €0 (free tier) | Action this week |
| 8 | Top up Anthropic credits for testing (already exists at GovIQ) | €50–€200 | Action this week |
| 9 | LinkedIn page "VerifIQ — A GovIQ product" | €0 | Action this week |
| 10 | First reviewer-panel chair conversation booked (no honorarium yet) | €0 | Action this week |
| **Total** | | **€65–€260** | |

### What goes live this week

- `verifiq.ie` serves the existing website (`index.html`, `cad-library.html`, `scan-result-free.html`, `onboarding-wizard.html`, `dashboard-live.html`, `legal-notice.html`).
- The locked disclaimer is already on every page.
- The legal-notice page already carries the per-jurisdiction text.
- Stripe checkout for Tier I–V is wired (test mode for now).
- VerifIQ has a public face. Anyone you mention it to can see it.

### What does NOT go live this week

- Free taster scan flow — the back-end pipeline isn't yet wired to the front-end. The page exists; the engine does not. **You are showing a product, not yet running a product.**
- Paid customer onboarding — needs basic legal + insurance check before first euro changes hands (see Phase 2).
- Reviewer panel — operational only when a real pack needs reviewing (Phase 2/3).

### What you say this week if asked

> "We're in private pilot. The platform reads at scale this month; first signed customers in [target month]. If you'd like to be on the pilot list, here's the brief request page."

That's it. No oversell, no hype. The page itself does the selling.

---

## Phase 2 — Weeks 2–4 · Make it legal to take money

**Cash budget: €1,800–€3,500.**

The instant a paying customer is in sight, the following items become non-negotiable. Until they exist, free scans only.

### Items to action

| Line | Item | Cost | Why |
|---|---|---|---|
| 11 | Solicitor pass on VerifIQ-specific TOS addendum (riders on GovIQ MSA) | €800–€1,500 | First customer can't sign without it |
| 12 | Solicitor pass on VerifIQ Privacy Notice + Sub-processor list | €400–€800 | GDPR pre-launch requirement |
| 13 | Insurance — VerifIQ rider on existing GovIQ Tech E&O (uplift to €2m) | €600–€1,200 (yr 1, monthly) | Tech E&O carrier acceptance |
| 14 | Stripe Tax verified, VAT registration confirmed under GovIQ Ltd | €0 | Required for B2B invoicing |
| 15 | DPA template (drafted from existing GovIQ DPA) | €0–€400 | Each customer signs this |
| **Total Phase 2** | | **€1,800–€3,900** | |

After Phase 2 closes, VerifIQ can accept paid customers legally.

### What you must do, not buy

- Publish the sub-processor list on the website (free — write it once).
- Stand up a real DPIA per the locked-language schedule (free — founder time).
- Lock the marketing verb whitelist with anyone writing customer-facing copy (free).
- Designate a Data Protection contact (founder by default; outsource later).

---

## Phase 3 — Months 2–4 · Make it serious enough to charge full price

**Cash budget: €5,000–€12,000.**

You've taken first paid customer. Now you legitimise to the point where a chartered architect would be embarrassed NOT to use you.

### Items to action

| Line | Item | Cost | Trigger |
|---|---|---|---|
| 16 | Reviewer panel chair retained — equity-share + first honorarium | €0 cash (equity), €1,500 first honorarium | First paid pack |
| 17 | 3–4 panel reviewers onboarded — deferred honorarium until pack 3 | €0 → €4,500 over Phase 3 | Pack-by-pack honorarium |
| 18 | Trademark filing — VerifIQ wordmark + monogram, IPOI Ireland | €380–€650 | Once €5k revenue confirmed |
| 19 | Insurance — full Tech E&O €2m at proper underwriting (replace rider) | €2,200 extra annually | After 3 customers paying |
| 20 | Accountant — full monthly close on VerifIQ revenue line | €1,200 (extra) | Monthly thereafter |
| 21 | One case-study artefact — designed, anonymised, published | €2,000–€4,500 | Pre-month-4 — funnel-critical |
| 22 | First marketing spend — RIAI conference attendance | €600–€1,200 | Quarterly |
| **Total Phase 3** | | **€7,880–€15,550** | over 3 months |

---

## Phase 4 — Months 4–9 · Properly capitalised before seed raise

**Cash budget: €25,000–€55,000 above Phases 1–3.**

You've got 5–10 paying customers, panel operational, case study live. You're now preparing for seed close at month 9.

### Items to action

| Line | Item | Cost | Trigger |
|---|---|---|---|
| 23 | EUIPO trademark filing — wider EU protection | €1,500–€2,800 | Pre-UK expansion talk |
| 24 | Insurance — Cyber €1m + GL €2.5m + D&O €1m | €5,500–€8,500 | Pre-seed close |
| 25 | Standards subscription — NSAI proper licence (if not already free) | €4,500–€8,200 | Once corpus loader exists |
| 26 | Contract engineer — 8 weeks senior to harden platform | €18,000–€32,000 | Once revenue covers half |
| 27 | Founder salary catch-up + part-year sales hire (Phase 4 end) | €0 or up to €15,000 | Optional, post-bridge |
| 28 | Trademark — UK IPO filing | €170 + counsel €600 | Pre-UK launch announce |
| **Total Phase 4** | | **€29,670–€67,070** | over 5 months |

---

## Cumulative incremental cash — VerifIQ inside GovIQ

| Phase | Window | Incremental cash | Cumulative |
|---|---|---|---|
| 1 — Live | This week | €65–€260 | €260 |
| 2 — Legal to charge | Weeks 2–4 | €1,800–€3,900 | €4,160 |
| 3 — Properly serious | Months 2–4 | €7,880–€15,550 | €19,710 |
| 4 — Pre-seed credible | Months 4–9 | €29,670–€67,070 | €86,780 |
| **Year-1 total — VerifIQ-incremental** | | | **€86,780 (mid)** |

**Compared to standalone Doc 14 figure of €442k–€460k year 1, VerifIQ inside GovIQ runs at ~€87k incremental — 19% of standalone cost.**

The €355k–€370k saving is real and significant. It's the structural advantage of being a product line, not a company.

---

## Red lines — what cannot be cut, even on a shoestring

These are legal, ethical, and operational floors. If you find yourself contemplating skipping one of these to save money, you have made a mistake — stop and re-think.

1. **Locked disclaimer on every customer surface.** Already done. Cannot be removed. The legal posture depends on it being visible.
2. **TOS + Privacy Notice in place before first paid scan.** Phase 2 item. No exceptions.
3. **Tech E&O insurance in place before first paid scan.** Even at the lowest €600/yr monthly-paid tier. No exceptions.
4. **Sub-processor list published.** Anthropic, OpenAI, Stripe, Convex, Vercel, Clerk, Resend — listed transparently. GDPR floor.
5. **No marketing language that uses banned verbs.** "Verify," "certify," "approve," "comply," "validate," "guarantee," "sign off" — banned in customer-facing copy. Use whitelist verbs only.
6. **Chartered Irish reviewer on every paid pack.** Even the first one. If your panel chair is the only reviewer, all packs go to them. Pay them a honorarium per pack from gross revenue.
7. **EU data residency for every customer document.** Convex EU-West (Dublin) only. No US-region defaults.
8. **No US healthcare packs, ever, until a BAA is in place.** Not even free. Refuse the upload at the file-type / sector classification step.
9. **14-day document deletion + 90-day hash retention enforced in code.** Don't rely on "we'll do it manually." It must be a scheduled job from day 1.
10. **No model training on customer documents.** Locked Anthropic + OpenAI policies confirmed. Stamped on the privacy notice.

If a corner-cut would touch any of these, it is not a corner-cut. It is a fault.

---

## Shoestring versions of the things people overspend on

### Reviewer panel

**Overspend version:** 11-seat panel signed at €3.5–€6.8k each per year before any revenue.

**Shoestring version:** One panel chair retained on equity participation (1–3% of VerifIQ-line revenue or 0.5% of GovIQ equity, whichever they prefer), plus deferred honorarium per reviewed pack (€150–€350 per pack, paid from each invoice). Add 2 more panel reviewers same model after pack 3. Full 11-seat panel only after seed close.

### Insurance

**Overspend version:** €22k Tech E&O annual prepay year 1.

**Shoestring version:** Rider on GovIQ's existing Tech E&O policy for VerifIQ activity (€600–€1,200 monthly-paid Phase 2). Uplift to proper standalone €2m tower in Phase 4 (~€2,200 extra annually) once 3 customers are paying.

### Standards subscriptions

**Overspend version:** NSAI + paid feeds + BSI subscription €8–€15k year 1.

**Shoestring version:** Use only free standards for Phase 1–3 — TGD A–M (free download), BCAR SI 9/2014 (free), CWMF / PW-CF (free from OGP), HBN/HTM where free. Defer NSAI subscription until corpus loader is built and customer base justifies the licence (Phase 4 trigger).

### Marketing

**Overspend version:** €18–€24k cash marketing year 1, conference booths, sponsored articles, PR retainer.

**Shoestring version:** €0 cash month 1–3. From month 4, only spend on: (a) one case-study artefact (€2–€4.5k — funnel-critical), (b) one RIAI / Engineers Ireland conference attendance per quarter (€600–€1,200). Everything else is LinkedIn organic + warm intros via panel chair + direct outreach.

### Office

**Overspend version:** Dogpatch Labs at €400+/month.

**Shoestring version:** €0. Remote-first. Coffee shop or kitchen table. Meet customers at theirs.

### Hires

**Overspend version:** Engineer hired month 4 at €52k–€85k.

**Shoestring version:** Founder + contract engineering only for Phase 1–3. First real hire only post-seed close (post month 9). If a contractor is needed before then, fixed-scope 4–8 week engagement, not employment.

### Brand / design / website

**Overspend version:** Agency brief, €15k–€40k.

**Shoestring version:** Already built. No further spend needed.

### Accountant + bookkeeping

**Overspend version:** Full retainer at €8,400 year 1.

**Shoestring version:** Inherited from GovIQ. Marginal addition only — likely €1,200 extra annually once VerifIQ revenue line opens.

---

## Sequencing the upgrades — trigger map

The shoestring stays shoestring until each upgrade is *triggered* by a fact. Don't pre-spend.

| Upgrade | Trigger | Spend |
|---|---|---|
| TOS + Privacy solicitor pass | First customer interest serious | €1,200 |
| Tech E&O rider | First customer asks for proof | €600–€1,200 |
| Panel chair honorarium starts | First pack reviewed | €1,500 |
| Trademark filing IE | €5k cumulative revenue | €380–€650 |
| Standards NSAI subscription | Corpus loader built, 5+ customers | €4,500–€8,200 |
| Case study artefact | Month 3 OR first signed pilot, whichever first | €2,000–€4,500 |
| Conference attendance | Speaker slot offered (not booth-only) | €600–€1,200 each |
| EUIPO trademark | Pre-UK expansion announce | €1,500–€2,800 |
| Cyber + GL + D&O policies | Pre-seed close | €5,500–€8,500 |
| First contract engineer | Revenue covers 50% of cost | €18k–€32k |
| First hire (employee) | Post-seed close | €52k–€85k |
| Multi-region infra | First UK customer | €12k (in UK setup) |

---

## What this week looks like in actions

**Today (Monday):**
- Buy `verifiq.ie` on a registrar. €15.
- Add `hello@verifiq.ie` forwarder. €0.
- Deploy current `verifiq26/website/` to Vercel under the GovIQ Ltd Vercel org. €0.
- Set up a GovIQ Stripe product called "VerifIQ — Pilot Pack" with Tier I–V SKUs in test mode. €0.

**Tuesday–Wednesday:**
- LinkedIn page for VerifIQ as a GovIQ product. €0.
- Identify the candidate reviewer panel chair (the chartered architect or assigned certifier you trust most). Book the conversation.
- Draft the Phase 2 solicitor-instructions email (one paragraph: TOS rider, Privacy Notice, sub-processor list, all building on the existing GovIQ contract pack).

**Thursday–Friday:**
- Send the solicitor email — quote requested for Phase 2 deliverables.
- Send 5 personal LinkedIn messages to chartered architects in your network with a soft "we've put together something I'd value 15 minutes on" framing.
- Set up the EI HPSU application (free, ~3 hours).

**Total cash out this week: €65–€260.**

---

## The single sentence that holds this plan together

> *VerifIQ ships from inside GovIQ this week on €260 of incremental cash, becomes legal to charge in week 4 on €4k cumulative, becomes properly serious by month 4 on €20k, and is pre-seed credible by month 9 on €87k — one-fifth the standalone cost, with every red-line held intact.*

---

*End of bootstrap plan — VerifIQ inside GovIQ · v0.1*
