/**
 * VerifIQ — Standards Corpus + Skill Persona Loader
 *
 * Loads the curated Irish standards corpus per discipline and constructs the
 * cache-friendly system prompt for Claude.
 *
 * The corpus is versioned. Each scan records the corpus version used so findings
 * can be re-evaluated when standards update.
 *
 * The system prompt is the LARGE static block we want Anthropic to prompt-cache.
 * Its structure:
 *
 *   <persona>
 *     You are a chartered Irish [discipline] reviewer with 30 years experience.
 *     You produce indicative findings for verification — NOT professional opinions.
 *     ...
 *   </persona>
 *
 *   <authority_corpus>
 *     [list of standards with effective dates, key clauses, supersession]
 *   </authority_corpus>
 *
 *   <check_rules>
 *     [pattern library: NBS-drift, withdrawn standards, wrong-project markers]
 *   </check_rules>
 *
 *   <output_schema>
 *     [JSON schema for findings — every field required]
 *   </output_schema>
 *
 *   <quality_rules>
 *     - Every finding MUST cite verbatim evidence_quote from source
 *     - Severity must justify against listed criteria
 *     - regulatoryBasis must match an entry in <authority_corpus>
 *   </quality_rules>
 */

interface CorpusEntry {
  code: string;
  body: string;
  status: "current" | "superseded" | "withdrawn";
  effectiveDate?: string;
  supersedes?: string;
  supersededDate?: string;
  keyClauses: { ref: string; summary: string }[];
  commonReferences: string[];
  cutPasteMarkers: string[];
}

interface DisciplineCorpus {
  discipline: string;
  version: string;
  entries: CorpusEntry[];
  personaText: string;
  checkRules: string[];
}

// ===================================================
// LOAD CORPUS (production: from Convex `corpus` table)
// ===================================================

export async function loadDisciplineCorpus(
  discipline: string,
  version: string
): Promise<DisciplineCorpus> {
  // Production: query Convex `corpus` table by discipline + version
  // POC: returns a hardcoded slim corpus for the architectural discipline only
  if (discipline === "arch") return ARCH_CORPUS_V_2026_06;
  if (discipline === "cs") return CS_CORPUS_V_2026_06;
  if (discipline === "mech") return MECH_CORPUS_V_2026_06;
  if (discipline === "elec") return ELEC_CORPUS_V_2026_06;
  if (discipline === "fire") return FIRE_CORPUS_V_2026_06;
  throw new Error(`Unknown discipline: ${discipline}`);
}

// ===================================================
// BUILD SYSTEM PROMPT (CACHED BY ANTHROPIC)
// ===================================================

export function buildSystemPrompt(discipline: string, corpus: DisciplineCorpus): string {
  return `<persona>
${corpus.personaText}
</persona>

<authority_corpus version="${corpus.version}">
${corpus.entries.map(formatEntry).join("\n\n")}
</authority_corpus>

<check_rules>
${corpus.checkRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}
</check_rules>

<output_schema>
Return findings as a JSON array. Each finding must have these fields:
{
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "category": "compliance" | "cost" | "programme" | "contract" | "document_hygiene" | "operational",
  "oneSentenceIssue": "Plain English, max 240 chars",
  "document": "Source document name",
  "sectionLocation": "Clause / sheet / section ref",
  "regulatoryBasis": "Standard citation, must match authority_corpus",
  "operationalRisk": "What happens if not corrected",
  "recommendedAction": "Drafted corrective text (not just a description)",
  "evidenceQuote": "Verbatim quote from source — required, will be verified",
  "element": "Wall / Sanitary / Drainage / etc.",
  "standardCode": "Compact tag e.g. 'TGD-B 2024 §3.5.5'"
}
</output_schema>

<quality_rules>
- Every finding MUST include a verbatim evidence_quote that appears character-for-character in the source document
- regulatoryBasis MUST cite a standard or clause that exists in the authority_corpus above
- Severity must be defensible: CRITICAL = breach with material risk; HIGH = breach with moderate risk; MEDIUM = inconsistency or hygiene; LOW = polish
- Output ONLY the JSON array. No commentary, no markdown headers, no preamble.
- If no findings are warranted, return []
- Findings whose evidence_quote cannot be verified against the source will be dropped
</quality_rules>`;
}

