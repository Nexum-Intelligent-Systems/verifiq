"use client";

import { useState } from "react";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: "0.625rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontSize: "1rem",
  color: "var(--text)",
  background: "var(--surface)",
  border: "1px solid var(--hairline-strong)",
  padding: "12px 14px",
};

/**
 * Honest interim brief-request form. Builds a prefilled mailto to
 * hello@verifiq.ie — a real, working channel today. To be replaced by a
 * Resend/Convex submission in Phase 3 (see WEBSITE_REVIEW_ROADMAP.md §2.4).
 */
export function RequestForm() {
  const [practice, setPractice] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent("Brief request — VerifIQ");
    const body = encodeURIComponent(
      `Practice: ${practice}\nEmail: ${email}\n\n${note}`,
    );
    window.location.href = `mailto:hello@verifiq.ie?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <label htmlFor="practice" style={labelStyle}>Practice / company</label>
        <input
          id="practice"
          name="practice"
          type="text"
          required
          value={practice}
          onChange={(e) => setPractice(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div>
        <label htmlFor="email" style={labelStyle}>Work email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div>
        <label htmlFor="note" style={labelStyle}>What are you reading? (optional)</label>
        <textarea
          id="note"
          name="note"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>
      <button type="submit" className="btn-sheet-tag" style={{ alignSelf: "flex-start", border: "none", padding: 0 }}>
        <span className="sheet-code">A-001</span>
        <span className="sheet-label">
          Request the brief
          <span className="sheet-arrow" aria-hidden />
        </span>
      </button>
      <p className="t-meta">
        Opens your mail client to hello@verifiq.ie. A concierge replies within 48 hours.
      </p>
    </form>
  );
}
