import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, Wrap, Section } from "@/components/marketing/MarketingShell";
import { SheetTagButton, LeaderButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Three products — VerifIQ · Verify · Hunt · Studio",
  description:
    "VerifIQ's three products side by side. Verify for design teams, Hunt for contractors, Studio for sole practitioners. One source-quoted method behind each.",
};

const ACCENT = {
  verify: "var(--gold)",
  hunt: "var(--sev-high)",
  studio: "var(--sev-low)",
} as const;

type Accent = keyof typeof ACCENT;

function Pip({ accent, children }: { accent: Accent; children: React.ReactNode }) {
  return (
    <span
      className="t-eyebrow"
      style={{
        color: ACCENT[accent],
        border: `1px solid ${ACCENT[accent]}`,
        padding: "3px 8px",
        display: "inline-block",
        alignSelf: "flex-start",
      }}
    >
      {children}
    </span>
  );
}

type ProductCard = {
  id?: string;
  accent: Accent;
  pip: string;
  name: string;
  who: string;
  what: string;
  pull: string;
  price: string;
  cta: { num: string; label: string; href: string };
};

const PRODUCTS: ProductCard[] = [
  {
    id: "verify",
    accent: "verify",
    pip: "I · Verify",
    name: "Verify.",
    who: "For the design team",
    what:
      "A full pre-tender read across all the disciplines on your project. The atelier's flagship. Multi-discipline coordination cross-pass. Reviewer-signed audit log. Reads up to 600 documents per pack at Tier III.",
    pull: "The drawing is the contract. The contract is read closely.",
    price: "From €290 per pack · annual seat from €11,400",
    cta: { num: "→", label: "Go to Verify", href: "/" },
  },
  {
    accent: "hunt",
    pip: "II · Hunt",
    name: "Hunt.",
    who: "For contractors",
    what:
      "Pre-pricing read of a tender pack. Surface variation exposure, draft tactical RFIs, calculate the exposure band — before the bid team prices it. The discrepancy you'd have found on Friday at six, surfaced Tuesday at ten.",
    pull: "Price programme risk from a position of knowledge, not dispute.",
    price: "From €290 per pack · annual seat from €11,400",
    cta: { num: "→", label: "Go to Hunt", href: "/hunt" },
  },
  {
    accent: "studio",
    pip: "III · Studio",
    name: "Studio.",
    who: "For the sole practitioner",
    what:
      "Single discipline, one pack, a lighter touch. For the architect, engineer or surveyor working alone — or as the named lead on one discipline within a wider team. Up to 50 documents. Released within 24 hours.",
    pull: "One discipline. One pack. The deliberate quiet.",
    price: "€290 per pack · annual seat €2,800",
    cta: { num: "→", label: "Go to Studio", href: "/studio" },
  },
];

type Cell = string | { mark: Accent; label?: string } | { dash: true };

const COMPARISON_HEAD = [
  "Feature",
  "Verify · design team",
  "Hunt · contractor",
  "Studio · sole pract.",
];

const COMPARISON_ROWS: { label: string; cells: Cell[] }[] = [
  { label: "Disciplines per pack", cells: ["All 7", "All 7", "1 (you nominate)"] },
  { label: "Document cap (Tier III)", cells: ["600", "600", "50"] },
  {
    label: "Multi-discipline coordination pass",
    cells: [{ mark: "verify" }, { mark: "hunt" }, { dash: true }],
  },
  {
    label: "Source-quoted findings",
    cells: [{ mark: "verify" }, { mark: "hunt" }, { mark: "studio" }],
  },
  {
    label: "Reviewer-signed audit log",
    cells: [{ mark: "verify" }, { mark: "hunt" }, { mark: "studio" }],
  },
  {
    label: "RFI register (CA-routed)",
    cells: [{ mark: "verify" }, { mark: "hunt", label: "tactical" }, "RFI language only"],
  },
  {
    label: "Variation exposure band",
    cells: [{ dash: true }, { mark: "hunt" }, { dash: true }],
  },
  {
    label: "XLSX export",
    cells: [{ mark: "verify" }, { mark: "hunt" }, { mark: "studio" }],
  },
  { label: "Tier I pricing", cells: ["€290", "€290", "€290"] },
  { label: "Tier II pricing", cells: ["€590", "€590", "— (one tier only)"] },
  { label: "Tier III pricing", cells: ["€890", "€890", "—"] },
  { label: "Annual seat (Tier III)", cells: ["€11,400", "€11,400", "—"] },
  { label: "Annual seat (single user)", cells: ["—", "—", "€2,800"] },
  { label: "Named users on annual", cells: ["5", "5 (bid team)", "1"] },
  { label: "Release SLA (Tier I)", cells: ["24 hr", "24 hr", "24 hr"] },
  { label: "Release SLA (Tier III)", cells: ["48 hr", "48 hr", "n/a"] },
  { label: "Concierge priority", cells: ["Tier III+", "Tier III+", "Annual seat only"] },
  {
    label: "Free taster eligibility",
    cells: [{ mark: "verify" }, { mark: "hunt" }, { mark: "studio" }],
  },
];

