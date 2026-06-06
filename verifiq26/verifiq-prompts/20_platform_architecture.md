# 20 · Platform Architecture

**Use:** The infrastructure spec that sits behind the discipline agents. Reference this when Codex / Claude Code build any of: upload, job queue, classifier, observability, CI/CD, secrets, scan-state model.

**Why this exists:** the prompt pack files 01-19 are right at the agent / council / output layer. They are silent on the platform that makes 600-document scans actually work. The Implementation Review Council (`docs/25-implementation-review-council.md`) surfaced 7 platform mandatories that block MVP. This file is the canonical spec for each.

**Version:** v1.0 · adopted from Council recommendation 2026-06-01

---

## The 7 platform mandatories

| # | Component | Why mandatory | Build cost |
|---|---|---|---|
| 1 | tus.io resumable upload | 15 GB packs cannot use `<input type="file" multiple>` | ~2 wk FE |
| 2 | Job queue architecture | 24–48 hour scans cannot live in a single Convex action | ~3 wk BE |
| 3 | Title-block classifier | 80% of filename heterogeneity is unsolvable without title-block vision | ~1 wk |
| 4 | Classification-confirmation UX | The trust gate AND the labelled-training-data gate | ~3 days |
| 5 | Long-running scan-state model | Customer can't stare at a 24-hour scan | ~1 wk |
| 6 | Observability (Sentry + metrics + Grafana) | At MVP launch we will not know when things break | ~2 days |
| 7 | CI/CD with validation-pack integration test | Auto-deploy without tests will kill the first paid customer | ~2 days |

Total: roughly 6 focused weeks of platform work in parallel with agent build.

---

## 1 · Resumable Chunked Upload (tus.io)

### Why standard upload fails

| Constraint | Threshold | Why it fails for VerifIQ |
|---|---|---|
| Browser memory | ~2 GB | Tier III pack averages 15 GB total |
| Vercel serverless payload | 4.5 MB | Defaults block typical 25 MB PDFs |
| Convex mutation payload | 1 MB | Mutations cannot accept files |
| Network reliability | One drop kills session | 12-hour upload over 4G fails 50% of the time |
| Tab-close survival | None | Customer closes tab → upload dies |

### The tus.io architecture

```
Browser
  └─ tus.io JS client (Uppy or @tus/js-client)
     └─ Uploads in 5 MB chunks via PATCH requests
        └─ Direct to storage (Convex or S3-compatible) via signed URL
           └─ Server validates SHA-256 on completion
              └─ Records document in Convex `documents` table
```

### Implementation requirements

- **Resumable.** If connection drops, client picks up from last good byte.
- **Parallel-but-bounded.** Up to 6 files in parallel (HTTP/2 limit). Queue the rest.
- **Background-survivable.** Use Service Worker to keep upload alive when tab closes. State in IndexedDB.
- **Integrity-checked.** SHA-256 computed client-side during upload; verified server-side at completion. Mismatch triggers per-file re-upload.
- **Resumable across sessions.** Browser refresh / device switch / next-day resume — all work.
- **Direct-to-storage signed URLs.** Bypass our Next.js server (Vercel limit) and Convex mutation (1 MB limit).

### File storage strategy — Convex vs S3-compatible

**Decision required before Phase 1.** Confirm Convex file storage per-blob limit with Convex support directly. The MVP path depends on the answer:

| Convex limit | MVP path |
|---|---|
| Convex Pro handles 100+ MB blobs natively | Store directly in Convex file storage. Simplest. |
| Convex caps at smaller per-blob size | Hybrid: Convex holds metadata + signed URL. Files in **Cloudflare R2** (preferred — zero egress) or **Backblaze B2** or **Tigris**. Object key = `proj/{project_id}/disc/{discipline}/{sha256}.pdf` |

**Default assumption until confirmed:** hybrid. Build the upload layer behind an interface so swapping in Convex-native is a 1-file change.

### Failure modes to handle

| Failure | Response |
|---|---|
| Network drop | Auto-resume from last chunk on reconnect |
| Tab close | Service Worker continues upload in background |
| Browser crash | State in IndexedDB; resume on next visit with same session token |
| File too large | Reject pre-upload with explicit message |
| File corrupt at server | Re-request specific chunks via tus.io HEAD |
| Storage provider outage | Pause upload + email customer; resume when restored |
| Duplicate file (hash matches prior tenant) | Refuse + prompt: "this pack has been reviewed under a different account" (per `verifiq-prompts/13_agent_self_check_protocol.md` + parent repo Doc 11) |

