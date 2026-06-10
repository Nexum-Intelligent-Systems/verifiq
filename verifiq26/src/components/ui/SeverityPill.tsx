export type Severity = "critical" | "high" | "medium" | "low";

const LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/**
 * Categorical severity tag. Severity is never a score or percentage
 * (see verifiq-prompts/10_developer_task_prompt.md anti-patterns).
 * Colour + text label together (not colour alone) for accessibility.
 */
export function SeverityPill({ severity }: { severity: Severity }) {
  return <span className={`sev sev-${severity}`}>{LABELS[severity]}</span>;
}
