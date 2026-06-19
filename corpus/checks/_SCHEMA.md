# Check Catalogue — schema

One YAML file per discipline (`fire.checks.yaml`, `mech.checks.yaml`, …) and per
cross-discipline pair under `cross/`. Each file is a list of `CheckPoint`s.

## CheckPoint fields

```yaml
- id: FIRE-MECH-DMP-001        # stable, unique. <ORIGIN>-<AGAINST>-<TOPIC>-<n> for cross checks
  title: Fire damper at every compartment penetration
  discipline: cross             # single discipline (fire/mech/elec/arch/cs/qs/bcar) OR "cross"
  appliesTo: [fire-strategy, fsc, dac, me-spec, me-drawing]   # doc kinds this check reads
  question: >                   # ONE assertion, answerable found/clean/na/insufficient
    Does every fire/compartment-wall penetration shown or required by the fire strategy
    have a corresponding fire damper in the M&E ductwork design?
  authority:                    # standards anchors that justify the check
    - tgd-b-2024#3.5.7
    - is-en-15650#4
  severity: HIGH                # default: CRITICAL | HIGH | MEDIUM | LOW (the model may revise with reason)
  evidence: cross_doc           # textual | numeric | absence | visual | cross_doc
  crossRef:                     # ONLY for evidence: cross_doc — the propagation rule
    governing: fire             # the source-of-truth discipline/document
    against: [mech]             # the downstream discipline(s) that must honour it
    rule: >
      Extract every compartment/fire-rated penetration condition from the fire strategy / FSC.
      For each, assert a matching fire damper appears in the M&E ductwork schedule or drawings,
      CE-marked to I.S. EN 15650. Flag any governing condition with no downstream match.
  module: fire-life-safety      # activation group — pack only runs checks whose module applies
```

## Evidence kinds (drives which gate runs)

- `textual` — a verbatim quote must exist in the source (strict/normalised/fuzzy gate).
- `numeric` — a value/threshold check (e.g. VAT 23%, 3-hour duration).
- `absence` — flags something that *should* be present but is missing (no quote to match;
  evidence is the surrounding context + the standard).
- `visual` — read from a drawing via vision; cite the transcribed title-block/region.
- `cross_doc` — relational: extract a fact from the **governing** doc, assert it is honoured
  in the **against** doc(s). This is the propagation matrix.

## Output per check (every check is accounted for)

```yaml
checkId: FIRE-MECH-DMP-001
status: found | clean | na | insufficient_evidence
severity: HIGH                  # confirmed or revised, with reason if changed
finding:                        # present only when status == found
  oneSentenceIssue: ...
  governingEvidence: "<verbatim from fire strategy/FSC>"   # the condition
  downstreamEvidence: "<verbatim from M&E, or 'NOT FOUND'>" # the (missing) response
  sourceRefs: [ "Fire Strategy p.12", "M&E Duct Schedule M-501" ]
  recommendedAction: ...
```

`found` → a finding. `clean`/`na`/`insufficient_evidence` → no finding, but **recorded**, so
coverage is complete and "zero findings" is diagnosable (emitted=0 → prompt/model;
emitted>0 & persisted=0 → gate).
