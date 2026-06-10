# VerifIQ — React Rebuild & Remediation Roadmap

**Status:** Draft v2.0 · 2026-06-09 · *(supersedes v1.0 — direction changed to full React build + dual theme)*
**Decision:** Rebuild the entire product (marketing + app) as **Next.js + Convex**. The 21 static HTML pages in `website/` become **reference wireframes**, not the deliverable. Theme system is **dual**: bone-paper light + dark, user-selectable.

**Sources of truth:**
- Build spec / architecture rules / anti-patterns → `verifiq-prompts/10_developer_task_prompt.md` + `verifiq-prompts/CLAUDE.md`
- App copy + voice → `verifiq-prompts/09_app_frontend_prompt.md`
- Design tokens → `website/verifiq-system.css` + `website/verifiq-cad.css` (port into the React theme layer)
- Output schemas → `verifiq-prompts/05_output_schemas.md`
- Stack → `docs/27-stack-decision-storage-and-platform.md`

---

## 0 · Decisions

| # | Decision | Resolution |
|---|---|---|
| D1 | Theme model | **Dual theme.** Bone-paper = light option, dark = dark option. User-selectable toggle, persisted, respects `prefers-color-scheme`. Both are first-class (not customer-vs-staff). |
| D2 | Static HTML vs React | **Full React (Next.js 14 App Router).** Static pages are wireframe reference only — do **not** invest in re-skinning them. |
| D3 | `dashboard.html` | Drop. The cost-leak content is a hard anti-pattern; `dashboard-live.html` is the layout reference for the React console. |
| D4 | Missing Verify page | Verify is a section within the products/comparison route; `#verify` resolves there. |
| D5 | Founder name | Confirm **Doolan** vs **Dunne** (legal signature surface) — needed before any audit-log/report component ships. |

**Stack (per `10_developer_task_prompt.md`):** Next.js 14 (App Router) · Convex (TS, reactive, EU-West, file storage) · Clerk (multi-tenant auth) · Stripe + Stripe Tax · Anthropic primary / OpenAI fallback (provider-agnostic adapter) · Resend · Plausible · Vercel EU edge.

**Architecture rules (non-negotiable, `CLAUDE.md`):** UI never calls LLMs (status from Convex only) · prompts loaded from `verifiq-prompts/`, never inlined · findings schema is the single source of truth, UI imports the types · reports generated from *adjudicated* findings, never raw model output · customer never sees raw model output, confidence scores, or token/cost telemetry.

**Severity:** P0 = trust/leak/blocker · P1 = credibility/conversion · P2 = consistency · P3 = polish.
**Effort:** S ≤ 1d · M ≤ 3d · L ≤ 1wk · XL = multi-week.

---

## Phase 0 — Interim static-site safety (only if the static site is currently deployed)

If nothing is live yet, **skip this phase** — the React build replaces it. If the static `website/` is deployed anywhere public, kill the leaks first; everything else waits for React.

| ID | Task | Files | Sev |
|---|---|---|---|
| 0.1 | Remove/unpublish `dashboard.html` (inference cost, tokens, `€17.42` vs `€400`). | `website/dashboard.html` | P0 |
| 0.2 | Pull internal tools from public footer (Workflow, Onboard, Atelier, CAD Library). | `website/index.html:1174-1177`, `pricing.html` | P0 |
| 0.3 | Unpublish app wireframes (onboarding/upload/classify/dashboard-live/build-readiness/workflow-index) or `noindex` them. | `website/robots.txt` (new) | P0 |
| 0.4 | Archive root `VerifIQ - The Three Products (Plain English).html`. | repo root | P1 |

---

## Phase 1 — React foundation & design-token theme layer

Goal: a Next.js app with the VerifIQ design system expressed as a **dual-theme token layer**, plus the shared component kit. This is the bedrock everything else builds on.

