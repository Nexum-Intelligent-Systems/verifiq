# 44 — Web upload, end to end (run a trial from the browser)

Phase 6 wiring that turns a sealed upload pack into a full council review — so a
trial run via the website produces the same findings + Build Readiness Report
the terminal `run-review` script does. Until this landed, the `/upload` flow
stored files and stopped at `classifying`; nothing read them.

## What got wired

1. **Seal → ingest.** `uploadDocs.sealUploadSession` now schedules
   `ingest.ingestAndReview` (a `"use node"` action) after advancing the pack to
   `classifying`.
2. **Ingest → review.** `src/convex/ingest.ts` downloads each file (R2 by
   `r2_key`, Convex storage by `storage_id`), turns bytes into review text
   (pdfjs for PDFs via the new `NodePdfAdapter.allText`, UTF-8 for text files),
   groups the text under each file's council discipline-agent key
   (`src/ingest/extract.ts`), and dispatches the review via
   `reviewData.requestReview` — which persists the RunInput and schedules the
   resumable `review.runReview` orchestrator.
3. **Dev magic code.** `uploadTokens.issueDevUploadCode` (gated behind
   `VERIFIQ_DEV_CODES=1`) mints a code AND returns it, so you can open `/upload`
   locally without wiring Resend. `scripts/dev-issue-code.mjs` prints the link.

Per-file isolation: an unreadable file is recorded and skipped; if **nothing**
in the pack yields text, ingest throws (the pack stays at `classifying` and the
skip reasons land in the scheduled-function error log) rather than dispatching an
empty review.

### Discipline mapping (`src/ingest/extract.ts`)

The customer tags each file at upload; the tag maps onto a council agent key:

| upload tag              | agent key   |
| ----------------------- | ----------- |
| architectural           | architect   |
| fire                    | fire        |
| access                  | access      |
| mechanical-electrical   | m-and-e     |
| qs                      | qs          |
| structural / civil / unclassified / unknown | architect (generalist fallback) |

There is no MVP structural/civil agent, so those fold onto the Architect.

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
# → prints an /upload?code=… link. Open it, drag your UNZIPPED files in,
#   tag each by discipline, then "start the read".
```

> VerifIQ does not unpack ZIPs — unzip locally first and drag the individual
> PDFs / text files in. A stray `.zip` (or image) is recorded and skipped.

Watch progress in the Convex dashboard → Data: `projects.scan_state` walks
`classifying → scanning → peer_challenge → adjudicate → reviewer_queue`, and
`findings` / `reports` fill in. Repeat with `"Trial 2 …"` / `"Trial 3 …"` for
three independent reports.

## Notes / still open

- The browser `/upload` direct-upload path needs R2 (signed PUT URLs). A small
  file can be Convex-stored (`storage_id`) — ingest reads either.
- `issueDevUploadCode` is a deliberate dev seam. With `VERIFIQ_DEV_CODES` unset
  it refuses, so production never returns a code over the wire (docs/42 §5.4 N1).
- The ingest action's happy path makes live model + storage calls, so (like
  `runReview`) it is verified locally, not in the credential-less test harness.
