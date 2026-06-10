# 16 · Issuance Commands — Codex / Claude Code / CLI

**Use:** How to actually issue this prompt pack to Codex or Claude Code so they begin building VerifIQ. Copy/paste the commands below.

---

## Pre-flight checklist

Before issuing:

- [ ] All 18 files in `verifiq-prompts/` exist and are committed.
- [ ] `README.md` and `CLAUDE.md` are in place at the directory root.
- [ ] The target repo for the application (`verifiq-app/` or `verifiq26/src/`) exists and is empty (or has only `package.json` / `convex.json` skeleton).
- [ ] API keys for chosen LLM provider(s) are loaded into shell environment.
- [ ] Stripe + Clerk + Convex + Anthropic + OpenAI accounts exist (per parent repo task list).

---

## Option A — Claude Code CLI

Claude Code reads `CLAUDE.md` at the repo root automatically. Place the prompt pack and point Claude Code at the parent repo.

### A.1 — One-shot issuance (build MVP)

```bash
cd ~/projects/verifiq-app
mkdir -p verifiq-prompts
cp -r /path/to/verifiq26/verifiq-prompts/* ./verifiq-prompts/
cp ./verifiq-prompts/CLAUDE.md ./CLAUDE.md   # Promote to repo root so Claude Code sees it

# Issue the build task
claude-code "Read CLAUDE.md, then verifiq-prompts/README.md, then files 01 through 18 in numerical order. Then build the VerifIQ MVP per file 10 § Definition of Done. Stop at MVP boundary — do not build Phase 2 features. Use the stack named in file 10 § Suggested stack. Place the application code in src/, schemas in src/schema/, prompt loaders in src/prompts/, LLM provider adapters in src/llm/, and UI components in src/components/."
```

### A.2 — Phased issuance (recommended)

Phase the build so you can review at each gate.

```bash
# Phase 1 — Skeleton + schema only
claude-code "Read CLAUDE.md and verifiq-prompts/05_output_schemas.md. Build the database schema, the TypeScript types for Finding / DisciplineSummary / BuildReadinessReport, and a minimal Convex deployment. Nothing else."

# Phase 2 — LLM provider adapter
claude-code "Read CLAUDE.md and verifiq-prompts/02_agent_architecture.md. Build a provider-agnostic LLM adapter supporting Anthropic Claude and OpenAI. Add a config layer that maps agent roles to providers."

# Phase 3 — Six MVP agents
claude-code "Read CLAUDE.md, verifiq-prompts/01_master_system_prompt.md, verifiq-prompts/04_agent_prompts.md, and verifiq-prompts/13_agent_self_check_protocol.md. Build the six MVP agents (Architect, Fire, Access, M&E, QS, Chair). Each agent loads the master prompt + the self-check protocol + the discipline prompt. Implement the 7 self-check questions as a pre-emit validator."

# Phase 4 — Workflow orchestration
claude-code "Read CLAUDE.md and verifiq-prompts/03_review_workflow.md. Build the 7-stage workflow orchestrator. Each stage is resumable and persists state to Convex."

# Phase 5 — Peer challenge + adjudicator
claude-code "Read CLAUDE.md and verifiq-prompts/07_council_prompts.md. Build the peer challenge engine (Stage 5) and the adjudicator engine (Stage 6). Adjudicator decisions are immutable once made; pre-state stays in audit_log."

# Phase 6 — Council Chair + reports
claude-code "Read CLAUDE.md and verifiq-prompts/07_council_prompts.md § 07.3 and verifiq-prompts/05_output_schemas.md § 05.3 + 05.5. Build the Council Chair agent and the export engine for PDF / DOCX / XLSX / CSV / JSON."

# Phase 7 — UI
claude-code "Read CLAUDE.md and verifiq-prompts/09_app_frontend_prompt.md. Build the Next.js 14 (App Router) UI. Use the bone-paper engineering register from the parent verifiq26 repo's website/verifiq-system.css and verifiq-cad.css. Build the 11 screens listed in file 10 § 11."

# Phase 8 — Lessons learnt loop
claude-code "Read CLAUDE.md, verifiq-prompts/14_feedback_taxonomy.md, and verifiq-prompts/15_lessons_learnt_loop.md. Build the feedback capture, persistence, aggregation, and weekly analyser. Schedule the Monday 9am cron via the parent repo's scheduled-tasks mechanism."
```

---

## Option B — OpenAI Codex CLI

```bash
cd ~/projects/verifiq-app

# Make the prompt pack accessible to Codex
mkdir -p verifiq-prompts
cp -r /path/to/verifiq26/verifiq-prompts/* ./verifiq-prompts/

# Issue with --read-all to ensure Codex ingests every file
codex --read-all verifiq-prompts/ "Read CLAUDE.md and README.md in verifiq-prompts/. Then read files 01 through 18 in order. Then build the VerifIQ MVP per file 10 § Definition of Done. Conform exactly to the schemas in file 05. Apply the self-check protocol in file 13 to every agent. Use the stack named in file 10 § Suggested stack."
```

### Codex-specific notes

- Codex's context window can hold all 18 files at once. Use `--read-all` to ensure ingestion.
- Codex tends to over-generate UI without coordination — use phased issuance (Option A.2 pattern) if you see scope-creep.
- Codex does not auto-load `CLAUDE.md` — you must reference it explicitly in the prompt.

