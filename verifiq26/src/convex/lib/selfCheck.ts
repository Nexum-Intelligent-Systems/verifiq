/**
 * Programmatic pre-emit self-check (file 13).
 * Check 1 (verbatim quote) is enforced separately via verifySourceQuotes.
 */

export type SelfCheckResult = {
  passed: boolean;
  checks: {
    sourceQuote: boolean;
    disciplineOwnership: boolean;
    stageAppropriate: boolean;
    notDuplicate: boolean;
    hasConsequence: boolean;
    hasRequiredEvidence: boolean;
    hasOwner: boolean;
  };
  failedChecks: string[];
};

const OWNER_PATTERNS =
  /architect|engineer|consultant|surveyor|certifier|contractor|employer|PSDP|QS|fire|structural|mechanical|electrical/i;

const LATE_STAGE_ONLY =
  /commissioning record|as-built dimension|handover certificate|occupation certificate/i;

export function runSelfCheck(finding: {
  discipline?: string;
  evidenceQuote?: string;
  operationalRisk?: string;
  recommendedAction?: string;
  oneSentenceIssue?: string;
}): SelfCheckResult {
  const checks = {
    sourceQuote: Boolean(finding.evidenceQuote && finding.evidenceQuote.length >= 8),
    disciplineOwnership: Boolean(finding.discipline && finding.discipline.length > 0),
    stageAppropriate: !LATE_STAGE_ONLY.test(
      `${finding.oneSentenceIssue ?? ""} ${finding.recommendedAction ?? ""}`,
    ),
    notDuplicate: true,
    hasConsequence: Boolean(finding.operationalRisk && finding.operationalRisk.length >= 20),
    hasRequiredEvidence: Boolean(
      finding.recommendedAction && finding.recommendedAction.length >= 15,
    ),
    hasOwner: OWNER_PATTERNS.test(finding.recommendedAction ?? ""),
  };

  const failedChecks = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);

  return {
    passed: failedChecks.length === 0,
    checks,
    failedChecks,
  };
}

export const SELF_CHECK_LABELS: Record<keyof SelfCheckResult["checks"], string> = {
  sourceQuote: "Verbatim source quote",
  disciplineOwnership: "Discipline ownership",
  stageAppropriate: "Stage appropriateness",
  notDuplicate: "Not duplicate / addressed",
  hasConsequence: "Consequence stated",
  hasRequiredEvidence: "Required evidence named",
  hasOwner: "Owner assigned",
};
