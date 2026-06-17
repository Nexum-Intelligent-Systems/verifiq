"use client";

import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { DragEvent, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ProgressBar } from "@/components/ui/ProgressBar";

const DISCIPLINES = [
  { code: "arch", label: "Architectural" },
  { code: "cs", label: "Civil / Structural" },
  { code: "mech", label: "Mechanical" },
  { code: "elec", label: "Electrical" },
  { code: "fire", label: "Fire" },
  { code: "qs", label: "Quantity Surveying" },
  { code: "bcar", label: "BCAR" },
] as const;

type UploadMode = "single" | "full-suite";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uploadZipWithProgress(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<{ storageId: Id<"_storage"> }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as { storageId: Id<"_storage"> });
        return;
      }
      reject(new Error("Storage upload failed"));
    });
    xhr.addEventListener("error", () => reject(new Error("Storage upload failed")));
    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Content-Type", "application/zip");
    xhr.send(file);
  });
}

export function TenderUploadPanel({ projectId }: { projectId: Id<"projects"> }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const submitDisciplineZip = useMutation(api.staffUploads.submitDisciplineZip);
  const submitFullSuiteZip = useMutation(api.staffUploads.submitFullSuiteZip);

  const [mode, setMode] = useState<UploadMode>("full-suite");
  const [discipline, setDiscipline] = useState<string>("arch");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (busy) return;
    if (!isAuthenticated) {
      setError("Sign in to upload tender packs.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Please choose a .zip file.");
      return;
    }

    setBusy(true);
    setError(null);
    setUploadPct(0);
    setStatus(`Uploading ${file.name} (${formatBytes(file.size)})…`);

    try {
      const uploadUrl = await generateUploadUrl({});
      const { storageId } = await uploadZipWithProgress(uploadUrl, file, setUploadPct);
      setUploadPct(100);

      if (mode === "full-suite") {
        setStatus("Splitting pack into discipline gates — watch progress bars below…");
        await submitFullSuiteZip({ projectId, zipStorageId: storageId });
        setStatus("Full suite queued. Progress bars update as each gate extracts and classifies.");
      } else {
        setStatus("Extracting files and classifying — watch progress bars below…");
        await submitDisciplineZip({
          projectId,
          discipline,
          zipStorageId: storageId,
        });
        setStatus("Upload queued. Progress bars update as classification runs.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStatus(null);
    } finally {
      setBusy(false);
      setUploadPct(null);
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) void uploadFile(file);
  }

  return (
    <section className="mb-10 border border-[var(--gold)]/25 bg-[var(--surface)] p-6 md:p-8">
      {!isLoading && !isAuthenticated && (
        <p className="mb-4 text-sm text-amber-300">
          <Link href="/sign-in" className="underline">
            Sign in
          </Link>{" "}
          to upload tender packs to this project.
        </p>
      )}
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
        Upload tender pack
      </p>
      <h2 className="mt-2 font-serif text-lg uppercase tracking-widest">
        {mode === "full-suite" ? "Drop the full design-team ZIP" : "Drop a discipline ZIP"}
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {mode === "full-suite"
          ? "One ZIP with all consultants — routed to discipline gates by folder name (e.g. arch/, mech/, qs/) or filename codes (-AR-, -ME-, BoQ). Max 1 GB."
          : "One ZIP for a single discipline gate. PDF, DOCX, XLSX, DWG inside. Max 1 GB."}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setMode("full-suite")}
          disabled={busy}
          className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition ${
            mode === "full-suite"
              ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
              : "border-[var(--gold)]/20 text-[var(--muted)] hover:border-[var(--gold)]/40"
          }`}
        >
          Full suite · all disciplines
        </button>
        <button
          type="button"
          onClick={() => setMode("single")}
          disabled={busy}
          className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition ${
            mode === "single"
              ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
              : "border-[var(--gold)]/20 text-[var(--muted)] hover:border-[var(--gold)]/40"
          }`}
        >
          Single discipline
        </button>
      </div>

      {mode === "single" && (
        <div className="mt-6 flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              Discipline
            </span>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              disabled={busy}
              className="mt-1 block min-w-[220px] border border-[var(--gold)]/25 bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
            >
              {DISCIPLINES.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {mode === "full-suite" && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Gates opened: {DISCIPLINES.map((d) => d.label).join(" · ")}
        </p>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-6 cursor-pointer border-2 border-dashed p-10 text-center transition-colors ${
          dragOver
            ? "border-[var(--gold)] bg-[var(--gold)]/5"
            : "border-[var(--gold)]/30 hover:border-[var(--gold)]/50"
        } ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        <p className="font-serif text-sm uppercase tracking-widest text-[var(--gold)]">
          {busy ? "Working…" : "Select ZIP or drag here"}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
          {mode === "full-suite" ? "Multi-discipline · VERIFY path" : "Single gate upload"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {uploadPct !== null && (
        <div className="mt-4">
          <ProgressBar
            value={uploadPct}
            label="Uploading ZIP to storage"
            hint={uploadPct < 100 ? "Sending file…" : "Processing on server…"}
          />
        </div>
      )}

      {status && !uploadPct && <p className="mt-4 text-sm text-[var(--gold-light)]">{status}</p>}
      {status && uploadPct !== null && uploadPct >= 100 && (
        <p className="mt-2 text-sm text-[var(--gold-light)]">{status}</p>
      )}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </section>
  );
}

export function StartReviewButton({
  projectId,
  phase,
  phaseLabel,
  uploadCount,
  classifyProgress,
  reviewProgress,
  variant = "panel",
}: {
  projectId: Id<"projects">;
  phase: string;
  phaseLabel: string;
  uploadCount: number;
  classifyProgress: number;
  reviewProgress: number;
  variant?: "header" | "panel";
}) {
  const startScan = useMutation(api.projects.startScan);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canStart = phase === "confirm_classify";
  const isScanning = phase === "scanning";
  const waitingForUpload = uploadCount === 0 && phase === "pending";

  async function handleStart() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await startScan({ projectId });
      setMessage(
        result.queued === 1
          ? "Review started for 1 discipline."
          : `Review started for ${result.queued} disciplines.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start review");
    } finally {
      setBusy(false);
    }
  }

  const buttonLabel = busy ? "Starting…" : isScanning ? "Scanning…" : "Start review";

  const buttonClass = canStart
    ? "border-[var(--gold)] bg-[var(--gold)] text-black shadow-[0_0_24px_rgba(197,160,89,0.35)] hover:bg-[var(--gold-light)]"
    : "border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10";

  if (variant === "header") {
    return (
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
            Step 2 · Run review
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {waitingForUpload
              ? "Step 1: upload a ZIP below. Then this button activates."
              : canStart
                ? "Classification done — click to scan and generate findings."
                : isScanning
                  ? "Review is running. Findings appear below."
                  : `Waiting — phase: ${phaseLabel} (${classifyProgress}% classified)`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleStart()}
          disabled={busy || !canStart}
          className={`shrink-0 px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-35 ${buttonClass}`}
        >
          {buttonLabel}
        </button>
        {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
        {message && <p className="text-sm text-[var(--gold-light)] sm:col-span-2">{message}</p>}
      </div>
    );
  }

  return (
    <section className="mb-10 border border-[var(--gold)]/35 bg-[var(--gold)]/5 p-6 md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
        Review progress
      </p>
      {uploadCount > 0 && (phase === "uploading" || phase === "classifying") && (
        <div className="mt-4">
          <ProgressBar
            value={classifyProgress}
            label="Classification"
            hint="Tagging document types per discipline gate"
            indeterminate={classifyProgress === 0}
          />
        </div>
      )}
      {uploadCount > 0 && (
        <div className="mt-4">
          <ProgressBar
            value={reviewProgress}
            label="Review scan"
            hint={
              isScanning
                ? "Discipline scans running"
                : canStart
                  ? "Ready — use Start review in the header"
                  : "Starts after classification"
            }
          />
        </div>
      )}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {message && <p className="mt-4 text-sm text-[var(--gold-light)]">{message}</p>}
    </section>
  );
}