---

## Option C — Direct API call (Anthropic, programmatic)

For team-led builds with a project manager driving the process:

```python
import anthropic
import os
from pathlib import Path

client = anthropic.Anthropic()

# Load every prompt file
prompt_dir = Path("./verifiq-prompts")
files = sorted(prompt_dir.glob("*.md"))
system_blocks = []
for f in files:
    system_blocks.append({
        "type": "text",
        "text": f"<file name=\"{f.name}\">\n{f.read_text()}\n</file>",
        "cache_control": {"type": "ephemeral"}  # Prompt caching reduces cost on re-invocation
    })

# Issue build task
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=64000,
    system=system_blocks,
    messages=[{
        "role": "user",
        "content": "Build the VerifIQ MVP per file 10 § Definition of Done. Deliver Phase 1 (Skeleton + schema) only in this iteration. Use TypeScript + Convex + Next.js 14. Output a single tarball with the file structure."
    }]
)

print(response.content[0].text)
```

### Cost note

With prompt caching, each subsequent invocation that includes the same prompt pack is ~90% cheaper than the first. Use this when iterating across phases.

---

## Option D — Hybrid (Claude Code + spec verification)

The recommended path for production builds.

1. **Use Claude Code for the build** (Option A.2 phased).
2. **Use a verification subagent** at each phase boundary:

```bash
# At end of each Claude Code phase, verify against the spec
claude-code --verify "Read verifiq-prompts/05_output_schemas.md and the just-generated code in src/schema/. Verify that every type in the schema is present in the code, that field names match exactly, and that no type is missing. Report any mismatches."

claude-code --verify "Read verifiq-prompts/08_guardrails.md and the just-generated agent prompts. Verify that the locked disclaimer is included in every output template, that banned verbs are not in any user-facing copy, and that the 16 guardrails are observable in code."
```

3. **Run an end-to-end smoke test** on a known-good test pack (the parent repo has a 327-finding validation pack at `verifiq26/evidence/findings-register-v0.8-scan-view.xlsx`).

---

## What success looks like at each gate

| Phase | Gate criterion |
|---|---|
| Phase 1 | Convex deployment running. Schema deployed. TypeScript types compile. |
| Phase 2 | `llm.complete(role, prompt)` works against both Anthropic and OpenAI. Provider toggle by env var. |
| Phase 3 | Each of the 6 agents returns valid Finding objects. Self-check validator rejects findings missing source quotes. |
| Phase 4 | A test project goes through all 7 stages without error. State is resumable. |
| Phase 5 | Peer challenges produced. Adjudicator decisions logged. |
| Phase 6 | Council Chair report generates. PDF + XLSX + JSON exports all valid. |
| Phase 7 | UI screens render. Real user can submit a project and see findings. |
| Phase 8 | Feedback can be captured. Aggregation runs. Weekly cron fires. |

---

## After issuance — first 7 days

Day 1: Issue Phase 1. Review schema. Approve.
Day 2: Issue Phase 2. Test LLM adapter against 3 sample prompts. Approve.
Day 3: Issue Phase 3. Run Architect agent against 1 sample document. Approve.
Day 4: Issue Phase 4. Run full workflow against 1 sample pack with 10 documents. Approve.
Day 5: Issue Phase 5 + 6. Generate first Build Readiness Report. Approve.
Day 6: Issue Phase 7. Test UI on local. Approve.
Day 7: Issue Phase 8. Wire feedback loop. Approve.

End of week 1: MVP candidate. Send to chartered reviewer panel for first-look.

---

## Common failure modes during issuance

| Symptom | Cause | Fix |
|---|---|---|
| Agent generates findings without source quotes | Self-check protocol not loaded on top of agent prompt | Re-issue Phase 3 with explicit "Load 13 + 04.X for each agent" |
| Banned verbs in marketing copy | Guardrails not visible to UI generation pass | Re-issue Phase 7 with explicit "Apply file 08 verb whitelist" |
| LLM provider hardcoded | Adapter pattern collapsed during code generation | Refactor with "Read file 02 § Provider abstraction. Refactor the adapter to use env vars + config." |
| Findings table flat-renders instead of grouping | UI defaulted to generic CRUD layout | Re-issue Phase 7 with the screen spec from file 09 |
| Adjudicator over-deletes findings | Adjudicator prompt didn't ingest the rules in file 06 + 07 | Re-issue Phase 5 with "Apply file 06 adjudicator escalation rules AND file 07 § 07.2 retention rules." |

---

## Once shipped

After MVP ships, the prompt pack itself becomes the source of truth for ALL future work:

- Every prompt change goes through the lessons-learnt loop (file 15).
- Every Phase 2+ feature is issued the same way — write a new instruction file, add it to `verifiq-prompts/`, issue with Claude Code or Codex.
- Every regulatory update is captured as a corpus version bump + an update to file 11 / 18.

The prompt pack and the application code evolve together. The prompt pack is reviewed quarterly with the chartered panel. The application code is reviewed continuously by the development team.

---

*Issue Phase 1 today. Review tomorrow. By next week you have an MVP candidate.*
