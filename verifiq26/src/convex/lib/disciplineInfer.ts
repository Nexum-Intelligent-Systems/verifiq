export const DISCIPLINE_CODES = ["arch", "cs", "mech", "elec", "fire", "qs", "bcar"] as const;
export type DisciplineCode = (typeof DISCIPLINE_CODES)[number];

export function classifyByFilename(fileName: string): {
  discipline: string | null;
  docType: string;
  confidence: number;
} {
  const lower = fileName.toLowerCase();

  let docType = "unknown";
  if (/(drawing|drwg|dwg|plan|elev|sect|detail|GA|RCP|key[- ]plan)/.test(lower)) docType = "drawing";
  else if (/(spec|specification|NBS)/.test(lower)) docType = "specification";
  else if (/(schedule|sched|register|sched\.|finishes)/.test(lower)) docType = "schedule";
  else if (/(report|narrative|design[- ]statement)/.test(lower)) docType = "report";
  else if (/(calc|calcs|calculation|bending|attenuation)/.test(lower)) docType = "calc";
  else if (/(BoQ|bill[- ]of[- ]quantities|FoT|ITT|pricing)/.test(lower)) docType = "boq";
  else if (/(FSC|fire[- ]cert|DAC|safety[- ]cert)/.test(lower)) docType = "certification";

  let discipline: string | null = null;
  let conf = 0.5;
  if (/(-AR-|RHA-AR-|architect|RIAI)/.test(fileName)) {
    discipline = "arch";
    conf = 0.92;
  } else if (/(-CS-|-CV-|RHA-CS-|structural|KMP-CS)/.test(fileName)) {
    discipline = "cs";
    conf = 0.92;
  } else if (/(-ME-|-MECH-|RHA-ME-|HVAC|plumb)/.test(fileName)) {
    discipline = "mech";
    conf = 0.9;
  } else if (/(-EE-|-EL-|RHA-EE-|electrical|elec[ -])/.test(fileName)) {
    discipline = "elec";
    conf = 0.9;
  } else if (/(fire|ORS|FSC)/.test(lower) && docType === "report") {
    discipline = "fire";
    conf = 0.85;
  } else if (docType === "boq" || /quantit|surveyor/.test(lower)) {
    discipline = "qs";
    conf = 0.88;
  }

  if (/(drawing[- ]register|issue[- ]sheet|DR[ -]?\d+|RG-)/.test(lower)) {
    docType = "register";
    conf = Math.max(conf, 0.95);
  }

  return { discipline, docType, confidence: conf };
}

/** Route a file to a discipline gate from ZIP path and filename (full-suite upload). */
export function inferDisciplineFromPath(filePath: string, fileName: string): DisciplineCode {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();

  const folderRules: [RegExp, DisciplineCode][] = [
    [/(\/|^)(arch|architectural|architecture|ar)(\/|$)/, "arch"],
    [/(\/|^)(cs|civil|structural|structure|cv)(\/|$)/, "cs"],
    [/(\/|^)(mech|mechanical|me|hvac|plumbing)(\/|$)/, "mech"],
    [/(\/|^)(elec|electrical|ee|el)(\/|$)/, "elec"],
    [/(\/|^)(fire|fsc|ors)(\/|$)/, "fire"],
    [/(\/|^)(qs|quantity|surveyor|boq|pricing|commercial)(\/|$)/, "qs"],
    [/(\/|^)(bcar|certifier|assigned)(\/|$)/, "bcar"],
  ];

  for (const [pattern, code] of folderRules) {
    if (pattern.test(normalized)) {
      return code;
    }
  }

  const fromName = classifyByFilename(fileName);
  if (fromName.discipline && isDisciplineCode(fromName.discipline)) {
    return fromName.discipline;
  }
  if (fromName.docType === "boq") {
    return "qs";
  }

  return "arch";
}

export function isDisciplineCode(value: string): value is DisciplineCode {
  return (DISCIPLINE_CODES as readonly string[]).includes(value);
}

export function disciplineLabel(code: string): string {
  const labels: Record<DisciplineCode, string> = {
    arch: "Architectural",
    cs: "Civil / Structural",
    mech: "Mechanical",
    elec: "Electrical",
    fire: "Fire",
    qs: "Quantity Surveying",
    bcar: "BCAR",
  };
  return isDisciplineCode(code) ? labels[code] : code;
}
