# VerifIQ Corpus — Regimental Check Engine (source of truth)

This folder is the **single source of truth** for the whole review methodology.
Both engines consume it:

- **Engine A — Claude Code (now):** I read these files + a real tender pack and run the
  checks by hand, producing the *golden* findings the product is measured against.
- **Engine B — the VerifIQ product (Convex):** a seed script imports these files into the
  `corpus` / `checkCatalogue` tables and the pipeline runs the identical checks at scale.

> One catalogue, two engines. Nothing is built twice. What I validate by hand is exactly
> what ships.

## Why two layers (authority vs assertion)

Raw TGD/standard prose is *evidence*, not an executable check. So we split them:

```
corpus/
  standards/     # AUTHORITY  — the actual clause text you cite (TGDs, I.S., HTM, FSC/DAC guidance)
  checks/        # ASSERTIONS — the executable point-checks, each linked to a standards anchor
    cross/       #   the cross-discipline propagation checks (Fire/DAC/FSC ↔ M&E ↔ Elec, etc.)
```

Every finding must cite a `standards/` anchor. Every check is one atomic, auditable
assertion. That is what makes **"no exceptions"** provable: each of the ~500 checks returns
`found | clean | na | insufficient_evidence` — never a silent skip. Coverage reads as
**"checked 247/260 · 13 N/A · 19 findings."**

## What I need from YOU (and what I do NOT)

| Give me | Where it goes | Format |
|---|---|---|
| The TGDs, I.S. standards, HTMs, FSC/DAC guidance, PW-CF/CWMF docs | `corpus/standards/` | MD (use `_TEMPLATE.md`) or raw PDF — I'll convert |
| Any check lists / spreadsheets you already have, however rough | hand them to me directly | anything |
| **One real (or sanitised) tender pack** — for the pilot, the slice that matters: fire strategy / FSC / DAC + M&E spec + electrical spec + a few drawings | tell me the path / upload | PDF |

**Do NOT** hand-author 500 perfect checks. Deriving and normalising them into the catalogue
is my job — you supply the source documents and your domain corrections.

## Standards file naming + anchors

One file per standard, kebab-case by code+version, e.g.:

```
standards/tgd-b-2024.md
standards/is-en-15650.md
standards/is-3218-2024.md
standards/is-3217-2023.md
standards/htm-04-01.md
standards/fsc-dac-guidance.md
```

Each clause gets a stable anchor `#<clause>` (e.g. `tgd-b-2024#3.5.7`) so a check can point
at exactly the text that justifies it. See `standards/_TEMPLATE.md`.

## Pilot status

`checks/cross/fire-mech-elec.checks.yaml` — **seeded** with the Fire/DAC/FSC ↔ M&E ↔ Elec
propagation matrix. This is the first thing we run against your real pack.

Next: as you drop standards in, I expand each discipline toward its full ~100 points and the
cross matrix toward the 500 total, staged behind module activation (a pack only runs the
checks its building type triggers).
