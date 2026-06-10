import Link from "next/link";

/** Single consistent footer for every public page. */
const FOOTER_LINKS = [
  { href: "/products", label: "Verify" },
  { href: "/hunt", label: "Hunt" },
  { href: "/studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/legal", label: "Legal" },
];

const monoMeta: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.6875rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

export function Footer() {
  return (
    <footer style={{ background: "var(--c-ink)", color: "var(--c-bone)", padding: "36px 0 40px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Link
            href="/"
            className="wordmark"
            style={{ color: "var(--c-brass)", borderBottom: 0 }}
          >
            VerifIQ
          </Link>
          <nav style={{ display: "flex", gap: 20, flexWrap: "wrap", ...monoMeta }}>
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={{ color: "var(--c-vellum)", borderBottom: "1px solid var(--c-graphite)" }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid var(--c-graphite)", margin: "20px 0" }} />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 16,
            color: "var(--c-vellum)",
            ...monoMeta,
          }}
        >
          <span>© MMXXVI · VerifIQ · GovIQ Ltd · Dublin</span>
          <a href="mailto:hello@verifiq.ie" style={{ color: "var(--c-vellum)", borderBottom: "1px solid var(--c-graphite)" }}>
            hello@verifiq.ie
          </a>
          <span>Quietly · before the brief</span>
        </div>
      </div>
    </footer>
  );
}