### Email notifications during upload

| Event | Email |
|---|---|
| Upload complete | "Your pack is uploaded — 600 files received, 14.8 GB. Scan starting now." |
| Upload stalled > 4 hours | "Your upload paused. We'll resume when you return. Pick up here: [link]." |
| Upload failed irrecoverably | "Upload failed: [specific reason]. Free re-upload here: [link]." |

---

## 2 · Job Queue Architecture

### Why a single Convex action will not work

A Tier III scan involves:

- 600 files classified (10–30 minutes)
- 7 disciplines × ~85 files per discipline reviewed (each review 1–5 minutes of LLM time, dozens of seconds wall-clock)
- Cross-reference protocol (file 19) adds ~30% more LLM calls
- Peer challenge between adjacent disciplines (Fire-Arch, M&E-Struc, etc.)
- Adjudication of all candidate findings
- Council Chair report generation

End-to-end: 24–48 hours wall-clock. Tens of thousands of LLM tokens. Cannot fit in a single Convex action (~10 minute limit).

### The job-queue architecture

```
jobs table
  ├─ job_id (PK)
  ├─ project_id (indexed)
  ├─ job_type (classify | review_discipline | cross_reference | peer_challenge | adjudicate | report)
  ├─ payload (JSON — args to the job)
  ├─ status (pending | running | succeeded | failed | retrying)
  ├─ attempts (int)
  ├─ idempotency_key (deterministic hash of job_type + payload)
  ├─ depends_on (array of job_ids that must succeed first)
  ├─ scheduled_for (timestamp)
  ├─ started_at / completed_at
  ├─ error (string, on failure)
  └─ result_ref (storage_id or finding_ids, on success)

scheduled function:
  tick_queue (runs every 60s):
    1. Find next pending job whose dependencies are all 'succeeded'
    2. Lock it (status → 'running')
    3. Dispatch to the right internal action
    4. On success → status='succeeded', writes result
    5. On failure → status='failed', email Liam if attempts >= 3
    6. On rate-limit error → status='retrying', scheduled_for = now + backoff
```

### Per-discipline isolation

Architecture-review failures must NOT fail M&E-review. Each discipline scan is its own independent job tree under the parent `project_id`.

```
Project 04-26 job tree:
  ├─ classify (1 job for whole project)
  └─ depends on classify:
     ├─ Architecture review job tree
     │  ├─ review_files batch 1
     │  ├─ review_files batch 2
     │  ├─ ...
     │  └─ summarise discipline
     ├─ M&E review job tree (parallel)
     ├─ Fire review job tree (parallel)
     ├─ ... (7 disciplines)
     └─ depends on all 7 discipline summaries:
        ├─ cross_reference protocol
        ├─ peer_challenge
        ├─ adjudicate
        └─ council_chair_report
```

### Idempotency

Every LLM call is keyed by a deterministic hash of:

```
hash(model + prompt_version + document_sha256 + agent_id + corpus_version)
```

On retry, the cache hit means the LLM is not re-invoked. Costs ~0 cents, returns in milliseconds.

Cache TTL: 30 days (matches inference log retention).
Cache store: Convex `inference_cache` table OR Redis/Upstash for higher-volume tier.

### Multi-provider failover at the call level

```
async function llmCall(role, prompt) {
  const provider_chain = config.providers_for(role);  // ["anthropic", "openai"]
  for (const provider of provider_chain) {
    try {
      const result = await provider.call(prompt);
      return result;
    } catch (err) {
      if (isRetryable(err) && provider !== last(provider_chain)) {
        log_failover(role, provider, err);
        continue;  // try next provider
      }
      throw err;  // give up
    }
  }
}
```

Failover happens per-call, not per-scan. If Anthropic rate-limits, the next call retries on OpenAI within the same scan job.

### Source-document streaming

Do not load 600 PDFs into a single action's memory. Stream each file from storage to the LLM call via the file-reference pattern. Convex storage `getUrl()` returns a signed URL the LLM can fetch directly when the provider supports it.

For providers that need inline content (Anthropic vision API), batch by document and use prompt caching so the shared system prompt amortises across files.

### Audit-log writes are mutations, never actions

Mutations are atomic and don't get rolled back when an action retries. Audit-log entries must persist even when the parent action fails.

---

## 3 · Title-Block Classifier (3-Source Extraction)

### Why filename alone fails

Real Irish pack filenames (sampled):

