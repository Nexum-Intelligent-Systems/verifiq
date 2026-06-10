# 11 · Source Anchors — Legal & Regulatory

**Use:** First-line official-source anchors for the product's regulatory knowledge base. These are the starting points for the corpus loader.

---

## Anchor table

| Area | Official anchor |
|---|---|
| Building Regulations / TGDs | Technical Guidance Documents are official guidance showing how Building Regulations requirements may be achieved; responsibility remains with designers, builders and owners. |
| Building Control / completion | Building Control guidance notes that compliance documentation and inspection plans are lodged before occupation/use, and FSC/DAC apply to commercial buildings and apartment blocks where required. |
| Commencement Notice | Commencement Notices are generally required in advance of new buildings, extensions or alterations, with BCMS registration by relevant parties. |
| Fire Safety Certificate | Fire Safety Certificates are required for proposals such as new buildings, extensions, material alterations or changes of use, subject to the relevant rules and exemptions. |
| Mental Health Commission | The MHC registers approved centres providing inpatient treatment and inspects approved centres. |
| Tusla early years | Tusla's QRF supports registered providers to comply with early years regulations and improve safety, quality and child experience. |

---

## Primary corpus sources to load (Ireland)

### Building Regulations

- Building Regulations 1997 (S.I. No. 497/1997) as amended.
- Building Control Act 1990 as amended.
- Building Control Regulations 1997 (S.I. No. 496/1997) as amended.
- Building Control (Amendment) Regulations 2014 (S.I. No. 9/2014) — BCAR.

### Technical Guidance Documents

- TGD A — Structure
- TGD B — Fire Safety (Vol 1 dwellings; Vol 2 other buildings)
- TGD C — Site Preparation and Resistance to Moisture
- TGD D — Materials and Workmanship
- TGD E — Sound
- TGD F — Ventilation
- TGD G — Hygiene
- TGD H — Drainage and Wastewater Disposal
- TGD J — Heat Producing Appliances
- TGD K — Stairways, Ladders, Ramps and Guards
- TGD L — Conservation of Fuel and Energy
- TGD M — Access and Use

### Building Control

- BCMS — Building Control Management System
- Code of Practice for Inspecting and Certifying Buildings and Works
- Code of Practice for the Procurement and Use of Construction Products

### Procurement / Contract

- Capital Works Management Framework (CWMF) — OGP
- PW-CF series (Public Works Contracts) — PW-CF1, PW-CF3, PW-CF5
- CESMM4 Revised
- ARM4 + Supplement 1 Issue 2

### Sector regulators

- HIQA — Health Act 2007 (designated centres)
- Mental Health Commission — Mental Health Act 2001 (approved centres)
- Tusla — Child Care Act 1991 (Early Years Services) Regulations
- HSE PCM — Project Cost Management framework
- HBN / HTM — Health Building Notes / Health Technical Memoranda (UK-origin, used in Irish healthcare context)

### Standards

- I.S. (Irish Standards via NSAI)
- I.S. EN (European Standards adopted in Ireland)
- EN + Irish National Annex
- Eurocodes (EN 1990–1999) + Irish NAs
- BS 8300-2 (accessibility — referenced in Irish practice)
- BS 9991 (fire safety in residential — referenced)

---

## Anchors for future markets (Phase 2+)

### United Kingdom

- Building Safety Act 2022
- Building Regulations 2010 (as amended)
- Approved Documents
- Architects Act 1997
- Defective Premises Act 1972
- Building Safety Regulator (HSE)

### Australia (NSW)

- Design and Building Practitioners Act 2020 (NSW)
- National Construction Code (NCC)
- Building Practitioners Acts (per state)
- Building Commission NSW

### Canada (Ontario)

- Ontario Building Code Act 1992
- Ontario Building Code (Part 11 — qualified persons)
- Ontario Architects Act
- Professional Engineers Act
- PIPEDA (federal)
- Quebec Law 25 (provincial privacy)

### EU (Germany / Netherlands)

- EU AI Act 2024
- Product Liability Directive 2024
- GDPR
- Architektengesetz (per German state)
- Bouwbesluit (Netherlands)

### United States

- State Architecture / Engineering Practice Acts (per state)
- FTC Act § 5 + state UDAAP
- HIPAA (healthcare)
- State privacy laws (CCPA/CPRA, VCDPA, CTDPA, etc.)
- State AI laws (NYC Local Law 144, Colorado AI Act 2024)
- IBC + state amendments

---

## Corpus loader requirements

The corpus loader must:

1. **Subscribe to authoritative sources** where API/feed available (NSAI, BSI when added, Standards Australia when added, etc.).
2. **Hash every standard** so changes propagate to corpus version bumps.
3. **Version-stamp every finding** with the corpus version applied during review.
4. **Survive standard updates mid-pack** — if a standard is superseded during a review, the audit log records which version was in force when the finding was generated.
5. **Refuse to operate on superseded-only knowledge** — system must alert if any active standard is more than 30 days behind the publisher's latest revision.

---

## Licensing posture

- Free public standards used during pilot (TGD A–M, BCAR SI 9/2014, CWMF, PW-CF, HBN/HTM where free).
- NSAI subscription budgeted at Phase 4 trigger (€4.5–€8.2k/yr).
- BSI subscription budgeted at UK launch (~€18–32k/yr).
- Standards Australia + CSA + ASTM each at jurisdictional launch.
- All licences signed at the GovIQ Ltd company level, not per-user.

---

## Brutal note on this corpus

The full Irish corpus is large but largely free at the point of use. Do not over-engineer the loader before the first paying customer. Index TGD A–M + BCAR + CWMF + PW-CF + the two most-cited sector codes for the customer's sector. Defer NSAI subscription until live customer demand justifies it (per Doc 14).