function formatEntry(e: CorpusEntry): string {
  let s = `[${e.code}] (${e.body}, ${e.status}`;
  if (e.effectiveDate) s += `, effective ${e.effectiveDate}`;
  if (e.supersededDate) s += `, superseded ${e.supersededDate}`;
  s += ")";
  if (e.supersedes) s += ` — supersedes ${e.supersedes}`;
  if (e.keyClauses.length > 0) {
    s += "\n  Key clauses:";
    for (const c of e.keyClauses) s += `\n    - ${c.ref}: ${c.summary}`;
  }
  if (e.commonReferences.length > 0) {
    s += `\n  Commonly referenced as: ${e.commonReferences.join(", ")}`;
  }
  if (e.cutPasteMarkers.length > 0) {
    s += `\n  WARNING - cut-paste markers: ${e.cutPasteMarkers.join("; ")}`;
  }
  return s;
}

// ===================================================
// CORPUS DATA (slim POC versions — production loads from DB)
// ===================================================

const ARCH_CORPUS_V_2026_06: DisciplineCorpus = {
  discipline: "arch",
  version: "v.2026.06",
  personaText: "You are an RIAI Chartered Architect with 30 years of Irish public-sector design experience, performing an indicative document-quality check on a tender pack section. You catch outdated standards, NBS-Chorus drift, schedule inconsistencies, file substitutions, and jurisdictional mis-references. You do NOT certify, sign off, or provide professional opinions.",
  entries: [
    {
      code: "TGD-B Vol 2",
      body: "Building Regulations Technical Guidance Document, Fire Safety, Non-domestic",
      status: "current",
      effectiveDate: "2024-12",
      supersedes: "TGD-B Vol 2 (2006 Reprint 2020)",
      keyClauses: [
        { ref: "§3.5.5", summary: "Compartment walls in non-residential institutional/assembly buildings require min. 60 min fire resistance" },
        { ref: "§3.5.7", summary: "Service penetrations in compartment walls must maintain rating" },
        { ref: "§3.5.9-3.5.14", summary: "Compartment construction detailing requirements" },
      ],
      commonReferences: ["TGD-B 2024", "Part B Vol 2"],
      cutPasteMarkers: ["TGD B 2006 reprint 2020", "Approved Document B (UK)", "BS 9999 only"],
    },
    {
      code: "TGD-M",
      body: "Building Regulations Technical Guidance Document, Access and Use",
      status: "current",
      effectiveDate: "2022-04",
      keyClauses: [
        { ref: "§2.2", summary: "Universal access provisions" },
      ],
      commonReferences: ["Part M"],
      cutPasteMarkers: ["Approved Document M (UK)"],
    },
    {
      code: "BS 8300-2",
      body: "Design of buildings to meet the needs of disabled people — Code of practice",
      status: "current",
      effectiveDate: "2018",
      keyClauses: [
        { ref: "§18.6", summary: "Disabled refuge alarm requirements" },
      ],
      commonReferences: ["BS 8300-2:2018"],
      cutPasteMarkers: ["BS 5588 (withdrawn)"],
    },
    {
      code: "SI 9/2014",
      body: "Building Control (Amendment) Regulations — BCAR",
      status: "current",
      effectiveDate: "2014-03",
      keyClauses: [
        { ref: "Reg 5", summary: "Designer responsibility for design info quality" },
        { ref: "Reg 9", summary: "Ancillary Certificate allocation by designer" },
      ],
      commonReferences: ["BCAR", "SI 9 of 2014"],
      cutPasteMarkers: ["CDM Regulations 2015 (UK)", "Approved Documents (UK)"],
    },
  ],
  checkRules: [
    "Flag references to BS 9999 alone — TGD-B 2024 governs in Ireland",
    "Flag 'Approved Document' references — UK terminology, Irish equivalent is TGD",
    "Flag K10 partition specs that specify REI 30 only — confirm REI 60 type exists for compartment walls",
    "Flag schedules with content that does not match the schedule title (e.g. Windows Schedule containing stair drawings)",
    "Flag duplicate drawing numbers in registers",
    "Flag NBS-Chorus boilerplate referring to wrong project, building type, or jurisdiction",
    "Flag standards prefix errors (e.g. 'IS EN 10101' does not exist — should be 'I.S. 10101')",
    "Flag missing FSC condition propagation when an FSC condition exists",
    "Flag drawings without status code, revision, or scale",
    "Flag specifications referring to plant or features not shown on drawings",
  ],
};

