"use client";

import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { DragEvent, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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

export function TenderUploadPanel({ projectId }: { projectId: Id<"projects"> }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const submitDisciplineZip = useMutation(api.staffUploads.submitDisciplineZip);
  const submitFullSuiteZip = useMutation(api.staffUploads.submitFullSuiteZip);

  const [mode, setMode] = useState<UploadMode>("full-suite");
  const [discipline, setDiscipline] = useState<string>("arch");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
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
    setStatus(`Uploading ${file.name} (${formatBytes(file.size)})…`);

    try {
      const uploadUrl = await generateUploadUrl({});
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/zip" },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Storage upload failed");
      }

      const { storageId } = (await uploadResponse.json()) as { storageId: Id<"_storage"> };

      if (mode === "full-suite") {
        setStatus("Splitting pack into discipline gates — watch the dashboard update…");
        await submitFullSuiteZip({ projectId, zipStorageId: storageId });
        setStatus(
          "Full suite queued. Discipline gates will appear below as files are extracted and classified. Click Start review when the phase shows Confirm classification.",
        );
      } else {
        setStatus("Extracting files and classifying — watch the dashboard update…");
        await submitDisciplineZip({
          projectId,
          discipline,
          zipStorageId: storageId,
        });
        setStatus(
          "Upload queued. Discipline card will appear below as classification runs. Click Start review when ready.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStatus(null);
    } finally {
      setBusy(false);
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

      {status && <p className="mt-4 text-sm text-[var(--gold-light)]">{status}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </section>
  );
}

export function StartReviewButton({
  projectId,
  phase,
}: {
  projectId: Id<"projects">;
  phase: string;
}) {
  const startScan = useMutation(api.projects.startScan);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canStart = phase === "confirm_classify";

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

  if (!canStart && !message) {
    return null;
  }

  return (
    <section className="mb-10 border border-[var(--gold)]/35 bg-[var(--gold)]/5 p-6 md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
        Ready to review
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Classification is complete. Start the discipline scan to populate findings on this
        dashboard. With 3+ disciplines, a cross-discipline pass runs after scans complete.
        Without <code className="font-mono text-[10px]">ANTHROPIC_API_KEY</code> on Convex, demo
        findings are generated locally.
      </p>
      {canStart && (
        <button
          type="button"
          onClick={() => void handleStart()}
          disabled={busy}
          className="mt-4 border border-[var(--gold)] px-6 py-2 font-mono text-xs uppercase tracking-widest text-[var(--gold)] transition hover:bg-[var(--gold)]/10 disabled:opacity-50"
        >
          {busy ? "Starting…" : "Start review"}
        </button>
      )}
      {message && <p className="mt-4 text-sm text-[var(--gold-light)]">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </section>
  );
}