function Mark({ accent, label }: { accent: Accent; label?: string }) {
  return (
    <span style={{ color: ACCENT[accent], fontWeight: 700 }}>
      ✓{label ? ` ${label}` : ""}
    </span>
  );
}

function renderCell(cell: Cell) {
  if (typeof cell === "string") return cell;
  if ("dash" in cell) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  return <Mark accent={cell.mark} label={cell.label} />;
}

function Pill({ accent, children }: { accent: Accent; children: React.ReactNode }) {
  return (
    <span
      className="t-label"
      style={{
        background: ACCENT[accent],
        color: accent === "studio" ? "var(--bg)" : "var(--c-ink)",
        padding: "2px 8px",
      }}
    >
      {children}
    </span>
  );
}

const DECISION_ROWS: { q: string; a: React.ReactNode }[] = [
  {
    q: "I'm on the design team — multi-discipline, pre-tender.",
    a: (
      <>
        Use <Pill accent="verify">VERIFY</Pill> — the multi-discipline cross-pass is the point.
      </>
    ),
  },
  {
    q: "I'm a contractor pricing a tender.",
    a: (
      <>
        Use <Pill accent="hunt">HUNT</Pill> — exposure band and tactical RFI list, not a
        coordination tool.
      </>
    ),
  },
  {
    q: "I'm a sole practitioner signing one discipline.",
    a: (
      <>
        Use <Pill accent="studio">STUDIO</Pill> — lighter touch, one discipline, right-sized.
      </>
    ),
  },
  {
    q: "I'm reviewing one discipline of a big team's pack.",
    a: (
      <>
        Use <Pill accent="studio">STUDIO</Pill> — nominate your discipline; we only read that.
      </>
    ),
  },
  {
    q: "I'm a QS doing pre-issue BoQ coordination on a multi-discipline pack.",
    a: (
      <>
        Use <Pill accent="verify">VERIFY</Pill> — the multi-discipline cross-pass surfaces BoQ vs
        spec mismatches.
      </>
    ),
  },
  {
    q: "I'm an Assigned Certifier checking doc-set hygiene.",
    a: (
      <>
        Use <Pill accent="verify">VERIFY</Pill> for multi-discipline AC prep; use{" "}
        <Pill accent="studio">STUDIO</Pill> for single-discipline.{" "}
        <strong style={{ color: "var(--text)" }}>Note:</strong> VerifIQ does not replace AC
        function.
      </>
    ),
  },
  {
    q: "Tender programme is huge — over 600 docs.",
    a: (
      <>
        Use <Pill accent="verify">VERIFY</Pill> Tier IV (Programme) or Tier V (Mega). Concierge
        route.
      </>
    ),
  },
  {
    q: "I just want to see what one of these looks like.",
    a: <>Free taster on any product — one discipline, 20 docs, counts plus one worked finding.</>,
  },
];

