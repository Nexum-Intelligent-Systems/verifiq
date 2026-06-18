# 44 — Web upload, end to end (run a trial from the browser)

How a trial run via the website produces a full council review — findings + a
Build Readiness Report — and the ZIP + plain-language UX that make `/upload`
something a non-expert can complete confidently.

## The pipeline (seal → classify → review)

Sealing a pack (`uploadDocs.sealUploadSession`) schedules
`classifyAction.classifyOneDocument` for each uploaded document:

1. **Classify each document.** The 3-source title-block classifier
   (`src/classify/` over `createNodePdf()` + the LLM) assigns discipline / type
   and a confidence, and saves a text preview. High-confidence docs auto-confirm;
   low-confidence ones advance the project to `confirm_classify` for review.
2. **Advance the pack.** When every document is settled, `checkAndAdvance`
   builds the `RunInput` from the extracted text, moves the project to
   `scanning`, persists the payload, and dispatches `runReview` — the resumable
   council orchestrator → findings + Build Readiness Report.

Discipline therefore comes from the real classifier, not a fixed tag.

## ZIPs and the upload UX

- **Drop a ZIP.** The `/upload` page unpacks a dropped `.zip` in the browser
  (via `fflate`) into its individual PDFs / text files, so the customer never
  has to unzip first. OS junk (`__MACOSX/`, `.DS_Store`), folders, nested zips
  and unsupported binaries (images) are set aside with a plain-language notice.
  Keep/skip rules live in `src/ingest/zip.ts`; `fileTextKind`
  (`src/ingest/extract.ts`) decides PDF vs text vs unsupported. Both are pure and
  unit-tested (`tests/zip.test.ts`, `tests/ingest.test.ts`).
- **Plain-language UX.** A guided three-step flow with friendly discipline
  labels, per-file status (`Checking… / Uploading 42% / ✓ Ready`), dismissible
  info / warning / error notices, retry on a failed file, expired-session
  detection, and a confirm step before the read starts.

## Run three trials from the browser

Prerequisites: `npx convex dev` running; provider keys + storage set **in the
Convex env** (not just `.env.local`):

```bash
npx convex env set ANTHROPIC_API_KEY sk-ant-...
npx convex env set OPENAI_API_KEY  sk-...
# storage for the uploaded bytes (R2 for the direct-upload path):
npx convex env set R2_ACCOUNT_ID ...           # + R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME
npx convex env set UPLOAD_TOKEN_PEPPER "$(openssl rand -hex 32)"
# dev-only: let the helper hand you a code without email:
npx convex env set VERIFIQ_DEV_CODES 1
npx convex env set APP_BASE_URL http://localhost:3000
```

Then, for **each** of the three trials:

```bash
npm run app:dev                                   # Next.js on :3000 (once)
node scripts/dev-issue-code.mjs "Trial 1 — Office" "Office building"
# → prints an /upload?code=… link. Open it, drag your files (or a whole .zip)
#   in, leave the tag on "Let VerifIQ decide", then "start the read".
```

> Drop a `.zip` and we unpack it for you — no need to unzip first. Files we
> can't read (images, etc.) are set aside and listed, not silently dropped.

Watch progress in the Convex dashboard → Data: `projects.scan_state` walks
`classifying → (confirm_classify) → scanning → peer_challenge → adjudicate →
reviewer_queue`, and `findings` / `reports` fill in. Repeat with `"Trial 2 …"` /
`"Trial 3 …"` for three independent reports.

## Notes

- The browser direct-upload path needs R2 (signed PUT URLs); a small file can be
  Convex-stored (`storage_id`) instead.
- `issueDevUploadCode` is a deliberate dev seam. With `VERIFIQ_DEV_CODES` unset
  it refuses, so production never returns a code over the wire (docs/42 §5.4 N1).
- The classify + review legs make live model + storage calls, so (like
  `runReview`) they are verified locally, not in the credential-less test harness.
