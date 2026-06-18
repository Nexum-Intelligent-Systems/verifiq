"use client";

/**
 * VerifIQ — direct-upload route (docs/42 §5.2; web-upload UX pass, docs/44).
 *
 * The other end of the magic-code handoff: a customer lands here from the
 * emailed link (`/upload?code=…`), the code is verified into a project-scoped
 * upload session, and they drop their pack straight in. A dropped **.zip** is
 * unpacked in the browser into its individual documents (so the customer never
 * has to unzip first); each file is hashed, uploaded direct to R2 via a signed
 * URL, and registered server side. Sealing the pack starts the council read.
 *
 * The copy here is deliberately plain — short, friendly, jargon-free — with a
 * clear three-step flow, visible acknowledgements (✓), warnings (⚠) for files
 * we can't read, and a confirm step before the read begins. The session token
 * is held in sessionStorage so a refresh resumes without re-spending the code.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { unzip } from "fflate";
import { api } from "../../convex/_generated/api";
import {
  UPLOAD_DISCIPLINES,
  formatBytes,
  putToSignedUrl,
  sha256OfBlob,
  type UploadDiscipline,
} from "../../storage/upload-client";
import { fileTextKind } from "../../ingest/extract";
import { isZipName, isReviewableZipPath, zipEntryBasename } from "../../ingest/zip";

const SESSION_KEY = "verifiq_upload_session";

type Phase = "init" | "need-code" | "verifying" | "ready" | "sealed" | "error";

type FileStatus = "pending" | "hashing" | "uploading" | "done" | "error";

interface UploadItem {
  id: string;
  file: File;
  discipline: UploadDiscipline;
  status: FileStatus;
  progress: number;
  error?: string;
}

type Notice = { id: number; kind: "info" | "warn" | "error"; text: string };

/** Plain-language labels for the file tagger (no in-house jargon). */
const DISCIPLINE_LABEL: Record<UploadDiscipline, string> = {
  unclassified: "Let VerifIQ decide (recommended)",
  architectural: "Architecture / layouts",
  fire: "Fire safety",
  access: "Accessibility (DAC)",
  "mechanical-electrical": "Mechanical & electrical",
  structural: "Structural",
  civil: "Civil / site",
  qs: "Costs / quantities (QS)",
};

/** Friendly, do-this-next copy for each link/code failure. */
const ERROR_COPY: Record<string, string> = {
  invalid: "That link or code isn’t right. Please request a fresh one from the website.",
  used: "That link has already been used. Please request a fresh one from the website.",
  expired: "That link has expired. Please request a fresh one from the website.",
  revoked: "That link was turned off. Please request a fresh one from the website.",
  locked: "Too many tries. Please request a fresh link from the website.",
};

/** Plain-language per-file status text. */
function statusText(it: UploadItem): string {
  switch (it.status) {
    case "pending":
      return "Waiting…";
    case "hashing":
      return "Checking…";
    case "uploading":
      return `Uploading ${Math.round(it.progress * 100)}%`;
    case "done":
      return "✓ Ready";
    case "error":
      return `⚠ ${it.error ?? "Couldn’t upload"}`;
  }
}

/** Unpack a .zip in the browser into individual files we can read. */
async function expandZip(file: File): Promise<{ files: File[]; skipped: number }> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const entries = await new Promise<Record<string, Uint8Array>>((resolve, reject) =>
    unzip(buf, (err, data) => (err ? reject(err) : resolve(data))),
  );
  const files: File[] = [];
  let skipped = 0;
  for (const [path, bytes] of Object.entries(entries)) {
    if (isReviewableZipPath(path)) {
      files.push(new File([bytes], zipEntryBasename(path)));
    } else if (!path.endsWith("/")) {
      skipped++;
    }
  }
  return { files, skipped };
}

