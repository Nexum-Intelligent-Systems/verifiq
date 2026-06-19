"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  REGULATORY_MODULES,
  totalRegulatoryChecks,
  type RegulatoryCheck,
} from "@/lib/regulatoryCatalog";
import { disciplineProgressLabel, disciplineProgressPct } from "./pipelineProgress";

const PIPELINE_STAGES = [
  { key: "uploading", label: "Intake" },
  { key: "classifying", label: "Classify" },
  { key: "confirm_classify", label: "Confirm" },
  { key: "scanning", label: "Review" },
  { key: "cross_ref", label: "Cross-ref" },
  { key: "peer_challenge", label: "Peer challenge" },
  { key: "adjudicate", label: "Adjudicate" },
  { key: "reviewer_queue", label: "Council report" },
] as const;

const COUNCIL_STAGES = [
  { key: "peer_challenge", label: "Peer challenge", pct: 33 },
  { key: "adjudicate", label: "Adjudication", pct: 66 },
  { key: "chair", label: "Council chair", pct: 85 },
  { key: "complete", label: "Report ready", pct: 100 },
] as const;

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

function stageIndex(phase: string): number {
  const idx = PIPELINE_STAGES.findIndex((s) => s.key === phase);
  return idx >= 0 ? idx : 0;
}

function checksActiveForPhase(phase: string, councilPhase: string): RegulatoryCheck[] {
  const all = REGULATORY_MODULES.flatMap((m) => m.checks);
  if (phase === "classifying" || phase === "uploading") {
    return all.slice(0, 8);
  }
  if (phase === "scanning") return all;
  if (phase === "cross_ref") return all.filter((c) => c.disciplines.includes("cross") || c.module === "MOD-08");
  if (phase === "peer_challenge" || councilPhase === "peer_challenge") {
    return all.filter((c) => c.module === "MOD-02" || c.module === "MOD-04");
  }
  if (phase === "adjudicate" || councilPhase === "adjudicate") return all;
  return all.slice(0, 12);
}

type PipelineConsoleProps = {
  projectId: Id<"projects">;
  phase: string;
  councilPhase: string;
  progressPct: number;
  councilProgressPct: number;
  filesClassified: number;
  filesTotal: number;
  filesProcessed: number;
  activeStage?: string;
  activeDetail?: string;
  disciplineUploads: Array<{
    discipline: string;
    scanStatus: string;
    classificationStatus?: string;
    fileCount: number;
    filesClassified?: number;
    filesScanned?: number;
    findingsCount: number;
    currentActivity?: string;
    currentFileName?: string;
  }>;
  pipelineJobs: Array<{
    jobType: string;
    status: string;
    discipline?: string;
    error?: string;
  }>;
};

