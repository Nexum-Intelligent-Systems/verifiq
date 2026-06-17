"use client";

/**
 * Project page — live status + the findings register. `useQuery` is reactive, so
 * findings stream in as the council runs (no polling). "Run sample review"
 * dispatches the shared sample pack to the engine via requestReview.
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { buildSamplePack, ACTIVE_STATES } from "../../_lib/sample-pack";

type Severity = "critical" | "high" | "medium" | "low";

const STATE_LABELS: Record<string, string> = {
  pending: "Ready to upload",
  uploading: "Receiving files",
  classifying: "Analysing documents",
  confirm_classify: "Classifications need review",
  scanning: "Council is reading",
  cross_ref: "Cross-referencing",
  peer_challenge: "Peers are challenging",
  adjudicate: "Adjudicating findings",
  reviewer_queue: "Awaiting reviewer sign-off",
  released: "Read complete",
};

function sevClass(risk: string): string {
  const r = risk.toLowerCase();
  return `sev-${["critical", "high", "medium", "low"].includes(r) ? r : "low"}`;
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as Id<"projects">;

  const status = useQuery(api.projectData.getProjectStatus, { project_id: projectId });
  const findings = useQuery(api.projectData.getProjectFindings, { project_id: projectId });
  const requestReview = useMutation(api.reviewData.requestReview);

  const [busy, setBusy] = useState(false);

  const working = status ? ACTIVE_STATES.has(status.scan_state) : false;
  const stateLabel = status ? (STATE_LABELS[status.scan_state] ?? status.scan_state) : null;

  async function runSample() {
    setBusy(true);
    try {
      const pack = buildSamplePack();
      await requestReview({
        project_id: projectId,
        payload_json: JSON.stringify({ ...pack, projectId }),
      });
    } finally {
      setBusy(false);
    }
  }

  const by = status?.by_severity ?? { critical: 0, high: 0, medium: 0, low: 0 };

  const classifyingMsg =
    status?.scan_state === "classifying"
      ? "Analysing your documents — this takes a few minutes. The council will start automatically when done."
      : status?.scan_state === "confirm_classify"
        ? "Some documents have low-confidence classifications. Review them before starting the read."
        : null;

  return (
    <div>
      <a className="eyebrow" href="/">
        ← All projects
      </a>
      <h1 className="page-title">{status ? status.name : "Loading…"}</h1>
      <p className="lede">
        {status ? (
          <>
            <span className={`state-pill ${working ? "state-working" : "state-done"}`}>
              {stateLabel}
            </span>
            {working && status.scan_state !== "classifying" && status.scan_state !== "confirm_classify"
              ? " — the council is reading…"
              : !working
                ? " — read complete."
                : ""}
          </>
        ) : (
          "Fetching status…"
        )}
      </p>

      {classifyingMsg && (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--ink-soft)", margin: "0 0 20px", padding: "12px 16px", border: "1px solid var(--amber)", background: "var(--vellum)" }}>
          {classifyingMsg}
        </p>
      )}

      <div className="status-band">
        <div className="cell">
          <div className="num">{status?.finding_count ?? "—"}</div>
          <div className="lab">Findings</div>
        </div>
        <div className="cell">
          <div className="num sev-critical">{by.critical}</div>
          <div className="lab">Critical</div>
        </div>
        <div className="cell">
          <div className="num sev-high">{by.high}</div>
          <div className="lab">High</div>
        </div>
        <div className="cell">
          <div className="num sev-medium">{by.medium}</div>
          <div className="lab">Medium</div>
        </div>
        <div className="cell">
          <div className="num">{by.low}</div>
          <div className="lab">Low</div>
        </div>
      </div>

      {status?.scan_state !== "classifying" && status?.scan_state !== "confirm_classify" && (
        <button className="btn" onClick={runSample} disabled={busy || working}>
          {busy ? "Dispatching…" : working ? "Reading…" : "Run sample review →"}
        </button>
      )}

      <h2 style={{ margin: "34px 0 16px" }}>Findings register</h2>
      {findings === undefined ? (
        <p className="empty">Loading findings…</p>
      ) : findings.length === 0 ? (
        <p className="empty">
          {working
            ? status?.scan_state === "classifying"
              ? "No findings yet — still analysing documents."
              : "No findings yet. The council is reading."
            : "No findings yet. Run a review to populate the register."}
        </p>
      ) : (
        <div>
          {findings.map(
            (f: {
              _id: string;
              risk: string;
              issue_id: string;
              discipline_origin: string;
              requirement: string;
              finding: string;
              source_document: string;
              source_reference: string;
            }) => (
              <div className="finding" key={f._id}>
                <div className="finding-head">
                  <span className={`sev solid ${sevClass(String(f.risk))}`}>
                    {String(f.risk).toUpperCase()}
                  </span>
                  <span className="issue-id">
                    {f.issue_id} · {f.discipline_origin}
                  </span>
                </div>
                <p className="req">{f.requirement}</p>
                <p className="body">{f.finding}</p>
                <div className="source-quote">
                  {f.source_document}
                  <span className="src-ref">{f.source_reference}</span>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
