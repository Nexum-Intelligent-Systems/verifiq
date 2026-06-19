/**
 * Regulatory check catalog — mirrors corpus check_rules + module triggers.
 * Shown in the Atelier console so operators see what TGD / BCAR / Planning
 * searches the council is running (not hidden inside the LLM).
 */

export type RegulatoryCheck = {
  id: string;
  module: string;
  standard: string;
  check: string;
  disciplines: string[];
};

export type RegulatoryModule = {
  code: string;
  name: string;
  anchor: string;
  checks: RegulatoryCheck[];
};

export const REGULATORY_MODULES: RegulatoryModule[] = [
  {
    code: "MOD-01",
    name: "Building Regulations (TGD A–M)",
    anchor: "S.I. 497/1997 + TGD suite",
    checks: [
      {
        id: "tgd-b-version",
        module: "MOD-01",
        standard: "TGD-B Vol 2 (2024)",
        check: "Fire compartment walls — REI 60 in institutional/assembly (§3.5.5)",
        disciplines: ["arch", "fire"],
      },
      {
        id: "tgd-b-penetration",
        module: "MOD-01",
        standard: "TGD-B Vol 2",
        check: "Service penetrations maintain compartment rating (§3.5.7)",
        disciplines: ["arch", "mech", "elec", "fire"],
      },
      {
        id: "tgd-m-access",
        module: "MOD-01",
        standard: "TGD-M (2022)",
        check: "Universal access provisions demonstrated (§2.2)",
        disciplines: ["arch"],
      },
      {
        id: "uk-tgd-drift",
        module: "MOD-01",
        standard: "TGD suite",
        check: "No UK 'Approved Document' references — Irish TGD governs",
        disciplines: ["arch", "mech", "elec", "fire", "cs"],
      },
      {
        id: "withdrawn-bs",
        module: "MOD-01",
        standard: "I.S. / I.S. EN",
        check: "No withdrawn BS-only references where Irish standard supersedes",
        disciplines: ["mech", "elec", "cs"],
      },
    ],
  },
  {
    code: "MOD-02",
    name: "Fire Safety Certificate",
    anchor: "Building Control Act 1990 §11 · SI 496/2009",
    checks: [
      {
        id: "fsc-propagation",
        module: "MOD-02",
        standard: "FSC + TGD-B",
        check: "FSC conditions propagated to Arch / M&E / Elec drawings and specs",
        disciplines: ["fire", "arch", "mech", "elec"],
      },
      {
        id: "fsc-revision",
        module: "MOD-02",
        standard: "SI 496/2009 §11",
        check: "Design changes triggering revised FSC requirement flagged",
        disciplines: ["fire"],
      },
      {
        id: "fire-dampers",
        module: "MOD-02",
        standard: "I.S. EN 15650",
        check: "Fire dampers CE-marked; no BS 476 Pt 8:1972 test references",
        disciplines: ["mech", "fire"],
      },
      {
        id: "alarm-cause-effect",
        module: "MOD-02",
        standard: "I.S. 3218:2024",
        check: "Fire alarm cause-and-effect matrix present (§6)",
        disciplines: ["elec", "fire"],
      },
    ],
  },
  {
    code: "MOD-04",
    name: "BCAR (SI 9/2014)",
    anchor: "Building Control (Amendment) Regulations 2014",
    checks: [
      {
        id: "bcar-designer-duty",
        module: "MOD-04",
        standard: "SI 9 Reg 5",
        check: "Designer responsibility for design information quality",
        disciplines: ["bcar", "arch", "cs"],
      },
      {
        id: "bcar-ancillary",
        module: "MOD-04",
        standard: "SI 9 Reg 9",
        check: "Ancillary Certificate allocation — named designer per element",
        disciplines: ["bcar"],
      },
      {
        id: "bcar-uk-cdm",
        module: "MOD-04",
        standard: "SI 9/2014",
        check: "No UK CDM 2015 boilerplate in Irish BCAR context",
        disciplines: ["bcar", "arch"],
      },
    ],
  },
  {
    code: "MOD-05",
    name: "Planning Conditions",
    anchor: "Planning & Development Act 2000",
    checks: [
      {
        id: "planning-grant-align",
        module: "MOD-05",
        standard: "Planning grant",
        check: "Drawings and specs reflect granted planning permission",
        disciplines: ["arch"],
      },
      {
        id: "planning-conditions",
        module: "MOD-05",
        standard: "Condition schedule",
        check: "Material planning conditions tracked with evidence owner",
        disciplines: ["arch"],
      },
      {
        id: "conservation",
        module: "MOD-05",
        standard: "Section 51 P&D Act",
        check: "Protected Structure — conservation methodology if triggered",
        disciplines: ["arch"],
      },
    ],
  },
  {
    code: "MOD-06",
    name: "Electrical (I.S. 10101)",
    anchor: "National Rules for Electrical Installations",
    checks: [
      {
        id: "is-10101-version",
        module: "MOD-06",
        standard: "I.S. 10101:2020+A1:2024",
        check: "No BS 7671 / IEE 16th Edition references",
        disciplines: ["elec"],
      },
      {
        id: "emergency-lighting",
        module: "MOD-06",
        standard: "I.S. 3217:2023",
        check: "Emergency lighting 3-hour escape route duration (§5)",
        disciplines: ["elec"],
      },
      {
        id: "refuge-alarm",
        module: "MOD-06",
        standard: "BS 8300-2 §18.6",
        check: "Disabled refuge alarm specified where applicable",
        disciplines: ["elec", "arch"],
      },
    ],
  },
  {
    code: "MOD-07",
    name: "Structural / Civil",
    anchor: "Eurocodes + Irish NA · GDSDS",
    checks: [
      {
        id: "gi-reference",
        module: "MOD-07",
        standard: "I.S. EN 1997-1",
        check: "Ground Investigation report referenced for GC2+",
        disciplines: ["cs"],
      },
      {
        id: "suds-qbar",
        module: "MOD-07",
        standard: "GDSDS Vol 5",
        check: "Surface water attenuation — QBAR not BRE 365 soakaway alone",
        disciplines: ["cs"],
      },
      {
        id: "concrete-exposure",
        module: "MOD-07",
        standard: "EN 1992-1-1",
        check: "Concrete exposure + chloride + durability class stated",
        disciplines: ["cs"],
      },
    ],
  },
  {
    code: "MOD-08",
    name: "Tender / QS",
    anchor: "CWMF · PW-CF5",
    checks: [
      {
        id: "boq-scope",
        module: "MOD-08",
        standard: "BoQ / FoT",
        check: "BoQ line items represented in design specs and drawings",
        disciplines: ["qs", "arch", "mech"],
      },
      {
        id: "vat-rate",
        module: "MOD-08",
        standard: "Irish VAT",
        check: "VAT at 23% (not legacy 21%) in Irish public tender pricing",
        disciplines: ["qs"],
      },
      {
        id: "descriptor-drift",
        module: "MOD-08",
        standard: "Cross-discipline",
        check: "Project name / client / address consistent across title blocks",
        disciplines: ["cross"],
      },
    ],
  },
];

export function totalRegulatoryChecks(): number {
  return REGULATORY_MODULES.reduce((sum, m) => sum + m.checks.length, 0);
}

export function checksForDiscipline(discipline: string): RegulatoryCheck[] {
  return REGULATORY_MODULES.flatMap((m) =>
    m.checks.filter((c) => c.disciplines.includes(discipline)),
  );
}