| ID | Task | Detail | Sev | Effort |
|---|---|---|---|---|
| 1.1 | Scaffold Next.js 14 App Router on Vercel; TypeScript strict; ESLint/Prettier. | Monorepo or single app; `/` marketing, `/app` authed. | P0 | S |
| 1.2 | **Theme tokens.** Port `verifiq-system.css` `:root` into semantic CSS variables: `--bg`, `--surface`, `--text`, `--text-soft`, `--hairline`, `--accent-draft`, `--accent-brass`, severity (`--sev-critical/high/medium/low`). | Two themes via `[data-theme="light|dark"]` on `<html>`. Light maps to bone/ink; dark maps to `--black/--charcoal`/bone-text. Tune accent/severity contrast per theme. | P0 | M |
| 1.3 | **ThemeProvider + toggle.** Persist to `localStorage`, hydrate from `prefers-color-scheme`, no flash-of-wrong-theme (SSR-safe). | `useTheme()` hook + a header toggle component. | P0 | M |
| 1.4 | Port type scale & CAD components to React components: `Display/H1/H2/H3/Body/Lede/Label`, `SheetTagButton`, `LeaderButton`, `Bubble`, `RevCloud`, `SeverityPill`, `SourceQuote`, `TitleBlock`. | From `verifiq-cad.css`. Theme-aware via tokens. | P0 | L |
| 1.5 | Shared layout: `<TopNav>` (single source — fixes per-page divergence), `<Footer>` (one link set: Verify · Hunt · Studio · Pricing · Legal · Request the brief + contact), `<Section>`, `<Wrap>`. | Kills the inline-`<style>` duplication that *caused* the original drift. | P0 | M |
| 1.6 | Accessibility baked into primitives: real `<label>`s, `:focus-visible`, `prefers-reduced-motion`, AA contrast on body text (use `--text-soft` not raw graphite), text labels alongside colour-coded severity, `aria-live` for dynamic status. | Component-level, so it's done once. | P1 | M |

**Acceptance:** toggling light/dark swaps the whole app with no layout shift; no component hardcodes a hex outside the token layer; nav/footer defined once; Storybook (or a `/kitchen-sink` route) renders every component in both themes.

---

## Phase 2 — Marketing site in React

Goal: port the 13 good static marketing pages to React routes on the shared kit. Content fixes from the audit are applied during the port (touch each once).

| ID | Task | Sev | Effort |
|---|---|---|---|
| 2.1 | Routes: `/` (home), `/verify` `/hunt` `/studio`, `/products` (comparison; `#verify` resolves here), `/pricing`, `/about`, `/case-studies/01`, `/legal`, `/sub-processors`, `/solo-reviewer-policy`, `404`. | P0 | L |
| 2.2 | Fix three-products pricing conflicts vs pricing data; **single pricing source of truth** (one pricing module, no `#pricing`-vs-`pricing.html` split). | P1 | M |
| 2.3 | Repair dead links (`#verify`, `#privacy`, `#tos`); add real contact (`hello@verifiq.ie`). | P1 | S |
| 2.4 | Wire "Request the brief" form to Resend/Convex (real submission, real confirmation). One CTA label sitewide. | P1 | M |
| 2.5 | Normalise wordmark (Plex Serif 500), retire `V_IQ`, remove emojis, enforce sentence-case voice (`09`). | P2 | S |
| 2.6 | Reconcile founder name (D5) on legal/signature surfaces. | P1 | S |

**Acceptance:** Lighthouse/axe pass; one footer; one pricing surface; no dead links; form delivers email; both themes render every page.

---

## Phase 3 — The application (the real product, per `10`)

Goal: the authed VerifIQ app. **UI reads/writes Convex; never calls LLMs.** Customer sees the *council position*, never mechanics. Build the MVP slice first.

### 3a · Backend (Convex)
| ID | Task | Sev |
|---|---|---|
| 3.1 | Schema from `05_output_schemas.md`: users, projects, disciplines, documents, modules, findings, peer_challenges, adjudicated_findings, reports, actions, evidence, risk_ratings. Single source of truth; UI imports types. | P0 |
| 3.2 | Provider-agnostic LLM adapter (Anthropic primary, OpenAI fallback, Gemini-ready). Prompts loaded from `verifiq-prompts/`, never inlined. | P0 |
| 3.3 | Workflow orchestration: intake → classify/hash/route → discipline review → peer challenge → adjudication → build-readiness → report. Status emitted as Convex mutations (the only thing the UI reads). | P0 |
| 3.4 | Regulatory trigger engine (modules activate from intake answers). Audit log on every state transition. SHA-256 dedup; 14-day doc purge / 90-day hash / 30-day inference-log jobs; no model training. | P1 |