export default function ProductsPage() {
  return (
    <MarketingShell>
      <header style={{ padding: "64px 0 56px", borderBottom: "1px solid var(--hairline-strong)" }}>
        <Wrap>
          <span className="t-eyebrow">— Drawing 40 · Portfolio</span>
          <h1 className="t-display" style={{ margin: "16px 0 12px" }}>
            Three products. One method.
          </h1>
          <p className="t-lede" style={{ maxWidth: "60ch" }}>
            VerifIQ ships in three forms — one for the design team, one for contractors, one for the
            sole practitioner. Same source-quoted method behind each. The point of entry is what
            changes.
          </p>
        </Wrap>
      </header>

      <Section>
        <Wrap>
          <div style={{ marginBottom: 40 }}>
            <h2 className="t-h2" style={{ marginBottom: 12 }}>
              The three products.
            </h2>
            <p className="t-lede" style={{ maxWidth: "60ch" }}>
              Pick the one that matches the role you&rsquo;re playing on this pack. You can move
              between them — a practice principal might use Verify on team packs and Studio on
              personal commissions.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 1,
              background: "var(--hairline-strong)",
              border: "1px solid var(--hairline-strong)",
              marginTop: 32,
            }}
          >
            {PRODUCTS.map((p) => (
              <div
                key={p.name}
                id={p.id}
                style={{
                  background: "var(--surface)",
                  padding: "36px 28px",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 520,
                  scrollMarginTop: 96,
                }}
              >
                <Pip accent={p.accent}>{p.pip}</Pip>
                <h3 className="t-h2" style={{ margin: "18px 0 6px" }}>
                  {p.name}
                </h3>
                <div className="t-label" style={{ color: "var(--text-muted)", marginBottom: 18 }}>
                  {p.who}
                </div>
                <p className="t-body" style={{ color: "var(--text-soft)", margin: "0 0 22px" }}>
                  {p.what}
                </p>
                <p
                  className="t-lede"
                  style={{
                    color: ACCENT[p.accent],
                    borderLeft: `2px solid ${ACCENT[p.accent]}`,
                    paddingLeft: 14,
                    margin: "0 0 22px",
                  }}
                >
                  <span style={{ color: "var(--text)", fontStyle: "italic" }}>
                    &ldquo;{p.pull}&rdquo;
                  </span>
                </p>
                <p
                  className="t-meta"
                  style={{
                    color: "var(--text-muted)",
                    margin: "auto 0 18px",
                    paddingTop: 18,
                    borderTop: "1px solid var(--hairline)",
                  }}
                >
                  {p.price}
                </p>
                <LeaderButton num={p.cta.num} label={p.cta.label} href={p.cta.href} />
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      <Section tint>
        <Wrap>
          <div style={{ marginBottom: 40 }}>
            <h2 className="t-h2" style={{ marginBottom: 12 }}>
              Feature comparison.
            </h2>
            <p className="t-lede" style={{ maxWidth: "60ch" }}>
              What&rsquo;s in each product. Same review discipline; different scope and depth.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "var(--surface)",
                marginTop: 32,
              }}
            >
              <thead>
                <tr>
                  {COMPARISON_HEAD.map((h) => (
                    <th
                      key={h}
                      className="t-label"
                      style={{
                        padding: "14px 16px",
                        textAlign: "left",
                        border: "1px solid var(--hairline-strong)",
                        background: "var(--c-ink)",
                        color: "var(--c-bone)",
                        verticalAlign: "top",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td
                      className="t-label"
                      style={{
                        padding: "14px 16px",
                        border: "1px solid var(--hairline-strong)",
                        background: "var(--elevated)",
                        color: "var(--text-muted)",
                        verticalAlign: "top",
                      }}
                    >
                      {row.label}
                    </td>
                    {row.cells.map((cell, i) => (
                      <td
                        key={i}
                        className="t-body"
                        style={{
                          padding: "14px 16px",
                          border: "1px solid var(--hairline-strong)",
                          verticalAlign: "top",
                        }}
                      >
                        {renderCell(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Wrap>
      </Section>

      <Section>
        <Wrap>
          <div style={{ marginBottom: 40 }}>
            <h2 className="t-h2" style={{ marginBottom: 12 }}>
              If you&rsquo;re not sure which.
            </h2>
            <p className="t-lede" style={{ maxWidth: "60ch" }}>
              A short decision tree. The wizard works the rest out from your replies — see{" "}
              <Link href="/request" style={{ color: "var(--accent)" }}>
                Request the brief
              </Link>
              .
            </p>
          </div>

          <div style={{ display: "grid", gap: 16, marginTop: 32 }}>
            {DECISION_ROWS.map((row) => (
              <div
                key={row.q}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline-strong)",
                  padding: "20px 24px",
                  display: "grid",
                  gridTemplateColumns: "minmax(220px, 1fr) 2fr",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <div className="t-lede" style={{ color: "var(--text)" }}>
                  &ldquo;{row.q}&rdquo;
                </div>
                <div className="t-body" style={{ color: "var(--text-soft)" }}>
                  {row.a}
                </div>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      <Section tint>
        <Wrap narrow style={{ textAlign: "center" }}>
          <span className="t-eyebrow">— Common to all three</span>
          <h2 className="t-h2" style={{ margin: "14px 0 24px" }}>
            One method, three points of entry.
          </h2>
          <p
            className="t-body"
            style={{ color: "var(--text-soft)", maxWidth: "64ch", margin: "0 auto" }}
          >
            Every VerifIQ product reads against the same Irish corpus (I.S. · TGD · BCAR · CWMF ·
            PW-CF · sector-specific). Every product source-quotes every finding. Every product is
            reviewer-gated by a chartered Irish reviewer before release. Every product carries the
            same locked legal posture. Every product is in EU data residency. The product name
            changes; the method does not.
          </p>
          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 20,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <SheetTagButton code="A-001" label="Request the brief" href="/request" />
            <LeaderButton num="$" label="Full pricing" href="/pricing" />
          </div>
        </Wrap>
      </Section>

      <section
        style={{
          padding: "48px 0",
          borderTop: "1px solid var(--hairline-strong)",
          borderBottom: "1px solid var(--hairline-strong)",
          background: "var(--elevated)",
          textAlign: "center",
        }}
      >
        <Wrap narrow>
          <span className="t-eyebrow">— Notice · Locked Disclaimer</span>
          <p
            className="t-lede"
            style={{ color: "var(--text)", maxWidth: "58ch", margin: "14px auto", padding: "0 20px" }}
          >
            VerifIQ is a software-based reading aid. It surfaces, in the documents&rsquo; own words,
            what a registered professional may wish to read closely. It does not certify, sign,
            opine, or substitute for professional judgement. The registered designer reads our
            output, exercises their own judgement, verifies locally, and signs. The professional
            indemnity remains theirs. We carry product-quality risk only.
          </p>
        </Wrap>
      </section>
    </MarketingShell>
  );
}
