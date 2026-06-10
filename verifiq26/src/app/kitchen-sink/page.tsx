import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SheetTagButton, LeaderButton } from "@/components/ui/Button";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { SourceQuote } from "@/components/ui/SourceQuote";

/**
 * Phase 1 foundation / kitchen-sink.
 * Renders the VerifIQ design system on the dual-theme token layer.
 * Toggle bone-paper light <-> dark in the top bar — every element below
 * follows the active theme through semantic CSS variables only.
 */
export default function Page() {
  return (
    <main>
      {/* top bar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 32px",
          background: "var(--bg)",
          borderBottom: "1px solid var(--hairline-strong)",
        }}
      >
        <span className="wordmark">VerifIQ</span>
        <span className="t-meta">Design system · dual theme</span>
        <ThemeToggle />
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px 96px" }}>
        <header style={{ marginBottom: 56 }}>
          <span className="t-eyebrow">— Drawing 00 · Foundation</span>
          <h1 className="t-display" style={{ margin: "16px 0 12px" }}>
            Know before you build.
          </h1>
          <p className="t-lede" style={{ maxWidth: "60ch" }}>
            One design system, two surfaces. Bone-paper light and dark, switched at the top.
            Nothing on this page hardcodes a colour — every token resolves through the active theme.
          </p>
        </header>

        <Section title="Typography">
          <p className="t-h1">Heading one — IBM Plex Serif</p>
          <p className="t-h2">Heading two — Serif 500</p>
          <p className="t-h3">Heading three — Sans 600</p>
          <p className="t-body" style={{ maxWidth: "64ch" }}>
            Body copy in IBM Plex Sans. The drawing is the contract, and the contract is read closely.
            Body text uses the soft text token so it stays AA-legible in both themes.
          </p>
          <p className="t-meta">META · MONO · 0001 · TABULAR FIGURES 1234567890</p>
        </Section>

        <Section title="Actions">
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
            <SheetTagButton code="A-001" label="Request the brief" href="#" />
            <LeaderButton num="$" label="Full pricing" href="#" />
            <LeaderButton num="→" label="Go to Verify" href="#" />
          </div>
        </Section>

        <Section title="Severity (categorical — never a score)">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <SeverityPill severity="critical" />
            <SeverityPill severity="high" />
            <SeverityPill severity="medium" />
            <SeverityPill severity="low" />
          </div>
        </Section>

        <Section title="Source-quoted finding">
          <SourceQuote
            quote="Hoist supplier: CARBITAN model 510, ceiling-mounted, 200 kg SWL, with sling integration as per Room Data Sheet 12."
            reference="ITT Volume 2 · §4.3 · Room Data Sheet 12"
          />
        </Section>

        <Section title="Surfaces">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {(["bg", "surface", "elevated"] as const).map((s) => (
              <div
                key={s}
                style={{
                  background: `var(--${s})`,
                  border: "1px solid var(--hairline)",
                  padding: "28px 20px",
                  color: "var(--text)",
                }}
              >
                <span className="t-meta">--{s}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ paddingTop: 40, marginTop: 40, borderTop: "1px solid var(--hairline)" }}>
      <h2 className="t-label" style={{ marginBottom: 24 }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </section>
  );
}