const CS_CORPUS_V_2026_06: DisciplineCorpus = {
  discipline: "cs",
  version: "v.2026.06",
  personaText: "You are a Chartered Engineer (CEng MIEI / FIStructE) Civil & Structural Designer / BCAR Assigned Certifier with 30 years of Irish public-sector experience, performing an indicative document-quality check on a structural and civil tender pack section.",
  entries: [
    {
      code: "EN 1992-1-1",
      body: "Eurocode 2: Design of concrete structures — General rules + Irish NA",
      status: "current",
      effectiveDate: "2004 + IS NA 2010",
      keyClauses: [
        { ref: "§4.4.1", summary: "Concrete cover for durability" },
      ],
      commonReferences: ["Eurocode 2", "EC2"],
      cutPasteMarkers: ["BS 8110 (withdrawn)"],
    },
    {
      code: "I.S. EN 1997-1",
      body: "Eurocode 7: Geotechnical design + Irish NA",
      status: "current",
      effectiveDate: "2005 + IS NA",
      keyClauses: [
        { ref: "§2.4", summary: "Geotechnical categories (GC1/GC2/GC3) require formal GI for GC2+" },
      ],
      commonReferences: ["EC7"],
      cutPasteMarkers: ["BS 5930 alone"],
    },
    {
      code: "GDSDS",
      body: "Greater Dublin Strategic Drainage Study — guidance for SuDS",
      status: "current",
      keyClauses: [
        { ref: "Vol 5", summary: "Surface water attenuation — QBAR greenfield discharge" },
      ],
      commonReferences: ["GDSDS", "Greater Dublin SuDS"],
      cutPasteMarkers: ["BRE 365 alone for soakaway sizing"],
    },
    {
      code: "I.S. EN 13670",
      body: "Execution of concrete structures",
      status: "current",
      effectiveDate: "2010",
      keyClauses: [
        { ref: "§4", summary: "Execution classes (EXC1/EXC2/EXC3) — EXC2 minimum for healthcare" },
      ],
      commonReferences: ["EN 13670"],
      cutPasteMarkers: [],
    },
  ],
  checkRules: [
    "Flag foundation design notes referring to 'undisturbed and firm soil' without bearing pressure stated",
    "Flag absence of Ground Investigation report reference",
    "Flag SW attenuation calcs using BRE 365 only (soakaway) without QBAR",
    "Flag concrete spec without exposure class + chloride class + DS class stated",
    "Flag steel spec without execution class (I.S. EN 1090) stated",
    "Flag boilerplate text referring to basements / lift pits / multi-storey loadbearing walls when project is single-storey",
    "Flag retaining walls without surcharge / soil parameter / FoS calculation",
    "Flag absence of Consequence Class / Reliability Class declaration",
  ],
};

const MECH_CORPUS_V_2026_06: DisciplineCorpus = {
  discipline: "mech",
  version: "v.2026.06",
  personaText: "You are a Chartered Engineer (CEng MIEI Building Services) M&E designer with 30 years of Irish healthcare and public-sector experience, performing an indicative document-quality check on a mechanical tender pack section.",
  entries: [
    {
      code: "I.S. EN 15650",
      body: "Ventilation for buildings — Fire dampers + Irish NA",
      status: "current",
      effectiveDate: "2010",
      supersedes: "BS 476 Part 8:1972 (fire test method)",
      keyClauses: [
        { ref: "§4", summary: "CE-marking under CPR (EU) 305/2011 required" },
      ],
      commonReferences: ["EN 15650"],
      cutPasteMarkers: ["BS 476 Part 8: 1972 (withdrawn)"],
    },
    {
      code: "HTM 04-01",
      body: "Safe water in healthcare premises",
      status: "current",
      keyClauses: [
        { ref: "Pt B", summary: "Legionella control regime required" },
      ],
      commonReferences: ["HTM 04-01", "HSE L8"],
      cutPasteMarkers: [],
    },
    {
      code: "EU 2024/573",
      body: "F-Gas Regulation",
      status: "current",
      effectiveDate: "2024-03",
      supersedes: "EU 517/2014",
      keyClauses: [
        { ref: "Art 3", summary: "Refrigerant labelling and leak detection requirements" },
      ],
      commonReferences: ["F-Gas 2024", "EU F-Gas Regulation"],
      cutPasteMarkers: ["EU 517/2014 only"],
    },
    {
      code: "I.S. EN 16282-7",
      body: "Equipment for commercial kitchens — fire suppression",
      status: "current",
      keyClauses: [
        { ref: "§5", summary: "Deep fat fryer hood suppression requirements" },
      ],
      commonReferences: ["IS EN 16282-7"],
      cutPasteMarkers: ["Ansul without standard reference"],
    },
  ],
  checkRules: [
    "Flag fire damper specs referring to BS 476 Pt 8:1972 — withdrawn",
    "Flag absence of Legionella regime (HTM 04-01 / HSE L8) in healthcare buildings",
    "Flag absence of F-Gas EU 2024/573 compliance clauses",
    "Flag kitchen specs with deep-fat-fryer without IS EN 16282-7 suppression",
    "Flag boilerplate 'boiler house' references in heat-pump-only projects",
    "Flag 'twin wall pressurised flue' / 'for each dwelling' / residential gas language in commercial projects",
    "Flag plant schedule items not coordinated with arch GA plan space allocations",
  ],
};

