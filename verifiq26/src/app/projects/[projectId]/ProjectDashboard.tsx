"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StartReviewButton, TenderUploadPanel } from "@/components/project/TenderUploadPanel";
import {
  computePipelineProgress,
  disciplineProgressLabel,
  disciplineProgressPct,
} from "@/components/project/pipelineProgress";

const PHASE_LABELS: Record<string, string> = {
  pending: "Pending",
  uploading: "Uploading",
  classifying: "Classifying",
  confirm_classify: "Confirm classification",
  scanning: "Scanning",
  cross_ref: "Cross-reference",
  peer_challenge: "Peer challenge",
  adjudicate: "Adjudicating",
  reviewer_queue: "Reviewer queue",
  released: "Released",
};

const DISCIPLINE_LABELS: Record<string, string> = {
  arch: "Architectural",
  cs: "Civil / Structural",
  mech: "Mechanical",
  elec: "Electrical",
  fire: "Fire",
  qs: "Quantity Surveying",
  bcar: "BCAR",
  cross: "Cross-discipline",
};

function disciplineLabel(code: string): string {
  return DISCIPLINE_LABELS[code] ?? code;
}

function toPillSeverity(severity: string): "critical" | "high" | "medium" | "low" {
  return severity.toLowerCase() as "critical" | "high" | "medium" | "low";
}

function cardStateClass(scanStatus: string): string {
  switch (scanStatus) {
    case "pending":
      return "opacity-60 border-[var(--gold)]/10";
    case "queued":
      return "border-[var(--gold)]/45 bg-[var(--gold)]/5";
    case "scanning":
      return "border-[var(--gold)]/70 bg-[var(--gold)]/10 shadow-[0_0_30px_rgba(197,160,89,0.1)]";
    case "completed":
      return "border-[var(--gold)]/35";
    default:
      return "border-[var(--gold)]/20";
  }
}

export function ProjectDashboard({ projectId }: { projectId: Id<"projects"> }) {
  const state = useQuery(api.scanState.getState, { projectId });
  const findings = useQuery(api.findings.listByProject, { projectId });

  if (state === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center text-[var(--muted)]">
        Loading project state…
      </div>
    );
  }

  if (state === null) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-[var(--muted)]">Project not found.</p>
      </div>
    );
  }

  const phaseLabel = PHASE_LABELS[state.phase] ?? state.phase;
  const recentFindings = (findings ?? []).slice(0, 8);
  const pipeline = computePipelineProgress(
    state.phase,
    state.disciplineUploads,
    state.progressPct,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <header className="mb-10 border border-[var(--gold)]/20 bg-[var(--surface)] p-6 md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
          Atelier Console · Live
        </p>
        <h1 className="mt-2 font-serif text-2xl uppercase tracking-widest md:text-4xl">
          {state.project.name}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          {state.project.contractType ?? "PW-CF5"} · Tier {state.project.tier ?? "mid"}
        </p>

        <StartReviewButton
          variant="header"
          projectId={projectId}
          phase={state.phase}
          phaseLabel={phaseLabel}
          uploadCount={state.disciplineUploads.length}
          classifyProgress={pipeline.classify}
          reviewProgress={pipeline.review}
        />

        <div className="mt-6 flex flex-wrap gap-6 font-mono text-xs">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-[var(--muted)]">Phase</div>
            <div className="mt-1 text-[var(--gold-light)]">{phaseLabel}</div>
          </div>
          <div className="h-8 w-px bg-[var(--gold)]/20" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-[var(--muted)]">Progress</div>
            <div className="mt-1 tabular-nums">{state.progressPct}%</div>
          </div>
          <div className="h-8 w-px bg-[var(--gold)]/20" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-[var(--muted)]">Files</div>
            <div className="mt-1 tabular-nums">
              {state.filesProcessed} / {state.filesTotal}
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--gold)]/20" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-[var(--muted)]">Findings</div>
            <div className="mt-1 tabular-nums">{state.findingsCount}</div>
          </div>
        </div>

        {/* Overall progress */}
        <div className="mt-6">
          <ProgressBar
            value={pipeline.overall}
            label="Overall pack progress"
            hint={`${phaseLabel} · ${state.filesProcessed} / ${state.filesTotal} files · ${state.findingsCount} findings`}
            size="lg"
          />
        </div>

        {state.disciplineUploads.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ProgressBar
              value={pipeline.intake}
              label="Intake"
              hint="ZIP extracted into discipline gates"
            />
            <ProgressBar
              value={pipeline.classify}
              label="Classification"
              hint="Document types tagged per file"
            />
            <ProgressBar
              value={pipeline.review}
              label="Review"
              hint="Discipline scans and findings"
            />
          </div>
        )}
      </header>

      <TenderUploadPanel projectId={projectId} />
      {state.disciplineUploads.length > 0 && (
        <StartReviewButton
          variant="panel"
          projectId={projectId}
          phase={state.phase}
          phaseLabel={phaseLabel}
          uploadCount={state.disciplineUploads.length}
          classifyProgress={pipeline.classify}
          reviewProgress={pipeline.review}
        />
      )}

      {/* Severity summary */}
      <section className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(
          [
            ["CRITICAL", state.severityCounts.critical],
            ["HIGH", state.severityCounts.high],
            ["MEDIUM", state.severityCounts.medium],
            ["LOW", state.severityCounts.low],
          ] as const
        ).map(([severity, count]) => (
          <div
            key={severity}
            className="border border-[var(--gold)]/20 bg-[var(--surface)] p-4 text-center"
          >
            <SeverityPill severity={toPillSeverity(severity)} />
            <div className="mt-2 font-mono text-2xl tabular-nums">{count}</div>
          </div>
        ))}
      </section>

      {/* Discipline cards */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-sm uppercase tracking-widest text-[var(--gold)]">
          Disciplines
        </h2>
        {state.disciplineUploads.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Upload a discipline ZIP above to begin classification and review.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.disciplineUploads.map((du) => (
              <div
                key={du.discipline}
                className={`border p-4 transition-colors ${cardStateClass(du.scanStatus)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-serif text-sm uppercase tracking-wider">
                    {disciplineLabel(du.discipline)}
                  </div>
                  <span className="font-mono text-[10px] tabular-nums text-[var(--gold-light)]">
                    {disciplineProgressPct(du)}%
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    value={disciplineProgressPct(du)}
                    showPercent={false}
                    size="sm"
                  />
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  {disciplineProgressLabel(du)}
                </div>
                <div className="mt-3 flex gap-4 font-mono text-xs tabular-nums">
                  <span>{du.fileCount} files</span>
                  <span>{du.findingsCount} findings</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent findings feed */}
      <section>
        <h2 className="mb-4 font-serif text-sm uppercase tracking-widest text-[var(--gold)]">
          Recent findings
        </h2>
        {recentFindings.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Findings will appear here as discipline scans complete.
          </p>
        ) : (
          <ul className="space-y-3">
            {recentFindings.map((f) => (
              <li
                key={f._id}
                className="border border-[var(--gold)]/15 bg-[var(--surface)] p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[10px] text-[var(--gold)]">{f.findingId}</span>
                  <SeverityPill severity={toPillSeverity(f.severity)} />
                  <span className="font-mono text-[10px] uppercase text-[var(--muted)]">
                    {disciplineLabel(f.discipline)}
                  </span>
                </div>
                <p className="mt-2 text-sm">{f.oneSentenceIssue}</p>
                {f.sourceFile && (
                  <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                    {f.sourceFile}
                    {f.sourcePageRange ? ` · ${f.sourcePageRange}` : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