- `A-100.pdf`, `A-101 Rev B.pdf` (sensible)
- `24-001-ARC-100-rev-B-FINAL-USE-THIS.pdf` (Irish practice convention)
- `Architectural Drawing 100.pdf` (descriptive)
- `Plan-Ground-Floor.pdf` (semantic)
- `LH-01-rev-c.dwg` (CAD-only)
- `IMG_2438.pdf` (photographed from a screen)
- `Drawing.pdf`, `Drawing(1).pdf` (auto-numbered downloads)
- `Final_Final_REALFINAL_v3.pdf` (we've all been there)
- Filenames in Irish, French, etc.

Filename classification alone yields ~50–60% accuracy. Insufficient.

### The 3-source classifier

```
For each uploaded file:
  Source 1: Filename + extension + size + folder context
  Source 2: Title-block vision extraction (first page of the PDF)
  Source 3: Document content (first 500 tokens of text)

  → Combine with weighted classifier:
     - If title-block extracted cleanly: 80% weight on title-block
     - Else if content first-500 strong signal: 60% weight on content
     - Else fall back to filename
  → Output: discipline, document_type, drawing_number, revision, date, author, classifier_confidence
```

### Title-block extraction

Every chartered drawing has a title block in the bottom-right. They follow a small number of conventions:

```
Standard fields in title block:
  - Project name + address
  - Drawing title (e.g., "Ground Floor Plan")
  - Drawing number (e.g., "A-100")
  - Revision (e.g., "B")
  - Date (issue / revision)
  - Scale (e.g., "1:100 @ A1")
  - Discipline code (e.g., "A" architecture, "S" structural, "M" mechanical, "E" electrical, "C" civil, "F" fire)
  - Author / practice (RIAI / EI / SCSI member)
  - BCAR / FSC / DAC stamps where applicable
```

### Implementation

```
classify_document(file_id):
  page1 = render_pdf_page(file_id, page=1, dpi=200)
  title_block_region = extract_bottom_right(page1, fraction=0.35)
  
  # Vision LLM call to extract structured fields
  fields = vision_llm.extract({
    image: title_block_region,
    schema: {
      drawing_title, drawing_number, revision, date,
      scale, discipline_code, author, project_ref
    }
  })
  
  # Fall back if title block missing
  if not fields.drawing_number:
    text = extract_text(file_id, max_tokens=500)
    fields = text_llm.classify(text)
  
  # Final fallback to filename
  if not fields.drawing_number:
    fields = filename_parser(file.name)
  
  return {
    discipline: fields.discipline_code → discipline_name,
    document_type: infer_from_drawing_title(fields.drawing_title),
    drawing_number: fields.drawing_number,
    revision: fields.revision,
    date: fields.date,
    classifier_confidence: weighted_confidence_score
  }
```

### Cost note

Title-block vision extraction = 1 vision-LLM call per document. At Haiku-vision pricing this is ~€0.0005 per document. A Tier III pack of 600 files = €0.30. Trivial.

### Cache the result

Once a file is classified, the SHA-256 hash + classification is cached. If the same document appears in a later pack (revision, or another customer with same standard detail), it's classified in ~5ms.

---

## 4 · Classification Confirmation UX

### Why this screen exists

- **Customer trust:** they can SEE what we think each file is before we proceed. No black box.
- **Training data:** every correction is a labelled example. This is the single most valuable input to the lessons-learnt loop (`verifiq-prompts/15_lessons_learnt_loop.md`).
- **Error catching:** misclassification of one critical fire-strategy document routes to the wrong agent and produces nonsense.

### The screen

```
┌──────────────────────────────────────────────────────────────────┐
│ Review the classification before we scan                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ File                          Discipline   Type       Conf       │
│ ────                          ────────     ────       ────       │
│ A-100 Rev B.pdf               Arch    ✓    GA Plan    98%   [✓]  │
│ A-510 detail.pdf              Arch    ✓    Detail     95%   [✓]  │
│ 24-001-MEP-200-B.pdf          M&E     ✓    Layout     91%   [✓]  │
│ Fire-Strategy-Rev-A.pdf       Fire    ✓    Strategy   97%   [✓]  │
│ IMG_2438.pdf                  Arch    ⚠    Photo?     32%   [⋯]  │ ← click to reclassify
│ Final_Final_v3.pdf            ?       ⚠    Unknown    21%   [⋯]  │ ← click to reclassify
│ ...                                                              │
│                                                                  │
│ [ Start scan ]    [ Hold — I want to add more files ]            │
└──────────────────────────────────────────────────────────────────┘
```

### Behaviours

- High-confidence rows show a green check; auto-accepted.
- Low-confidence rows (< 70%) show a warning + are pre-selected for confirmation.
- Click any row to reclassify (drop-down: 13 disciplines + document type).
- "Start scan" is enabled only when no low-confidence rows are unconfirmed (forced-confirm pattern).
- Every reclassification writes to `classifier_feedback` table — feeds `15_lessons_learnt_loop.md`.

### Implementation

- Next.js page at `/projects/{id}/classify`
- Uses Convex reactive query `useQuery(api.classify.listDocuments, { project_id })`
- Optimistic UI on reclassification (immediate visual update; mutation in background)

---

## 5 · Long-Running Scan State Model

### State machine

```
              ┌──────────┐
              │ pending  │  ← created by customer
              └────┬─────┘
                   ▼
              ┌──────────┐
              │uploading │  ← tus.io transferring
              └────┬─────┘
                   ▼
              ┌──────────┐
              │classifying│  ← title-block + content extraction
              └────┬─────┘
                   ▼
              ┌──────────┐
              │ confirm  │  ← customer confirms classification
              │ classify │
              └────┬─────┘
                   ▼
              ┌──────────┐
              │ scanning │  ← discipline reviews running
              └────┬─────┘
                   ▼
              ┌──────────┐
              │ cross-ref│  ← cross-reference protocol
              └────┬─────┘
                   ▼
              ┌──────────┐
              │ peer     │  ← peer challenges
              │challenge │
              └────┬─────┘
                   ▼
              ┌──────────┐
              │adjudicate│  ← findings adjudicated
              └────┬─────┘
                   ▼
              ┌──────────┐
              │ reviewer │  ← chartered reviewer queue
              │ queue    │
              └────┬─────┘
                   ▼
              ┌──────────┐
              │ released │  ← Build Readiness Report ready
              └──────────┘
```

### Email at each transition

| Transition | Email subject |
|---|---|
| pending → uploading | "Upload starting — pick up here if interrupted: [link]" |
| uploading → classifying | "Pack received — 600 files, 14.8 GB. Classifying now." |
| classifying → confirm classify | "Please confirm classification before scan begins: [link]" |
| confirm classify → scanning | "Scan started. Estimated release: 48 hours. Updates as we progress." |
| scanning → cross-ref | "Discipline reviews complete. Running cross-reference checks." |
| cross-ref → peer challenge | "Cross-checks complete. Discipline peer challenges running." |
| peer challenge → adjudicate | "Peer challenges complete. Adjudicating final register." |
| adjudicate → reviewer queue | "Findings adjudicated. In chartered reviewer queue." |
| reviewer queue → released | "Your pack is released. Reviewer-signed report attached: [link]" |

### Dashboard real-time view

Customer dashboard `dashboard-live.html` already mocks this — wire to Convex reactive query `useQuery(api.scan.getState, { project_id })`. State changes propagate to the dashboard in milliseconds without polling.

---

## 6 · Observability

### Required before first paid customer

| Tool | Purpose | Cost |
|---|---|---|
| **Sentry** | Error tracking, frontend + backend | Free tier OK for MVP |
| **Convex built-in metrics** | Function call latency, error rates | Included with Convex |
| **Custom Prometheus exporter** | Job queue depth, scan turnaround, LLM cost per scan, classifier accuracy | Built into Convex actions |
| **Grafana Cloud (free tier)** | Visualisation dashboard | Free for up to 10k metrics |
| **PagerDuty** (free trial then $20/mo) | Sev-1 paging to founder phone | Required from day-1 paid customer |

Total monthly: ~€20.

### Required dashboards

1. **System health** — Convex function latencies, error rates, queue depth, LLM call success rate.
2. **Per-scan health** — wall-clock time per discipline, LLM tokens consumed, agent timeout count, classifier confidence distribution.
3. **Financial** — Anthropic + OpenAI spend per scan, per day, per customer.
4. **Quality** (post-launch) — finding acceptance rate per agent, REJ-01 false-positive rate, REJ-08 stage-inappropriateness rate (feeds `15_lessons_learnt_loop.md`).

### Alerting rules

| Trigger | Severity | Response |
|---|---|---|
| Any production error (Sentry) | Sev-2 | Email founder |
| Job queue depth > 50 for > 10 min | Sev-2 | Email founder |
| Scan stalled > 4 hours (no state transition) | Sev-1 | Page founder |
| LLM cost > €50 in a single scan | Sev-2 | Email founder (cost runaway suspected) |
| Classifier confidence avg < 70% over 24h | Sev-3 | Email founder (corpus drift suspected) |
| Convex function 5xx rate > 1% over 5 min | Sev-1 | Page founder |

---

## 7 · CI/CD with Validation-Pack Integration Test

### Tools

- **GitHub Actions** — CI: lint, type-check, unit tests on every PR
- **Convex preview deployments** — per-branch isolated Convex environment
- **Vercel preview deployments** — per-PR live URL
- **Manual promotion to production** — no auto-deploy until integration tests pass

### The validation-pack integration test

The parent repo holds a 327-finding validation pack at `verifiq26/evidence/findings-register-v0.8-scan-view.xlsx`. Every production deploy must run this pack end-to-end on the preview environment and assert:

1. Scan completes (no jobs stuck > 1 hour in test mode)
2. At least N total findings emitted (lower bound, not exact match — agents may improve over time)
3. The 3 known Critical findings (C-01 / C-02 / C-03) all surface
4. The locked disclaimer is in every export (PDF / DOCX / XLSX / JSON cover)
5. The audit log has reviewer signature placeholder + corpus version stamp + document hashes
6. No PII leaks in exports (regex check against known patterns)
7. Banned-verb whitelist enforced in any generated marketing-adjacent copy (per `verifiq-prompts/08_guardrails.md`)

If any assertion fails → deploy blocked. Founder reviews.

### Time budget

Validation-pack integration test runs in ~12 minutes (test-mode uses Haiku throughout to keep cost trivial).

### Cost per deploy

~€2 of inference per deploy. Worth it. Catches regressions before customers see them.

---

## 8 · Secrets Management

### Categories

| Type | Examples | Storage |
|---|---|---|
| Provider API keys | Anthropic, OpenAI, Stripe, Clerk, Resend | Vercel env vars (prod) + Convex env vars (server) |
| Storage credentials | R2 / S3 access keys | Vercel + Convex env vars |
| Internal admin tokens | Founder admin override token | Convex env vars only |
| Customer encryption keys | Per-customer document encryption (Phase 3) | KMS — not yet in MVP |
| Webhook secrets | Stripe / Clerk / Resend signing secrets | Convex env vars |

### Rules

- Never in `.env.local` checked into git.
- Never in `console.log` or error messages.
- Rotate quarterly (calendar reminder).
- 1Password vault for human-readable backup.
- Quarterly rotation procedure documented in `docs/20-compliance-sops.md` § 9.

---

## Sequencing of the 7 mandatories (12-week MVP path)

| Week | Build focus | Mandatories addressed |
|---|---|---|
| 1 | Schema + LLM adapter (per `verifiq-prompts/16_issuance_commands.md` Phase 1-2) | — |
| 2 | Discipline agents + self-check (Phase 3) | — |
| 3 | Job queue + per-discipline isolation (Phase 4) | **#2 job queue** |
| 4 | Peer challenge + adjudicator + chair (Phase 5-6) | — |
| 5 | tus.io upload + classification-confirmation UX (Phase 7a) | **#1 upload · #4 confirm UX** |
| 6 | Title-block classifier + scan-state model + dashboard wiring (Phase 7b) | **#3 classifier · #5 scan state** |
| 7 | Observability + CI/CD + secrets (Phase 7c) | **#6 obs · #7 CI/CD · #8 secrets** |
| 8 | End-to-end on validation pack | All 7 |
| 9 | First chartered reviewer hand-test | — |
| 10 | First friendly customer pack | — |
| 11 | Feedback loop wiring (Phase 8) | — |
| 12 | First paid pack | Hard gate |

---

## What this file does NOT cover

- The agent prompts themselves (file 04, 17)
- The output schemas (file 05)
- The lessons-learnt loop (file 15)
- The customer-facing pricing / billing (parent repo `docs/14`)
- International scaling (parent repo `docs/12`)

This file is the platform spec only. Read it alongside file 16 (issuance commands) when Codex / Claude Code build the application.

---

## The single sentence

> *Seven platform mandatories — tus.io upload, job queue, title-block classifier, classification-confirmation UX, scan-state model, observability, CI/CD — sit beneath the agent prompts; the 12-week MVP cannot ship without them.*

---

*Confirm Convex file-size limits with Convex support before Phase 1. Everything else flows.*