export function PipelineConsole({
  projectId,
  phase,
  councilPhase,
  progressPct,
  councilProgressPct,
  filesClassified,
  filesTotal,
  filesProcessed,
  activeStage,
  activeDetail,
  disciplineUploads,
  pipelineJobs,
}: PipelineConsoleProps) {
  const activity = useQuery(api.pipeline.getActivity, { projectId, limit: 40 });
  const councilReport = useQuery(api.findings.getCouncilReport, { projectId });

  const currentStageIdx = stageIndex(phase);
  const activeChecks = checksActiveForPhase(phase, councilPhase);
  const classifyPct =
    filesTotal > 0 ? Math.round((filesClassified / filesTotal) * 100) : 0;
  const scanPct = filesTotal > 0 ? Math.round((filesProcessed / filesTotal) * 100) : 0;

  return (
    <section className="mb-10 space-y-8">
      {/* Master pipeline stepper */}
      <div className="border border-[var(--gold)]/25 bg-[var(--surface)] p-6 md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
          Pipeline · {totalRegulatoryChecks()} regulatory checks in corpus
        </p>
        <h2 className="mt-2 font-serif text-lg uppercase tracking-widest">
          Live orchestration
        </h2>
        {(activeDetail || activeStage) && (
          <p className="mt-2 font-mono text-xs text-[var(--gold-light)]">
            {activeStage && <span className="uppercase">{activeStage}</span>}
            {activeDetail && <span className="text-[var(--muted)]"> · {activeDetail}</span>}
          </p>
        )}

        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-[640px] gap-1">
            {PIPELINE_STAGES.map((stage, i) => {
              const done = i < currentStageIdx;
              const active = stage.key === phase;
              return (
                <div key={stage.key} className="flex-1">
                  <div
                    className={`h-1.5 transition-colors ${
                      done
                        ? "bg-[var(--gold)]"
                        : active
                          ? "bg-[var(--gold)]/70 animate-pulse"
                          : "bg-[var(--border)]"
                    }`}
                  />
                  <p
                    className={`mt-2 font-mono text-[9px] uppercase tracking-wider ${
                      active ? "text-[var(--gold)]" : done ? "text-[var(--gold-light)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {stage.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <ProgressBar value={progressPct} label="Overall" size="sm" />
          <ProgressBar
            value={classifyPct}
            label="Classification"
            hint={`${filesClassified} / ${filesTotal} files tagged`}
            size="sm"
          />
          <ProgressBar
            value={scanPct}
            label="Corpus review"
            hint={`${filesProcessed} / ${filesTotal} files read against TGD · BCAR · planning`}
            size="sm"
          />
          <ProgressBar
            value={councilProgressPct}
            label="Council deliberation"
            hint={councilPhase === "complete" ? "Report issued" : `Phase: ${councilPhase}`}
            size="sm"
          />
        </div>
      </div>

      {/* Council sub-pipeline */}
      <div className="border border-[var(--gold)]/20 bg-[var(--surface)] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
          Council pipeline
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COUNCIL_STAGES.map((s) => {
            const active =
              councilPhase === s.key ||
              (s.key === "peer_challenge" && phase === "peer_challenge");
            const done =
              councilPhase === "complete" ||
              COUNCIL_STAGES.findIndex((x) => x.key === councilPhase) >
                COUNCIL_STAGES.findIndex((x) => x.key === s.key);
            return (
              <div
                key={s.key}
                className={`border p-3 ${active ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--gold)]/15"}`}
              >
                <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest">
                  <span className={active ? "text-[var(--gold)]" : "text-[var(--muted)]"}>
                    {s.label}
                  </span>
                  <span className="tabular-nums text-[var(--gold-light)]">
                    {done ? "✓" : active ? "…" : "—"}
                  </span>
                </div>
                <ProgressBar
                  value={done ? 100 : active ? s.pct : 0}
                  showPercent={false}
                  size="sm"
                />
              </div>
            );
          })}
        </div>

        {councilReport && (
          <div className="mt-4 border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--gold)]">
              Build readiness · {councilReport.buildReadinessRating}
            </p>
            <p className="mt-2 font-serif text-sm">{councilReport.executiveDecision}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{councilReport.summary}</p>
          </div>
        )}
      </div>

      {/* Regulatory check matrix */}
      <div className="border border-[var(--gold)]/20 bg-[var(--surface)] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
          Active regulatory searches
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Corpus-driven checks — TGD, BCAR SI 9/2014, planning, I.S. standards — not keyword search
        </p>
        <div className="mt-4 space-y-6">
          {REGULATORY_MODULES.map((mod) => {
            const modChecks = mod.checks.filter((c) =>
              activeChecks.some((a) => a.id === c.id),
            );
            if (modChecks.length === 0 && phase !== "scanning") return null;
            const showChecks = phase === "scanning" ? mod.checks : modChecks;
            if (showChecks.length === 0) return null;
            return (
              <div key={mod.code}>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-[10px] text-[var(--gold)]">{mod.code}</span>
                  <span className="font-serif text-xs uppercase tracking-wider">{mod.name}</span>
                  <span className="font-mono text-[9px] text-[var(--muted)]">{mod.anchor}</span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {showChecks.map((check) => (
                    <li
                      key={check.id}
                      className="flex gap-2 font-mono text-[10px] text-[var(--muted)]"
                    >
                      <span className="shrink-0 text-[var(--gold)]/60">▸</span>
                      <span>
                        <span className="text-[var(--gold-light)]">{check.standard}</span>
                        {" — "}
                        {check.check}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-discipline real progress */}
      {disciplineUploads.length > 0 && (
        <div className="border border-[var(--gold)]/20 bg-[var(--surface)] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
            Discipline gates
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {disciplineUploads.map((du) => (
              <div key={du.discipline} className="border border-[var(--gold)]/15 p-4">
                <div className="flex justify-between">
                  <span className="font-serif text-xs uppercase tracking-wider">
                    {DISCIPLINE_LABELS[du.discipline] ?? du.discipline}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums">
                    {disciplineProgressPct(du)}%
                  </span>
                </div>
                <ProgressBar
                  value={disciplineProgressPct(du)}
                  showPercent={false}
                  size="sm"
                />
                <p className="mt-2 truncate font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">
                  {disciplineProgressLabel(du)}
                </p>
                <div className="mt-2 flex gap-3 font-mono text-[9px] tabular-nums text-[var(--muted)]">
                  <span>
                    cls {du.filesClassified ?? 0}/{du.fileCount}
                  </span>
                  <span>
                    scan {du.filesScanned ?? 0}/{du.fileCount}
                  </span>
                  <span>{du.findingsCount} findings</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job queue */}
      {pipelineJobs.length > 0 && (
        <div className="border border-[var(--gold)]/20 bg-[var(--surface)] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
            Job queue
          </p>
          <ul className="mt-3 space-y-2">
            {pipelineJobs.slice(-12).map((job, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest"
              >
                <span className="text-[var(--gold-light)]">{job.jobType}</span>
                <span
                  className={
                    job.status === "succeeded"
                      ? "text-emerald-400/80"
                      : job.status === "running"
                        ? "text-[var(--gold)]"
                        : job.status === "failed"
                          ? "text-red-400"
                          : "text-[var(--muted)]"
                  }
                >
                  {job.status}
                </span>
                {job.discipline && (
                  <span className="text-[var(--muted)]">{job.discipline}</span>
                )}
                {job.error && <span className="text-red-400">{job.error}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Activity feed */}
      <div className="border border-[var(--gold)]/20 bg-[var(--surface)] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
          Activity feed
        </p>
        {activity === undefined ? (
          <p className="mt-4 text-sm text-[var(--muted)]">Loading…</p>
        ) : activity.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Events appear here as intake, classification, review, and council stages run.
          </p>
        ) : (
          <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
            {[...activity].reverse().map((ev) => (
              <li
                key={ev._id}
                className="border-l-2 border-[var(--gold)]/30 pl-3 font-mono text-[10px]"
              >
                <span className="uppercase tracking-widest text-[var(--gold)]/80">
                  {ev.stage}
                </span>
                {ev.discipline && (
                  <span className="ml-2 text-[var(--muted)]">{ev.discipline}</span>
                )}
                <p className="mt-0.5 text-[var(--gold-light)]">{ev.message}</p>
                {ev.fileName && (
                  <p className="truncate text-[var(--muted)]">{ev.fileName}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