export default function UploadPage() {
  const [phase, setPhase] = useState<Phase>("init");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [discipline, setDiscipline] = useState<UploadDiscipline>("unclassified");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [sealing, setSealing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busyNote, setBusyNote] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const noticeSeq = useRef(0);

  const verify = useMutation(api.uploadTokens.verifyUploadCode);
  const getUploadUrl = useAction(api.uploadDirect.getUploadUrlForSession);
  const registerDoc = useMutation(api.uploadDocs.registerUploadedDocument);
  const seal = useMutation(api.uploadDocs.sealUploadSession);
  const manifest = useQuery(
    api.uploadDocs.listSessionDocuments,
    sessionToken ? { sessionToken } : "skip",
  );

  const pushNotice = useCallback((kind: Notice["kind"], text: string) => {
    setNotices((prev) => [...prev, { id: noticeSeq.current++, kind, text }]);
  }, []);
  const dismissNotice = useCallback((id: number) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const doVerify = useCallback(
    async (secret: string) => {
      setPhase("verifying");
      setError(null);
      try {
        const res = await verify({ secret });
        if (res.ok) {
          sessionStorage.setItem(SESSION_KEY, res.sessionToken);
          setSessionToken(res.sessionToken);
          setProjectId(res.projectId);
          setPhase("ready");
        } else {
          setError(ERROR_COPY[res.error] ?? "That link isn’t valid.");
          setPhase("error");
        }
      } catch {
        setError("Something went wrong opening your link. Please try again in a moment.");
        setPhase("error");
      }
    },
    [verify],
  );

  // On mount: resume a stored session, else verify a ?code, else ask for a code.
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      setSessionToken(stored);
      setPhase("ready");
      return;
    }
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) void doVerify(code);
    else setPhase("need-code");
  }, [doVerify]);

  const uploadOne = useCallback(
    async (item: UploadItem) => {
      const patch = (u: Partial<UploadItem>) =>
        setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, ...u } : it)));
      try {
        patch({ status: "hashing", progress: 0 });
        const sha256 = await sha256OfBlob(item.file);
        patch({ status: "uploading" });
        const signed = await getUploadUrl({
          sessionToken: sessionToken!,
          filename: item.file.name,
          sha256,
          size_bytes: item.file.size,
          discipline: item.discipline,
        });
        if (!signed.ok || !signed.uploadUrl || !signed.key) {
          patch({ status: "error", error: "Upload slot expired — refresh and try again" });
          return;
        }
        await putToSignedUrl(signed.uploadUrl, item.file, {
          method: signed.method,
          contentType: item.file.type || "application/octet-stream",
          onProgress: (f) => patch({ progress: f }),
        });
        const reg = await registerDoc({
          sessionToken: sessionToken!,
          filename: item.file.name,
          sha256,
          size_bytes: item.file.size,
          r2_key: signed.key,
          discipline: item.discipline,
        });
        if (!reg.ok) {
          patch({ status: "error", error: "Couldn’t be saved — please retry" });
          return;
        }
        patch({ status: "done", progress: 1 });
      } catch {
        patch({ status: "error", error: "Upload failed — you can retry this one" });
      }
    },
    [getUploadUrl, registerDoc, sessionToken],
  );

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || !sessionToken) return;
      setConfirming(false);

      // 1) Expand any dropped .zip into its individual documents.
      const expanded: File[] = [];
      for (const f of Array.from(fileList)) {
        if (isZipName(f.name)) {
          setBusyNote(`Unpacking ${f.name}…`);
          try {
            const { files, skipped } = await expandZip(f);
            expanded.push(...files);
            if (files.length > 0) {
              pushNotice(
                "info",
                `📦 Unpacked ${f.name} — found ${files.length} file${files.length === 1 ? "" : "s"}` +
                  (skipped ? `, set aside ${skipped} that aren’t documents.` : "."),
              );
            } else {
              pushNotice(
                "warn",
                `${f.name} didn’t have any readable documents inside (maybe just images or folders).`,
              );
            }
          } catch {
            pushNotice("error", `We couldn’t open ${f.name}. Is it a real .zip file? Try saving it again.`);
          } finally {
            setBusyNote(null);
          }
        } else {
          expanded.push(f);
        }
      }

      // 2) Keep only files we can read; warn (kindly) about the rest.
      const next: UploadItem[] = [];
      for (const file of expanded) {
        if (fileTextKind(file.name) === "unsupported") {
          pushNotice("warn", `Set aside ${file.name} — we can only read PDFs and text files.`);
          continue;
        }
        next.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          discipline,
          status: "pending",
          progress: 0,
        });
      }
      if (next.length === 0) return;

      setItems((prev) => [...prev, ...next]);
      // Upload sequentially to keep memory + connections sane on large packs.
      void next.reduce((chain, item) => chain.then(() => uploadOne(item)), Promise.resolve());
    },
    [discipline, pushNotice, sessionToken, uploadOne],
  );

  const fileInput = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const doSeal = useCallback(async () => {
    if (!sessionToken) return;
    setConfirming(false);
    setSealing(true);
    try {
      const res = await seal({ sessionToken });
      if (res.ok) {
        if (res.projectId) setProjectId(res.projectId);
        sessionStorage.removeItem(SESSION_KEY);
        setPhase("sealed");
      } else if (res.error === "no_documents") {
        pushNotice("warn", "Add at least one file before you start the read.");
      } else {
        setError("Your link has timed out. Please request a fresh one from the website.");
        setPhase("error");
      }
    } finally {
      setSealing(false);
    }
  }, [pushNotice, seal, sessionToken]);

  const doneCount = items.filter((it) => it.status === "done").length;
  const errorCount = items.filter((it) => it.status === "error").length;
  const busy = items.some((it) => it.status === "hashing" || it.status === "uploading");

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === "init" || phase === "verifying") {
    return (
      <div>
        <span className="eyebrow">— Secure upload</span>
        <h1 className="page-title">Opening your upload page…</h1>
        <p className="lede">One moment while we check your link.</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div>
        <span className="eyebrow">— Secure upload</span>
        <h1 className="page-title">We couldn’t open that link</h1>
        <p className="lede">{error}</p>
        <p>
          <a className="btn" href="/first-read.html">
            Get a fresh link →
          </a>
        </p>
      </div>
    );
  }

  if (phase === "sealed") {
    return (
      <div>
        <span className="eyebrow">— All done</span>
        <h1 className="page-title">Your files are in. The read has started. 🎉</h1>
        <p className="lede">
          We’re now reading your {doneCount} {doneCount === 1 ? "file" : "files"}. This usually takes
          a few minutes. You don’t need to keep this page open — we’ll email you when your report is
          ready.
        </p>
        {projectId ? (
          <p>
            <a className="btn" href={`/projects/${projectId}`}>
              Watch the read →
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  if (phase === "need-code") {
    return (
      <div>
        <span className="eyebrow">— Secure upload</span>
        <h1 className="page-title">Enter your 6-character code</h1>
        <p className="lede">
          Open the link in your email, or type the 6-character code we sent you (it looks like
          K7M2QP).
        </p>
        <form
          className="np-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (codeInput.trim()) void doVerify(codeInput.trim());
          }}
        >
          <div>
            <label htmlFor="code">Your code</label>
            <input
              id="code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="e.g. K7M2QP"
              autoComplete="one-time-code"
            />
          </div>
          <button className="btn" type="submit" disabled={!codeInput.trim()}>
            Continue →
          </button>
        </form>
      </div>
    );
  }

  // phase === "ready"
  const serverCount = Array.isArray(manifest) ? manifest.length : 0;
  return (
    <div>
      <span className="eyebrow">— Secure upload</span>
      <h1 className="page-title">Add your files</h1>
      <p className="lede">
        Three steps: <strong>1.</strong> drop your files (or a ZIP) below. <strong>2.</strong> we
        check each one. <strong>3.</strong> press the green button to start the read. That’s it.
      </p>

      <details style={{ margin: "8px 0 16px" }}>
        <summary style={{ cursor: "pointer" }}>What can I add? (tap for help)</summary>
        <ul style={{ marginTop: 8 }}>
          <li>Drawings, specs, schedules and reports as <strong>PDF</strong> or text files.</li>
          <li>
            Got a folder of files? Pop them in a <strong>.zip</strong> and drop that — we unzip it
            for you.
          </li>
          <li>We set aside anything we can’t read (like photos) and tell you which.</li>
          <li>Not sure what a file is? Leave the tag on “Let VerifIQ decide”.</li>
        </ul>
      </details>

      <div style={{ margin: "16px 0" }}>
        <label htmlFor="disc" style={{ marginRight: 8 }}>
          Tag new files as
        </label>
        <select
          id="disc"
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value as UploadDiscipline)}
        >
          {UPLOAD_DISCIPLINES.map((d) => (
            <option key={d} value={d}>
              {DISCIPLINE_LABEL[d]}
            </option>
          ))}
        </select>
      </div>

      <div
        className={dragOver ? "dropzone drag" : "dropzone"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void addFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInput.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Add files: drop them here or click to choose"
        style={{
          border: "1.5px dashed currentColor",
          padding: "32px",
          textAlign: "center",
          cursor: "pointer",
          opacity: dragOver ? 1 : 0.85,
        }}
      >
        <p style={{ fontSize: "1.1em", margin: 0 }}>
          {busyNote ?? "Drop your files or ZIP here"}
        </p>
        <p className="meta" style={{ marginTop: 4 }}>
          …or click to choose them from your computer
        </p>
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={(e) => void addFiles(e.target.files)}
        />
      </div>

      {notices.length > 0 ? (
        <ul className="proj-list" style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
          {notices.map((n) => (
            <li
              key={n.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "8px 12px",
                marginBottom: 6,
                borderLeft: `3px solid ${
                  n.kind === "error" ? "#c0392b" : n.kind === "warn" ? "#b7791f" : "#2d7d46"
                }`,
                background: "rgba(127,127,127,0.06)",
              }}
            >
              <span>{n.text}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismissNotice(n.id)}
                style={{ border: 0, background: "none", cursor: "pointer", opacity: 0.6 }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {items.length > 0 ? (
        <>
          <p className="meta" style={{ marginTop: 16 }}>
            {doneCount} of {items.length} ready
            {errorCount ? ` · ${errorCount} need a retry` : ""}
          </p>
          <ul className="proj-list">
            {items.map((it) => (
              <li key={it.id} className="proj-row">
                <span className="name">{it.file.name}</span>
                <span className="meta">
                  {DISCIPLINE_LABEL[it.discipline]} · {formatBytes(it.file.size)} · {statusText(it)}
                  {it.status === "error" ? (
                    <button
                      type="button"
                      onClick={() => void uploadOne(it)}
                      style={{ marginLeft: 8, cursor: "pointer" }}
                    >
                      Retry
                    </button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <div style={{ marginTop: 20 }}>
        {confirming ? (
          <div
            style={{
              padding: 16,
              border: "1px solid currentColor",
              borderRadius: 6,
            }}
          >
            <p style={{ marginTop: 0 }}>
              Start the read of your <strong>{doneCount}</strong>{" "}
              {doneCount === 1 ? "file" : "files"}? Once it starts you can’t add more to this batch.
            </p>
            <button className="btn" type="button" disabled={sealing} onClick={() => void doSeal()}>
              {sealing ? "Starting…" : "Yes, start the read →"}
            </button>{" "}
            <button type="button" onClick={() => setConfirming(false)} style={{ marginLeft: 8 }}>
              Wait, not yet
            </button>
          </div>
        ) : (
          <button
            className="btn"
            type="button"
            disabled={busy || sealing || doneCount === 0}
            onClick={() => setConfirming(true)}
          >
            {busy
              ? "Uploading your files…"
              : doneCount === 0
                ? "Add a file to begin"
                : `I’m done — start the read (${doneCount} ready)`}
          </button>
        )}
        {serverCount > 0 ? (
          <p className="meta" style={{ marginTop: 8 }}>
            {serverCount} {serverCount === 1 ? "file is" : "files are"} safely saved.
          </p>
        ) : null}
      </div>
    </div>
  );
}
