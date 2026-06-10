# VerifIQ App (Next.js 14 · App Router)

Initialised manually (no `create-next-app`) so it inherits the existing
`package.json` stack and the VerifIQ design system.

## Run

```bash
npm install
npm run dev        # http://localhost:3000  → Phase 1 design-system foundation
npm run typecheck  # tsc --noEmit
```

## What's here (Phase 1 — foundation)

- `app/theme.css` — dual-theme token layer (bone-paper **light** + **dark**),
  ported from `../website/verifiq-system.css`. Switch via `[data-theme]` on `<html>`.
- `app/globals.css` — base styles, type scale, and ported CAD components, all
  driven by semantic tokens (no raw hex in components).
- `components/theme/` — `ThemeProvider`, `useTheme`, no-flash init script, and a
  drawing-register `ThemeToggle`.
- `components/ui/` — `SheetTagButton`, `LeaderButton`, `SeverityPill`, `SourceQuote`.
- `app/page.tsx` — kitchen-sink rendering the system in both themes.
- `tailwind.config.ts` — Tailwind utilities mapped to the theme tokens.

## Next (per ../WEBSITE_REVIEW_ROADMAP.md)

- Phase 2 — marketing routes (`/`, `/verify`, `/hunt`, `/studio`, `/products`, `/pricing`, …).
- Phase 3 — authed app (Clerk) on the Convex schema in `convex/schema.ts`;
  UI reads/writes Convex only, never calls LLMs.