const ELEC_CORPUS_V_2026_06: DisciplineCorpus = {
  discipline: "elec",
  version: "v.2026.06",
  personaText: "You are a Chartered Engineer (CEng MIEI Electrical) with 30 years of Irish healthcare and public-sector experience, performing an indicative document-quality check on an electrical tender pack section.",
  entries: [
    {
      code: "I.S. 10101:2020+A1:2024",
      body: "National Rules for Electrical Installations",
      status: "current",
      effectiveDate: "2024-A1",
      supersedes: "ET 101:2008",
      keyClauses: [
        { ref: "§701", summary: "Special locations — bathrooms / wet areas" },
      ],
      commonReferences: ["I.S. 10101", "National Wiring Rules"],
      cutPasteMarkers: ["BS 7671 (UK)", "IEE 16th Edition", "BS 7430 only"],
    },
    {
      code: "I.S. 3218:2024",
      body: "Fire detection and fire alarm systems for buildings",
      status: "current",
      effectiveDate: "2024",
      supersedes: "I.S. 3218:2013",
      keyClauses: [
        { ref: "§6", summary: "Cause-and-effect matrix mandatory" },
      ],
      commonReferences: ["IS 3218:2024"],
      cutPasteMarkers: ["IS 3218:2013", "BS 5839 alone"],
    },
    {
      code: "I.S. 3217:2023",
      body: "Emergency lighting",
      status: "current",
      effectiveDate: "2023",
      supersedes: "I.S. 3217:2013",
      keyClauses: [
        { ref: "§5", summary: "3-hour duration minimum for escape routes" },
      ],
      commonReferences: ["IS 3217:2023"],
      cutPasteMarkers: ["IS 3217:2013"],
    },
  ],
  checkRules: [
    "Flag references to BS 7671 / IEE 16th Edition / BS 5486 — replaced by I.S. 10101:2020+A1:2024",
    "Flag references to IS 3218:2013 — superseded by IS 3218:2024",
    "Flag wrong-project boilerplate (e.g. 'school in Convent Hill, Ballina, Co. Mayo')",
    "Flag school lighting notes in non-school projects",
    "Flag classroom / GP Hall / Caretaker references in commercial healthcare projects",
    "Flag VAT in BoQ at 21% — correct Irish standard rate is 23% (since 2024)",
    "Flag absence of disabled refuge alarm spec where BS 8300-2 §18.6 applies",
  ],
};

const FIRE_CORPUS_V_2026_06: DisciplineCorpus = {
  discipline: "fire",
  version: "v.2026.06",
  personaText: "You are a chartered fire engineer (IFE Grade Member or higher) with 30 years of Irish FSC and TGD-B experience, performing an indicative document-quality check on a fire safety tender pack section.",
  entries: [
    {
      code: "TGD-B Vol 2",
      body: "Building Regulations Technical Guidance Document, Fire Safety, Non-domestic",
      status: "current",
      effectiveDate: "2024-12",
      keyClauses: [
        { ref: "§B1", summary: "Means of escape" },
        { ref: "§B3", summary: "Compartmentation" },
        { ref: "§B5", summary: "Fire appliance access" },
      ],
      commonReferences: ["TGD-B 2024"],
      cutPasteMarkers: ["TGD-B 2006 reprint 2020 alone"],
    },
    {
      code: "SI 496/2009",
      body: "Building Control Regulations — FSC and DAC procedures",
      status: "current",
      keyClauses: [
        { ref: "§11", summary: "Revised FSC required for design changes during construction" },
      ],
      commonReferences: ["SI 496/2009"],
      cutPasteMarkers: [],
    },
  ],
  checkRules: [
    "Flag FSC conditions not propagated through downstream design (M&E, Arch fire-stopping)",
    "Flag design changes that may trigger SI 496 §11 revised FSC requirement",
    "Flag two TGD-B versions in same document (e.g. 2024 in body, 2006 reprint 2020 in conditions)",
  ],
};
