# VerifIQ — Free Tier Abuse-Prevention Specification

**Doc ID:** `verifiq-abuse-v0.1`  
**Status:** Draft for technical review  
**Owner:** Product · Platform  
**Date:** 2026-06-01  
**Applies to:** Free-tier scan only (paid tiers have payment-card-on-file friction; abuse vector is far smaller)

---

## 1 · Threat Model

The free tier offers one design pack scan per organisation with deliberately shaped output. The threats we are defending against, in descending probability:

| # | Threat | Description | Estimated frequency |
|---|--------|-------------|---------------------|
| T-01 | **Email re-registration** | Same person, new email alias, second free pack. | High — trivial bypass |
| T-02 | **Same-firm re-use** | Different colleague at same practice, second free pack. | High — cultural, not malicious |
| T-03 | **Pack-shopping** | Same pack uploaded under two emails to compare results / get second opinion. | Medium |
| T-04 | **Compute drain** | Coordinated abuse — multiple emails uploading large packs to exhaust token budget. | Low but high-impact |
| T-05 | **Scraping** | Reverse-engineering the corpus by uploading known documents and recording responses. | Low — high effort |
| T-06 | **Competitor reconnaissance** | A rival service probes our output to copy method or evaluate accuracy. | Medium probability, low cost to us |

The free tier is a marketing and trust-building cost, **not** a delivery surface. Some abuse is acceptable. The job is to keep abuse cost per free scan ≤ €5 of compute and to ensure no abuser can extract a deliverable.

---

## 2 · Defence Stack (Layered)

Layers run in order. Each layer is independently bypass-able; the stack must hold collectively.

### Layer 1 — Email domain whitelist

**Rule:** Reject signups from free-mail domains. Require corporate / institutional domains only.

**Blocked domain list (initial):**

```
gmail.com, googlemail.com, outlook.com, hotmail.com, live.com, msn.com,
yahoo.com, yahoo.co.uk, yahoo.ie, ymail.com, rocketmail.com,
proton.me, protonmail.com, pm.me,
icloud.com, me.com, mac.com,
aol.com, mail.com, gmx.com, gmx.net, zoho.com, fastmail.com,
tutanota.com, hey.com, duck.com, mailinator.com, tempmail.*,
10minutemail.*, throwawaymail.*, guerrillamail.*, sharklasers.com
```

**Implementation:** Regex check on the email domain at signup. Show inline error: *"Please use your practice email. VerifIQ is a service for chartered professionals."*

**Bypass cost to abuser:** €10/year for a fake `.com` domain. Acceptable — separates casual abusers from committed ones.

**False positives:** Sole practitioners using personal Gmail. Mitigation — allow override via "I'm a sole practitioner" path that requires manual concierge approval (24–48 hr SLA) and validates with PSRA / RIAI / Engineers Ireland member lookup.

---

### Layer 2 — Document SHA-256 dedup (primary defence)

**Rule:** Every file in every uploaded ZIP is hashed with SHA-256. The hash set is stored per organisation and globally.

**Match logic:**

| Match level | Trigger | Action |
|-------------|---------|--------|
| **Exact-pack match** | ≥ 80% of file hashes match a prior pack from a different organisation | **Refuse** the upload. Show: *"We have already reviewed this pack under a different account. Free tier is one-per-pack."* |
| **Partial-pack match** | 30–79% of file hashes match a prior pack from a different organisation | **Flag** for manual concierge review before scan begins. Hold for 4 hours. |
| **Re-upload same org** | ≥ 80% match within same org | **Refuse** as duplicate. *"This pack has already been read. Upload a revision or a new pack."* |
| **No match** | < 30% match across all packs | **Proceed.** |

**Implementation:** Computed during ZIP extraction. Stored in `core_document_hashes` table:

```sql
create table core_document_hashes (
  id text primary key,
  org_id text references organisations(id),
  pack_id text references packs(id),
  filename text,
  sha256 text not null,
  file_size_bytes integer,
  created_at timestamptz default now()
);
create index idx_hash on core_document_hashes(sha256);
```

**Bypass cost to abuser:** Must modify (re-export) every PDF in the pack. PDF metadata change alone changes the hash. But — once they've gone to that effort, they're committed and likely a real user.

**Privacy posture:** Hashes are not the document. We retain hashes 90 days then purge. Document content is purged at 14 days regardless. GDPR-aligned.

---

### Layer 3 — Browser fingerprint

**Rule:** Capture a stable, privacy-respecting browser fingerprint at signup and at every upload.

**Components:**

- Canvas fingerprint (DIY — 50 lines of JS)
- User Agent + platform + language
- Screen resolution + colour depth + timezone
- Persistent cookie (`viq_fp_v1`) + `localStorage` token

**Match logic:** If a new signup's fingerprint matches one from a prior free-tier organisation within 30 days → flag for manual review.

