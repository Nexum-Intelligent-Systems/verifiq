# VerifIQ — Full Action Backlog

**Doc ID:** `verifiq-backlog-v0.1`  
**Status:** Master canonical list · "Everything else"  
**Owner:** Liam Doolan (founder)  
**Frame:** VerifIQ as product line inside GovIQ. Solo-reviewer phase. Shoestring path.  
**Date:** 2026-06-01  
**Update cadence:** Every Monday alongside PROJECT_PLAN.md

---

## 🎯 Critical Path — the 7 items that unlock everything else

If only seven things ship in the next 14 days, ship these in this order:

1. **Buy verifiq.ie + deploy current website to Vercel under GovIQ org** — public face, no excuses (already on task list as #61-63)
2. **Solicitor brief sent + Phase 2 quote received** — unblocks paid-customer eligibility (task #71)
3. **Tech E&O rider quote bound** — red-line item; unblocks paid customer (task #72)
4. **Sub-processor + Privacy + TOS pages live on site** — red-line items (task #73 plus two new)
5. **POC scan pipeline running end-to-end on one real pack** — proves the product works (task #74)
6. **First case study artefact published** — funnel-critical, drives 30+ inbound (no task yet)
7. **First paying pilot customer signed** — single most important business event (no task yet)

After these seven, everything else sequences against revenue, panel formalisation, and the seed-raise narrative.

---

## A · Website Surfaces

Categorised: build new, migrate existing, must-have-before-revenue (🔴), should-have (🟡), nice-to-have (⚪).

| # | Item | Priority | Owner | Est. | Notes |
|---|---|---|---|---|---|
| A01 | `pricing.html` — full pricing page | 🔴 | Claude | 2h | Already on task list #75. Expand from teaser. Live tier table, 30%-off pilot meter, VAT stamp, link to legal-notice. |
| A02 | `sub-processors.html` — list of Anthropic / OpenAI / Stripe / Convex / Vercel / Clerk / Resend | 🔴 | Claude | 45m | Red-line item before first paid scan. Already #73. |
| A03 | `privacy.html` — full Privacy Notice text | 🔴 | Liam + solicitor | external | Solicitor draft, ~€400-800. Section. |
| A04 | `terms.html` — full Terms of Service | 🔴 | Liam + solicitor | external | Solicitor draft, ~€800-1500. Sectioned + locked language. |
| A05 | `hunt.html` — migrate to engineering register | 🟡 | Claude | 2h | Currently dark indigo aesthetic. Rebuild with verifiq-system + cad.css. |
| A06 | `studio.html` — migrate to engineering register | 🟡 | Claude | 2h | Same as above. |
| A07 | `three-products.html` — refresh in engineering register | 🟡 | Claude | 1.5h | Comparator table for the three products. |
| A08 | `about.html` — founder bio + GovIQ context + reviewer roadmap | 🟡 | Claude | 1.5h | "Pilot reviewer · Liam Doolan" full bio. Discipline scope, charters held, qualifications. |
| A09 | `case-study-01.html` — 327-finding pack anonymised worked example | 🔴 | Claude + Liam | 3h | Funnel-critical. Ten findings reproduced with verbatim source quotes. Designed in engineering register. |
| A10 | `references.html` — three sectoral references expanded | ⚪ | Claude | 2h | Same content as index strip, more detail. |
| A11 | `solo-reviewer-policy.html` — public-facing version of Doc 16 | 🔴 | Claude | 1h | Honesty surface. Customer can read exactly what's in/out of scope per pack. |
| A12 | `404.html` — error page in brand | ⚪ | Claude | 20m | |
| A13 | `manifesto.html` — Doc 15 + Doc 16 narrative + locked disclaimer | ⚪ | Claude | 1.5h | Long-read version of the position. |
| A14 | Email signup endpoint wired (Resend / Formspree) | 🔴 | Liam | 30m | Currently pilot-form is JS alert only. |
| A15 | Stripe checkout wired from pricing page | 🔴 | Liam | 1-2h | Test → live mode. |
| A16 | OG / meta tags + favicon on every page | 🟡 | Claude | 30m | LinkedIn + share previews. |
| A17 | Analytics — Plausible or Fathom (privacy-respecting, EU-hosted) | 🟡 | Liam | 30m | €9-19/month. |
| A18 | RSS feed for case studies / updates | ⚪ | Claude | 30m | Later — when content cadence exists. |
| A19 | Sitemap.xml + robots.txt | 🟡 | Claude | 15m | SEO basic hygiene. |
| A20 | Cookie consent banner (EU minimum) | 🔴 | Claude | 1h | Required for analytics if used. Strict-necessary-only by default. |

**A-subtotal:** ~20 items. Critical-path subset: A01, A02, A03, A04, A09, A11, A14, A15, A20.

---

## B · Platform Engineering (POC → MVP)

The POC code scaffolding already exists in `src/convex/`. These items take it from scaffold to live.

| # | Item | Priority | Owner | Est. | Notes |
|---|---|---|---|---|---|
| B01 | Convex prod deployment EU-West stood up | 🔴 | Liam | 1h | Already #66. Free tier. |
| B02 | Schema deployed and indexed | 🔴 | Liam | 30m | From `src/convex/schema.ts`. |
| B03 | Magic-link upload flow live | 🔴 | Liam | 1d | ZIP upload → extraction → manifest. |
| B04 | Document SHA-256 hash dedup live (abuse-prevention layer 2) | 🔴 | Liam | half day | Red-line item from Doc 11. |
| B05 | Document classifier live (discipline + doc type) | 🔴 | Liam | 1d | From `actions/classify.ts`. |
| B06 | Per-discipline scan orchestrator live with budget enforcement | 🔴 | Liam | 1.5d | From `actions/scan.ts`. |
| B07 | Source-quote verification gate (3-stage strict/normalised/fuzzy) live | 🔴 | Liam | 1d | From `lib/source-quote.ts`. **Critical for trust.** |
| B08 | Coordination cross-pass live | 🟡 | Liam | 1d | From `actions/coordinate.ts`. |
| B09 | Reviewer queue UI live for admin | 🔴 | Liam | 1.5d | Reviewer sees pending findings, approves/rejects/edits, audit-log stamped. |
| B10 | Customer dashboard live (real data, not mockup) | 🟡 | Liam | 2d | `dashboard-live.html` wired to Convex. |
| B11 | Free-tier output shaper enforced in code (abuse layer 4) | 🔴 | Liam | half day | Counts + 1 worked finding only. Red-line. |
| B12 | 14-day document deletion scheduled job | 🔴 | Liam | 2h | Convex cron. Red-line. |
| B13 | 90-day hash retention scheduled job | 🔴 | Liam | 1h | Convex cron. Red-line. |
| B14 | 30-day inference log retention job | 🟡 | Liam | 1h | Convex cron. |
| B15 | Stripe checkout integration | 🔴 | Liam | 1d | Tier I-V SKUs, annual seats, early-pilot 30% promo code. |
| B16 | Clerk auth (multi-tenant) | 🔴 | Liam | 1d | Org + user model. |
| B17 | Resend email integration (welcome, scan complete, paywall hit, audit log released) | 🔴 | Liam | 1d | Five transactional templates. |
| B18 | Multi-provider AI failover wiring (Anthropic primary + OpenAI fallback) | 🟡 | Liam | half day | From `lib/anthropic-client.ts`. |
| B19 | PDF + XLSX export of findings register | 🔴 | Liam | 1d | Customer deliverable. |
| B20 | Audit-log writer (every reviewer action stamped) | 🔴 | Liam | half day | Required for trust. |
| B21 | Browser fingerprint capture (abuse layer 3) | 🟡 | Liam | half day | FingerprintJS open-source. |
| B22 | Email domain whitelist enforcement at signup (abuse layer 1) | 🔴 | Liam | 2h | Free-mail domain block. |
| B23 | Quarterly per-org rate limit (abuse layer 5) | 🟡 | Liam | 2h | One free scan per org per quarter. |
| B24 | Concierge override admin (abuse layer 6) | ⚪ | Liam | 4h | Manual approve/reject UI. |
| B25 | Free-tier compute weekly cap (€1,500/wk) | 🔴 | Liam | 2h | Auditor red-line from Doc 14. |
| B26 | Sentry error monitoring | 🟡 | Liam | 30m | Free tier sufficient initially. |
| B27 | Status page (status.verifiq.ie) | ⚪ | Liam | 2h | Defer to month 3+. |
| B28 | API rate limiting at platform edge | 🟡 | Liam | half day | Vercel or Cloudflare layer. |
| B29 | GDPR data-subject-request handling code | 🟡 | Liam | half day | Access / erasure / portability. |
| B30 | Backup + disaster recovery posture | 🟡 | Liam | half day | Convex handles most. Documented. |

**B-subtotal:** ~30 items. Critical path: B01-B07, B09, B11, B12, B13, B15, B16, B17, B19, B20, B22, B25. **About 12-18 days of engineering work** to reach MVP-ready-for-first-paid-customer state.

---

## C · Content & Brand Assets

| # | Item | Priority | Owner | Est. | Notes |
|---|---|---|---|---|---|
| C01 | One case study artefact — 327-finding pack anonymised | 🔴 | Liam + Claude | 1d | Funnel-critical. Designed, narrated, source-quoted, published as case-study-01.html. |
| C02 | Founder bio + photo for "Pilot reviewer" surface | 🔴 | Liam | 2h | Honest about charters held, years of practice, GovIQ context. |
| C03 | LinkedIn launch post copy | 🔴 | Liam | 30m | Announce verifiq.ie. |
| C04 | LinkedIn outreach copy template (5 variants) | 🔴 | Liam | 1h | For the 20-30 named target practices. Soft "15 minutes" framing. |
| C05 | Email template — welcome (new free-tier signup) | 🔴 | Claude | 30m | Resend template. |
| C06 | Email template — free scan complete (counts + paywall) | 🔴 | Claude | 30m | |
| C07 | Email template — paid scan released | 🔴 | Claude | 30m | With XLSX/PDF attached, audit log line, reviewer initial. |
| C08 | Email template — paywall hit (upgrade prompt) | 🟡 | Claude | 30m | |
| C09 | Email template — concierge reply | 🟡 | Liam | 30m | Founder voice. |
| C10 | Email signature with VerifIQ link | 🔴 | Liam | 10m | |
| C11 | Sales / pitch deck — 15 slides for pre-seed | 🟡 | Claude + Liam | 1d | Built from Docs 12, 14, 15. Speaking notes. |
| C12 | One-pager PDF (B2B "leave-behind") | 🟡 | Claude | 2h | For conference handouts. |
| C13 | Case study #2 — heritage refurb anonymised | ⚪ | Liam | when delivered | Triggered by Ref·02 customer engagement. |
| C14 | Case study #3 — Cat-A office anonymised | ⚪ | Liam | when delivered | Triggered by Ref·03 customer engagement. |
| C15 | Reference customer list (with permission) | 🟡 | Liam | ongoing | Maintained over time. |
| C16 | RIAI / Engineers Ireland / SCSI directory listings | 🟡 | Liam | 2h each | Free or low-cost member listings. |
| C17 | "Notes from the atelier" — recurring blog/note format | ⚪ | Liam | ongoing | Quarterly, not monthly. Quality over cadence. |
| C18 | Press release — pilot cohort opening | ⚪ | Liam | 2h | When 5+ paying customers. |

**C-subtotal:** ~18 items. Critical path: C01-C07, C10.

---

## D · Legal & Compliance Operational

| # | Item | Priority | Owner | Est. | Cash |
|---|---|---|---|---|---|
| D01 | Solicitor brief drafted and sent | 🔴 | Liam | 1h | €0 (Liam writes) |
| D02 | Solicitor engagement signed for Phase 2 pack | 🔴 | Liam + solicitor | external | €800-1500 |
| D03 | TOS — VerifIQ rider on GovIQ MSA | 🔴 | Solicitor | external | (in D02) |
| D04 | Privacy Notice — VerifIQ specific | 🔴 | Solicitor | external | €400-800 |
| D05 | Sub-processor list — public page (A02) + maintained schedule | 🔴 | Liam | 1h | €0 |
| D06 | DPA template (B2B) | 🔴 | Solicitor | external | (in D02) |
| D07 | Tech E&O rider quote + bind | 🔴 | Liam | 2h | €600-1200/yr monthly |
| D08 | DPIA documented (Data Protection Impact Assessment) | 🔴 | Liam | half day | €0. Internal doc. |
| D09 | Article 22 GDPR position statement (no automated decisions) | 🟡 | Liam | 2h | €0. Doc + public note. |
| D10 | EU AI Act technical documentation file (Article 11) | 🟡 | Liam | 1d | €0 until EU launch. Internal doc + customer artefact on request. |
| D11 | EU AI Act instruction-for-use document (Article 13) | 🟡 | Liam | half day | €0 until EU launch. |
| D12 | Trademark IE filing — VerifIQ wordmark + monogram | 🟡 | Liam + agent | external | €380-650 (trigger: €5k revenue) |
| D13 | EUIPO trademark filing — pre-UK announce | ⚪ | Liam + agent | external | €1500-2800 (Phase 4) |
| D14 | Cyber liability €1m bound | 🟡 | Liam | 2h | €500-1500/yr (Phase 4) |
| D15 | General liability €2.5m bound | 🟡 | Liam | 2h | €600-1200/yr (Phase 4) |
| D16 | D&O insurance €1m bound | ⚪ | Liam | 2h | €1000-2500/yr (Phase 4 / pre-seed) |
| D17 | Refund/re-run policy published | 🔴 | Liam | 1h | €0. Auditor's red-line. |
| D18 | Cookie consent banner (A20 ties here) | 🔴 | Claude | 1h | €0 |
| D19 | GDPR DSR procedure documented | 🟡 | Liam | 2h | €0. Internal SOP. |
| D20 | Breach notification template + 72-hour process | 🔴 | Liam | 2h | €0. Internal SOP. Required by Article 33. |
| D21 | Sub-processor onboarding checklist | 🟡 | Liam | 1h | €0. SOP. |
| D22 | DPO appointment (when revenue justifies) | ⚪ | Liam | when needed | €0-5k (outsourced) |

**D-subtotal:** ~22 items. Critical path: D01-D08, D17, D18, D20. **Total Phase 2 legal cash: €1,800-€3,500.**

---

## E · Go-to-Market

| # | Item | Priority | Owner | Est. | Notes |
|---|---|---|---|---|---|
| E01 | 20-30 named target Irish practices list (RIAI top 100 + EI top 50 + SCSI top 30, deduped) | 🔴 | Liam | half day | The actual outreach universe. |
| E02 | First wave of 5 LinkedIn outreach messages sent | 🔴 | Liam | 1h | Already #69. |
| E03 | Second wave of 5 messages — week 2 | 🔴 | Liam | 1h | After first replies analysed. |
| E04 | Third wave + first concierge calls — week 3 | 🔴 | Liam | half day | |
| E05 | RIAI 2026 Conference — speaking-slot application or booth scoping | 🟡 | Liam | 2h | €600-1200 attendance. Speaking slot saves cost. |
| E06 | Engineers Ireland Annual Conference — same | 🟡 | Liam | 2h | |
| E07 | SCSI events 2026 — same | 🟡 | Liam | 2h | |
| E08 | Plan Magazine / Engineers Journal sponsored article — quote | ⚪ | Liam | 1h | €2-4k each. Defer. |
| E09 | LinkedIn ads test — €300-800 spend | ⚪ | Liam | 2h | Defer to month 6+. |
| E10 | Inbound enquiry handling SOP | 🔴 | Liam | 1h | What happens between brief request and first call. |
| E11 | Demo script (15-min Zoom) | 🟡 | Liam | 2h | Cover product, position, pricing, free-tier offer. |
| E12 | Discovery questionnaire (pre-demo) | 🟡 | Liam | 1h | Sets the wizard from the brief. |
| E13 | Reference call protocol | ⚪ | Liam | 1h | When prospects ask "who else?" |
| E14 | Pilot kickoff template (after signature) | 🟡 | Liam | 2h | What we send the customer in week 1. |
| E15 | Customer success cadence (week 1, week 4, quarter end) | 🟡 | Liam | 2h | Process, not headcount. |
| E16 | Pricing-page launch announcement | 🟡 | Liam | 30m | LinkedIn post when A01 ships. |
| E17 | Case-study-01 launch announcement | 🟡 | Liam | 30m | LinkedIn post when C01 ships. |
| E18 | Partner conversations — RIAI, EI, SCSI institutional | ⚪ | Liam | ongoing | Long horizon, low immediate ROI. |
| E19 | Industry research / market sizing for investor deck | 🟡 | Liam + Claude | 1d | For pre-seed pitch. |
| E20 | First customer reference call recorded (with permission) | ⚪ | Liam | 1h | Powerful demo asset later. |

**E-subtotal:** ~20 items. Critical path: E01-E04, E10, E11.

---

## F · Financial & Fundraise

| # | Item | Priority | Owner | Est. | Notes |
|---|---|---|---|---|---|
| F01 | EI HPSU application | 🔴 | Liam | 3h | Already #70. Free. Worth €100-250k equity-free. |
| F02 | Excel financial model (live, sensitivity, fundraise readiness) | 🟡 | Claude + Liam | 1d | Built from Docs 14 + 15. xlsx skill. |
| F03 | Cap table — VerifIQ inside GovIQ structure documented | 🟡 | Liam + solicitor | external | Confirm GovIQ accommodates VerifIQ as product line vs. spin-out. |
| F04 | Pre-seed angel list (5-8 names) | 🟡 | Liam | half day | Construction-tech, public-sector-tech angels. |
| F05 | Enterprise Ireland Innovation Voucher application | 🟡 | Liam | 1h | €5k. Free money for early platform work. |
| F06 | Disruptive Technologies Innovation Fund — eligibility check | ⚪ | Liam | 2h | If scope qualifies. €100k+ available. |
| F07 | Bridge facility identified (angel + named cheque) | 🟡 | Liam | half day | Auditor's red-line from Doc 14. 3-month seed-window protection. |
| F08 | Pitch deck — 15 slides | 🟡 | Claude + Liam | 1d | Built from Docs 12-15. |
| F09 | One-page financial summary for investor calls | 🟡 | Claude | 2h | Standalone artefact. |
| F10 | Seed VC list (Atlantic Bridge, Frontline, ACT, others) | ⚪ | Liam | half day | Research + warm intro mapping. |
| F11 | Data room — investor-ready folder structure | ⚪ | Liam | half day | All Docs 11-17, financial model, contracts, customer signed packs. |
| F12 | First investor meetings — pre-seed | ⚪ | Liam | ongoing | Month 6+ after 3 paying customers. |
| F13 | Seed-round prep — month 8-9 | ⚪ | Liam | ongoing | When metrics support. |
| F14 | Monthly P&L review process | 🟡 | Liam + accountant | 1h/mo | Discipline. |
| F15 | VAT registration confirmation under GovIQ Ltd | 🔴 | Liam | 1h | Required for invoicing. |

**F-subtotal:** ~15 items. Critical path: F01, F02, F15.

---

## G · Internal Operations

| # | Item | Priority | Owner | Est. | Notes |
|---|---|---|---|---|---|
| G01 | Weekly Monday review scheduled | ✅ DONE | Claude | — | Set for next Monday 09:05. |
| G02 | Friday close ritual (10-min self-review) | 🟡 | Liam | ongoing | Discipline. |
| G03 | Reviewer-panel-chair conversation booked | 🔴 | Liam | this week | Already #68 family. |
| G04 | Reviewer-panel-chair equity terms drafted | 🟡 | Liam + solicitor | half day | When chair agrees in principle. |
| G05 | First specialist-per-pack reviewer relationships (M&E + Fire + Arch) | 🟡 | Liam | ongoing | Per pack as triggered. |
| G06 | Document repository structure stable (already done — Docs 01-17) | ✅ DONE | Liam | — | Maintain Docs index in PROJECT_PLAN.md. |
| G07 | TASKS.md or task widget kept fresh | 🟡 | Liam | weekly | This list. |
| G08 | PROJECT_PLAN.md weekly update | 🟡 | Liam | weekly | Monday review. |
| G09 | Anonymised data set kept current (327-finding pack scrubbed of identifiers) | 🔴 | Liam | 1d | Required for case-study + sales demos. |
| G10 | Customer support inbox process | 🟡 | Liam | 1h | hello@ + concierge@ routing rules. |
| G11 | Incident response runbook | ⚪ | Liam | 2h | When platform live. |
| G12 | Reviewer SLA published (target turnaround per tier) | 🟡 | Liam | 1h | Tier I 24h, II 48h, III 72h, IV/V by arrangement. |
| G13 | Backups + offsite (Convex + git repos) | 🟡 | Liam | 2h | Confirm + document. |
| G14 | Founder calendar discipline (deep-work blocks, review blocks) | 🟡 | Liam | ongoing | Self-management. |
| G15 | Personal runway tracker (Liam's burn vs personal reserves) | 🟡 | Liam | 1h | Honest with self about month-8 cash-out. |

**G-subtotal:** ~15 items. Critical path: G03, G09, G12.

---

## H · Future Products / Market Expansion

Items NOT for now, but logged so they don't get forgotten.

| # | Item | Priority | Owner | Est. | Trigger |
|---|---|---|---|---|---|
| H01 | UK reviewer panel scoping | ⚪ | Liam | half day | Q1 2027 |
| H02 | UK corpus loader engineering | ⚪ | Liam | 8 weeks | Q1 2027 |
| H03 | UK solicitor retained | ⚪ | Liam | external | Q1 2027 |
| H04 | UK insurance bound | ⚪ | Liam | external | Q1 2027 |
| H05 | Multi-region Convex routing | ⚪ | Liam | 4 weeks | Pre-UK launch |
| H06 | Per-locale message bundles (i18n) | ⚪ | Liam | 4 weeks | Pre-UK launch |
| H07 | Sector-specific corpus loaders (data centres, infra, education) | ⚪ | Liam | ongoing | Per sector demand |
| H08 | Hunt — productised distinctly from Verify | ⚪ | Liam | 2 weeks | Q3 2026 |
| H09 | Studio — productised distinctly from Verify | ⚪ | Liam | 1 week | Q3 2026 |
| H10 | Reviewer-marketplace (panel members as platform users) | ⚪ | Liam | 2 weeks | Post-seed |
| H11 | API access for power users (Tier IV/V) | ⚪ | Liam | 1 week | Post-seed |
| H12 | Mobile-responsive review queue (reviewer phone app) | ⚪ | Liam | 2 weeks | Post-seed |
| H13 | Per-pack outcome-priced Tier V pilot | ⚪ | Liam | half day | Auditor recommendation from Doc 14 — month 9+ |
| H14 | Sub-processor — open-weights AI fallback (Llama / similar self-hosted) | ⚪ | Liam | 2 weeks | Pre-international launch — Auditor red-line from Doc 12 |

**H-subtotal:** 14 items. None on critical path. Logged for visibility.

---

## I · Documentation Gaps

Things still to write or update.

| # | Item | Priority | Owner | Est. | Notes |
|---|---|---|---|---|---|
| I01 | Excel financial model (xlsx) — already F02 | 🟡 | Claude + Liam | 1d | |
| I02 | Marketing Strategy standalone document — pending from #30 | ⚪ | Claude | 2h | Optional — much of it absorbed into Docs 14 + GTM section here. |
| I03 | Convex schema documentation (Convex auto-generates but human-readable wrap) | 🟡 | Claude | 2h | For investor data room. |
| I04 | API documentation (when API ships) | ⚪ | Claude | 2h | Post-seed. |
| I05 | Reviewer onboarding guide (when panel formalises) | 🟡 | Claude + Liam | half day | When panel chair signed. |
| I06 | Customer onboarding email sequence (when first customer signs) | 🟡 | Liam | half day | |
| I07 | Founder narrative — "the origin story" — for press / pitches | ⚪ | Liam | 2h | When asked. |
| I08 | Update PROJECT_PLAN.md every Monday | ✅ ONGOING | Liam | weekly | Scheduled. |
| I09 | Doc index README at repo root | ⚪ | Claude | 30m | Currently PROJECT_PLAN.md references everything; could add a docs/README.md. |
| I10 | Sales narrative deck (15 slides) — already C11 | 🟡 | Claude + Liam | 1d | |
| I11 | Update Doc 14 (Setup Costs) to reflect Doc 15 supersession explicitly | ⚪ | Claude | 30m | One-line note at top of Doc 14 pointing to Doc 15. |
| I12 | Update Doc 12 (Scaling) to reflect "VerifIQ inside GovIQ" frame | ⚪ | Claude | 1h | Several sections assume standalone VerifIQ. |
| I13 | Update Doc 13 (Legal) — confirm VerifIQ-inside-GovIQ doesn't change locked language | ⚪ | Liam + solicitor | external | Important for Phase 2 solicitor brief. |

**I-subtotal:** ~13 items. Critical path: I01, I05.

---

## Summary by category

| Category | Items | Critical path |
|---|---|---|
| A — Website surfaces | 20 | 9 |
| B — Platform engineering | 30 | 13 |
| C — Content & brand | 18 | 7 |
| D — Legal & compliance | 22 | 10 |
| E — Go-to-market | 20 | 5 |
| F — Financial & fundraise | 15 | 3 |
| G — Internal operations | 15 | 3 |
| H — Future / expansion | 14 | 0 |
| I — Documentation gaps | 13 | 2 |
| **Total** | **167 items** | **52 critical-path** |

---

## Sequencing — what unlocks what

```
Week 1 (P0)
  ├─ A14, A15, B01-B02 ──► public face live (already half-done)
  ├─ D01 ───────────────► triggers D02-D08 (Phase 2 legal)
  └─ G03 ───────────────► triggers G04-G05 (panel chair) and C02 (founder bio)

Week 2-4 (P1)
  ├─ D02-D08 ───────────► unlocks first paid customer
  ├─ A01, A02, A03, A04 ──► unlocks paid customer (red-line gates)
  ├─ B03-B07 ───────────► POC pipeline live, supports A09 (case study)
  ├─ C01-C07 ───────────► funnel + transactional emails
  └─ E01-E04 ───────────► first inbound enquiries

Month 2-4 (P2)
  ├─ First paid customer signed
  ├─ C01 (case study) ──► 3-5x funnel multiplier
  ├─ Panel chair retained ──► triggers Solo-Reviewer-Phase end at scale
  ├─ Trademark IE, EI HPSU close
  └─ Engineering hardening continues

Month 4-9 (P3)
  ├─ 10 paying customers ──► pre-seed pitch credible
  ├─ Bridge facility + seed prep
  ├─ Open-weights AI fallback evaluated
  └─ Seed close month 9

Month 10+ (P4 post-seed)
  ├─ First hire
  ├─ UK preparation begins
  └─ Future products explored
```

---

## What to do FIRST this week (top 7 personal actions for Liam)

1. **Buy verifiq.ie** today. €15. 10 minutes.
2. **Update website to drop panel claim** — DONE this morning ✅
3. **Deploy site to Vercel under GovIQ org** today/Tuesday. 30 minutes.
4. **Draft and send solicitor brief** Tuesday. 1 hour.
5. **Book reviewer-panel-chair coffee for next week** Wednesday. 30 minutes.
6. **Send 5 LinkedIn outreach messages** Wednesday-Friday. 1 hour total.
7. **Start EI HPSU application** Friday. 3 hours. Free money.

Total time: ~6.5 hours of focused work this week. Total cash: ~€60-260.

---

## What I can build for you next, in priority order

1. **`pricing.html`** — full Tier I-V pricing page in engineering register. 2h.
2. **`sub-processors.html`** — red-line item before first paid scan. 45m.
3. **`case-study-01.html`** — 327-finding pack worked example, anonymised. Funnel-critical. 3h.
4. **`hunt.html` migration** to engineering register. 2h.
5. **`studio.html` migration** to engineering register. 2h.
6. **Excel financial model** — operational, sensitivity, fundraise readiness. 1d via xlsx skill.
7. **Pitch deck (15 slides)** for pre-seed. Via pptx skill. 1d.
8. **Five email templates** (welcome, scan complete, paid release, paywall hit, concierge reply). 2h.
9. **Solicitor brief draft** — ready to send. 30m.
10. **Founder bio page (`about.html`)** with reviewer scope. 1.5h.

I'd recommend #1 → #2 → #3 → #9 as the next pass.

---

## The single sentence that holds this backlog together

> *167 items mapped across 9 categories; 52 on the critical path; 7 to do this week; 4 web builds I can ship today that unlock the first paying customer.*

---

*Pinned · update Monday alongside PROJECT_PLAN.md · the single source of truth on everything else.*