### 3b · App UI (Clerk auth, dual theme)
| ID | Screen | Copy source | Notes | Sev |
|---|---|---|---|---|
| 3.5 | Dashboard "Your projects" | `09` | No token/cost/confidence anywhere. | P0 |
| 3.6 | Project intake questionnaire | `09`/`10` field list | Corpus/modules set from answers. | P0 |
| 3.7 | Document upload by discipline | `09:103` "We'll classify, hash, and route" | No `tus.io`/chunk/"Failure modes (spec)"/"another tenant" leaks. | P0 |
| 3.8 | Confirm routing | — | **No confidence %** (`10:278` anti-pattern); no "improves the classifier". | P0 |
| 3.9 | Review run "Council in session" | `09:107` | Static/stepped status, **not** live-scan theatre. "In review · release by [date] · we'll email you." | P1 |
| 3.10 | Findings table | `09` | Every entry source-quoted; categorical severity, never a score. | P0 |
| 3.11 | Peer-challenge / adjudicated register | `07_council_prompts.md` | `council_decision` populated on every finding. | P1 |
| 3.12 | Build readiness | `09:115` | One of Proceed / Conditions / Pause / Insufficient. | P0 |
| 3.13 | Report export | `09:119` | PDF/DOCX/XLSX/CSV/JSON from **adjudicated** findings; reviewer signature on every export; locked disclaimer on every surface. Use `scan-result-free.html` as the output template. | P0 |

**MVP guardrail (`CLAUDE.md`):** 6 agents (Architect, Fire, Access, M&E, QS, Chair), 4 modules (Building Regs, FSC, DAC, BCAR), PDF+XLSX+JSON export only. Everything else is Phase 2 of the product.

**Anti-patterns that fail review (`10:272`):** chat UI · generic "AI Q&A" · unstructured findings · confidence scores · marketing voice in output. Council metaphor is **kept** (intended brand language, `09`/`CLAUDE.md`) — hide mechanics, not the council.

---

## Phase 4 — Production hardening & EU residency

| ID | Task | Sev |
|---|---|---|
| 4.1 | Self-host fonts (drop Google Fonts CDN), drop Tailwind CDN if used, self-host imagery (drop Unsplash) — EU-residency posture. | P1 |
| 4.2 | If R2 storage hybrid adopted, add Cloudflare R2 to `sub-processors.html`/legal before first paid scan (GDPR accuracy). | P1 |
| 4.3 | End-to-end validation on the 327-finding pack (`evidence/findings-register-v0.8-scan-view.xlsx`); verify disclaimer/source-quotes/single decision/audit log per `CLAUDE.md` Definition of Done. | P0 |
| 4.4 | Staff/reviewer console (defaults to dark theme) at `/staff` or subdomain; reviewer-queue visibility separate from customer view. | P1 |
| 4.5 | Stripe + Stripe Tax (EU VAT); Plausible analytics; performance budget; security review. | P1 |

---

## Issue → phase cross-reference (audit findings preserved)

| Audit finding | Lands in |
|---|---|
| dashboard.html cost/token/margin leak | D3 / 0.1 (interim) — not rebuilt |
| confidence % + "improves the classifier" | 1.6, 3.8 |
| upload plumbing (tus.io, "Failure modes (spec)", "another tenant") | 3.7 |
| internal tools in public footer | 1.5, 2.1 |
| dead links #verify/#privacy/#tos | 2.3 |
| fake `alert()` forms, no contact channel | 2.4, 2.3 |
| Doolan vs Dunne | D5 / 2.6 |
| root "Plain English" Stack C file ("wrong font" page) | 0.4 |
| three-products pricing conflict / unreachable | 2.2 |
| app journey on wrong design system | superseded by full React rebuild (Phase 3) |
| V_IQ wordmark / inconsistent logo | 1.5, 2.5 |
| CTA label fragmentation | 1.5, 2.4 |
| live-scan theatre / "Atelier Master" tabs | 3.9 |
| voice: title case / "scan" / emojis | 2.5, 3.x copy |
| "Council" rename (REJECTED — keep) | Phase 3 note |
| "AI-surfaced" softening | 3.10/3.13 copy |
| per-page CSS duplication (drift root cause) | 1.4, 1.5 |
| two pricing surfaces | 2.2 |
| accessibility (labels/focus/contrast/motion) | 1.6 |
| responsive grids/tables | 1.4 (component-level) |
| EU residency: CDN fonts/Tailwind/Unsplash; R2 | 4.1, 4.2 |
| dual light/dark theme | 1.2, 1.3 |

---

## Suggested execution order

1. **D1-D5 confirmed** + Phase 0 only if a static site is live.
2. **Phase 1** (foundation + dual-theme tokens + component kit) — everything depends on it.
3. **Phase 2** (marketing) and **Phase 3a** (Convex schema + adapter + workflow) can run in parallel once Phase 1 lands.
4. **Phase 3b** app screens against the live backend, MVP slice first (6 agents / 4 modules).
5. **Phase 4** hardening before first paid scan.