**Open-source library:** [FingerprintJS Open Source](https://github.com/fingerprintjs/fingerprintjs) — MIT licence. Used at signup only.

**Bypass cost:** Different browser, different device, incognito. Catches the cookie-deleting abuser but not the determined one. Acceptable.

---

### Layer 4 — Output shaping (the real lock)

This is the most important layer because **even if every other layer is bypassed, abuse cannot extract a useful deliverable.**

**Free-tier output is structurally incomplete:**

| Element | Paid | Free |
|---------|------|------|
| Disciplines scanned | All 7 | **1 only** (user picks) |
| Documents per discipline | Tier cap (e.g., 600) | **20 documents max** |
| Findings shown | All | **Counts + 1 fully-worked example only** |
| Source quotes | On every finding | **On 1 finding** |
| Redacted previews | None | 3 critical, first 4 words then `…` |
| RFI register | XLSX exportable | **Not generated** |
| Coordination cross-pass | Yes | **Not run** |
| Chartered reviewer sign-off | Stamped to audit log | **Not performed** |
| XLSX export | Yes | **PDF watermarked summary only** |
| Retention | 7 years (paid) | **14 days then hashed-delete** |
| Audit log | Exportable | **Not generated** |

**Compute economics:**

| Scan type | Models used | Estimated cost | Time |
|-----------|-------------|----------------|------|
| Free skim | Haiku classification + 1 Sonnet worked example | **€2.50–€4.50** | 12–22 min |
| Paid Tier III | Full Sonnet read all disciplines + verification + coordination | €18–€42 | 36–48 hr |

The abuser cannot get the work for free even if they game emails infinitely — the work simply isn't generated.

---

### Layer 5 — Rate limit per organisation per quarter

**Rule:** Each organisation (by domain or by validated identity) is allowed **one free scan per calendar quarter**. After that, the free flow returns a polite "your practice has already exercised this quarter's free read — talk to the concierge or proceed at tier."

**Implementation:** A `core_org_free_tier_usage` table. Quarter calculation in UTC.

---

### Layer 6 — Concierge override

**Rule:** Any flagged scan goes to the concierge queue. The concierge can manually approve, reject, or downgrade to a paid tier.

This is the human-in-loop layer that prevents legitimate but unusual cases (sole practitioners, new firms, conference demo requests) from being blocked by automated rules.

**Target queue volume:** ≤ 10 flagged scans per week. If above, tighten the automated layers.

---

## 3 · Honest Signalling

The legal copy on the free-scan page must say:

- "One free read per organisation per quarter."
- "Free output is deliberately incomplete — counts and one worked example. The full register is held behind the paywall."
- "Pack content is encrypted at rest and deleted within 14 days."
- "Document hashes are retained 90 days to prevent free-tier abuse."

We do not hide what we are doing. Transparency is itself a defence — most abusers prefer surfaces with no friction.

---

## 4 · Monitoring & Metrics

Dashboards must track:

- Free signups per day, by domain
- Free scans started vs completed
- Hash dedup hits (% of uploads blocked by Layer 2)
- Browser fingerprint matches (% of signups flagged by Layer 3)
- Concierge queue depth + manual override rate
- Conversion rate: free scan → paid tier (this is the actual outcome we are buying)
- Compute cost per free scan (cap alert at €6)

Weekly review: which abuse signals are firing, which are noise, where the funnel is leaking.

---

## 5 · What we do NOT do

- **We do not scan or store** the body of documents past the 14-day window. Hashes only.
- **We do not sell or share** abuse-prevention data with third parties.
- **We do not train models** on customer documents. Period.
- **We do not use dark patterns** on the paywall — pricing is shown plainly, free output is honest about what it is and is not.
- **We do not block first-time users** automatically. Concierge override exists precisely to catch false positives.

---

## 6 · Open Decisions

| # | Decision | Recommended | Why |
|---|----------|-------------|-----|
| D-01 | Hash retention period | 90 days | Long enough to catch quarterly re-use, short enough to be defensible under GDPR data minimisation. |
| D-02 | Concierge SLA on flagged scans | 4 hours business-hours, 24 hours otherwise | Real users will not wait longer; longer hurts conversion. |
| D-03 | Free-tier paid escape hatch | Yes — let any flagged user pay to bypass | Converts abuse signals into revenue. |
| D-04 | Whether to validate RIAI/EI/SCSI membership | Phase 2 | Adds friction; worth doing only if Layer 1+2 prove insufficient. |
| D-05 | Whether to publish abuse metrics publicly | No, but share with the reviewer panel | Builds trust internally; would teach abusers externally. |

---

## 7 · Implementation Order

1. **Week 1 — Layer 4** (output shaping). Single highest-value defence. Ship before any free-tier traffic.
2. **Week 1 — Layer 1** (domain whitelist). Cheap, catches 70%.
3. **Week 2 — Layer 2** (hash dedup). 1 day of dev. Highest leverage against committed abusers.
4. **Week 3 — Layer 3** (fingerprint). Half-day of dev. Diminishing returns.
5. **Week 4 — Layer 5** (quarterly rate limit). Trivial once Layer 1 is in.
6. **Continuous — Layer 6** (concierge). Process, not code.

---

## 8 · Cost Cap

If the abuse cost per quarter exceeds **€500 / 250 free scans / €2 per scan** we re-tune. If conversion stays above **8% free → paid** we accept higher abuse to keep the funnel open.

---

*End of specification — VerifIQ Platform · v0.1*
