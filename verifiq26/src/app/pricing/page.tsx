import Link from "next/link";
import { MarketingShell, Wrap, Section } from "@/components/marketing/MarketingShell";
import { SheetTagButton, LeaderButton } from "@/components/ui/Button";

export const metadata = {
  title: "VerifIQ — Pricing · Five tiers · Ireland",
  description:
    "VerifIQ pricing: five tiers from Small to Mega. Per-pack or annual seat. Free taster per quarter. Early-pilot 30% window for the first ten practices.",
};

type Tier = {
  roman: string;
  name: string;
  scope: string;
  price: string;
  priceSub: string;
  seat: string;
  features: string[];
  cta: { label: string; sheet?: boolean };
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    roman: "I",
    name: "Small",
    scope: "< 50 docs · 1 discipline",
    price: "€290",
    priceSub: "+ VAT · per pack",
    seat: "€2,800/yr",
    features: [
      "Full register · all findings",
      "Source quote on every finding",
      "RFI-ready language",
      "Reviewer-signed audit log",
      "Released · within 24 hours",
    ],
    cta: { label: "Begin Tier I" },
  },
  {
    roman: "II",
    name: "Mid",
    scope: "50–150 · 1–3 disc.",
    price: "€590",
    priceSub: "+ VAT · per pack",
    seat: "€5,800/yr",
    features: [
      "Everything in Tier I",
      "Up to 3 disciplines",
      "Coordination cross-pass",
      "XLSX export of register",
      "Released · within 36 hours",
    ],
    cta: { label: "Begin Tier II" },
  },
  {
    roman: "III",
    name: "Large",
    scope: "150–600 · full design team",
    price: "€890",
    priceSub: "+ VAT · per pack",
    seat: "€11,400/yr",
    features: [
      "Everything in Tier II",
      "All disciplines · multi-discipline read",
      "Full cross-pass coordination",
      "RFI register · CA-routed",
      "Released · within 48 hours",
    ],
    cta: { label: "Begin Tier III", sheet: true },
    featured: true,
  },
  {
    roman: "IV",
    name: "Programme",
    scope: "600–1,500 · multi-pack",
    price: "€1,950",
    priceSub: "+ VAT · per pack",
    seat: "€19,800/yr",
    features: [
      "Everything in Tier III",
      "Programme-wide coordination",
      "Custom corpus uplift",
      "Concierge priority queue",
      "Released · within 72 hours",
    ],
    cta: { label: "Begin Tier IV" },
  },
  {
    roman: "V",
    name: "Mega",
    scope: "> 1,500 · by arr.",
    price: "from €2,500",
    priceSub: "concierge · by arr.",
    seat: "from €36,000",
    features: [
      "Everything in Tier IV",
      "Dedicated reviewer panel",
      "Programme governance support",
      "Outcome-priced option available",
      "SLA · by arrangement",
    ],
    cta: { label: "Talk to concierge" },
  },
];

type Row = { label: string; cells: React.ReactNode[] };

const Check = () => (
  <span style={{ color: "var(--sev-low)", fontWeight: 700 }} aria-label="Included">
    ✓
  </span>
);
const Dash = () => (
  <span style={{ color: "var(--text-muted)" }} aria-label="Not included">
    —
  </span>
);

const COMPARISON_HEADERS = [
  "Feature",
  "Free",
  "I · Small",
  "II · Mid",
  "III · Large",
  "IV · Prog.",
  "V · Mega",
];

const COMPARISON_ROWS: Row[] = [
  { label: "Document cap", cells: ["20", "50", "150", "600", "1,500", "by arr."] },
  { label: "Disciplines", cells: ["1", "1", "1–3", "all 7", "multi-pack", "multi-pack"] },
  { label: "Findings shown", cells: ["counts + 1", "all", "all", "all", "all", "all"] },
  { label: "Source quote", cells: ["1 finding", <Check key="c" />, <Check key="c" />, <Check key="c" />, <Check key="c" />, <Check key="c" />] },
  { label: "Reviewer-signed audit log", cells: [<Dash key="d" />, <Check key="c" />, <Check key="c" />, <Check key="c" />, <Check key="c" />, <Check key="c" />] },
  { label: "XLSX export", cells: [<Dash key="d" />, <Check key="c" />, <Check key="c" />, <Check key="c" />, <Check key="c" />, <Check key="c" />] },
  { label: "Cross-discipline coordination", cells: [<Dash key="d" />, <Dash key="d" />, <Check key="c" />, <Check key="c" />, <Check key="c" />, <Check key="c" />] },
  { label: "RFI register", cells: [<Dash key="d" />, "RFI language", <Check key="c" />, "CA-routed", "CA-routed", "CA-routed"] },
  { label: "Document retention", cells: ["14 days", "14 days", "14 days", "14 days", "30 days", "by arr."] },
  { label: "Audit log retention", cells: ["—", "2 years", "2 years", "7 years", "7 years", "by arr."] },
  { label: "Release SLA", cells: ["22 min", "24 hr", "36 hr", "48 hr", "72 hr", "by arr."] },
  { label: "Concierge priority", cells: [<Dash key="d" />, <Dash key="d" />, <Dash key="d" />, <Check key="c" />, <Check key="c" />, "dedicated"] },
];

type Faq = { num: string; q: string; a: React.ReactNode; open?: boolean };

const FAQS: Faq[] = [
  {
    num: "I.",
    q: "Is VAT included?",
    open: true,
    a: "Prices shown are B2B and exclude VAT. Irish VAT at 23% applies to customers in Ireland. For EU customers, reverse-charge VAT rules apply where you provide a valid VAT number. Stripe Tax computes and shows the final amount at checkout.",
  },
  {
    num: "II.",
    q: "What is the early-pilot 30% window?",
    a: "The first ten Irish practices to sign get 30% off any tier, applied to first-year invoices. Once the ten seats are filled, the window closes and standard pricing resumes for all new customers. The discount is intended to acknowledge the pilot risk you take by being early, not as ongoing list pricing.",
  },
  {
    num: "III.",
    q: "What if my pack falls between tier boundaries?",
    a: "We size you to the tier whose document cap covers your pack. A pack of 145 documents fits in Tier II; a pack of 165 sits in Tier III. The corpora and review depth are identical; what changes is the document cap and the discipline count.",
  },
  {
    num: "IV.",
    q: "What is the refund or re-run policy?",
    a: "If you raise a material complaint about a finding within 14 days of release, we re-run the affected discipline at no charge. Refunds are issued only where the platform failed to complete the read — not as a finding-quality dispute mechanism. The principle: re-run beats refund.",
  },
  {
    num: "V.",
    q: "Can I cancel an annual seat?",
    a: "Annual seats are non-refundable mid-term, but transferable within your practice. You can also pause for up to 60 days per year with concierge approval. Renewal is annual and explicit — we do not auto-renew without confirmation.",
  },
  {
    num: "VI.",
    q: "How does Tier V outcome-pricing work?",
    a: 'For programme and mega tiers, we can structure pricing as "the read is included, you pay per accepted critical finding entered into your RFI register." This aligns price with value delivered. Outcome pricing requires a defined acceptance protocol — agreed with the concierge before engagement.',
  },
  {
    num: "VII.",
    q: "What about international pricing?",
    a: (
      <>
        Ireland is the launch market. UK pricing comes online in 2027. EU, Australia, Canada, and US
        pricing are sequenced behind that, each with its own reviewer panel and corpus. See{" "}
        <Link href="/legal">Legal · per jurisdiction</Link> for the regional posture.
      </>
    ),
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      {/* Early-pilot strip */}
      <div style={{ background: "var(--hairline-strong)", color: "var(--on-ink)", padding: "18px 0" }}>
        <Wrap
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          <span>Early-pilot — 30% off the first ten practices</span>
          <span style={{ color: "var(--gold)" }}>10 of 10 pilot seats remaining</span>
          <span>Closing when filled · MMXXVI</span>
        </Wrap>
      </div>

      {/* Hero */}
      <header style={{ padding: "80px 0 56px", borderBottom: "1px solid var(--hairline-strong)" }}>
        <Wrap>
          <span className="t-eyebrow">— Drawing 10 · Pricing</span>
          <h1 className="t-display" style={{ color: "var(--text)", margin: "16px 0 12px" }}>
            Five tiers. One read.
          </h1>
          <p className="t-lede" style={{ maxWidth: "60ch" }}>
            Predictable per pack, or an annual seat for the practice. Free taster — one discipline,
            one pack per quarter, no card needed.
          </p>
        </Wrap>
      </header>

      {/* Tiers */}
      <Section>
        <Wrap>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 1,
              background: "var(--hairline-strong)",
              border: "1px solid var(--hairline-strong)",
            }}
          >
            {TIERS.map((t) => (
              <div
                key={t.roman}
                style={{
                  background: t.featured ? "var(--surface)" : "var(--bg)",
                  padding: "32px 22px",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 540,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "2rem",
                    color: "var(--gold)",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {t.roman}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    color: "var(--text)",
                    marginBottom: 4,
                  }}
                >
                  {t.name}
                </div>
                <div
                  className="t-meta"
                  style={{ textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 22 }}
                >
                  {t.scope}
                </div>
                <div
                  className="t-data"
                  style={{ fontSize: "2.25rem", color: "var(--text)", lineHeight: 1 }}
                >
                  {t.price}
                </div>
                <div
                  className="t-meta"
                  style={{ textTransform: "uppercase", letterSpacing: "0.18em", marginTop: 4 }}
                >
                  {t.priceSub}
                </div>
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: "1px solid var(--hairline)",
                  }}
                >
                  <span
                    className="t-meta"
                    style={{ textTransform: "uppercase", letterSpacing: "0.18em" }}
                  >
                    Annual seat
                  </span>
                  <div
                    className="t-data"
                    style={{ fontSize: "1.25rem", color: "var(--text)", marginTop: 4 }}
                  >
                    {t.seat}
                  </div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", flex: 1 }}>
                  {t.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8125rem",
                        padding: "6px 0",
                        color: "var(--text-soft)",
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ color: "var(--gold)", fontWeight: 700 }} aria-hidden>
                        ·
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div
                  style={{
                    marginTop: 22,
                    paddingTop: 18,
                    borderTop: "1px solid var(--hairline)",
                  }}
                >
                  {t.cta.sheet ? (
                    <SheetTagButton code={t.roman} label={t.cta.label} href="/request" />
                  ) : (
                    <LeaderButton num={t.roman} label={t.cta.label} href="/request" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Free taster block */}
          <div
            style={{
              marginTop: 36,
              border: "1px solid var(--hairline-strong)",
              background: "var(--surface)",
              padding: "36px 32px",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
              gap: 22,
            }}
          >
            <div>
              <span className="t-eyebrow">— Free taster</span>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "1.75rem",
                  color: "var(--text)",
                  marginTop: 10,
                }}
              >
                No card. One per quarter.
              </div>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  color: "var(--text-soft)",
                  margin: "0 0 14px",
                }}
              >
                One discipline of your choosing, up to 20 documents per pack, counts and severities
                only, plus one fully-worked finding so you can see the method. Reviewer-gated like
                every other pack. The full register, source quotes, RFI register, and reviewer-signed
                audit log are held behind the paywall.
              </p>
              <div style={{ marginTop: 18 }}>
                <SheetTagButton code="FREE" label="Run a free taster" href="/request" />
              </div>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* Comparison */}
      <Section tint>
        <Wrap>
          <div style={{ display: "grid", gap: 16, marginBottom: 40 }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  fontSize: "3rem",
                  color: "var(--gold)",
                  lineHeight: 1,
                }}
              >
                II.
              </div>
              <span className="t-eyebrow" style={{ display: "block", marginTop: 8 }}>
                — What&apos;s in each tier
              </span>
            </div>
            <div>
              <h2 className="t-h2" style={{ color: "var(--text)", margin: "0 0 10px" }}>
                Side by side.
              </h2>
              <p className="t-lede" style={{ margin: 0, maxWidth: "60ch" }}>
                Every paid tier carries the same source-quote method and reviewer sign-off. What
                scales is the document cap, the discipline count, and the depth of coordination.
              </p>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "var(--bg)",
                marginTop: 32,
              }}
            >
              <thead>
                <tr>
                  {COMPARISON_HEADERS.map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 16px",
                        textAlign: "left",
                        border: "1px solid var(--hairline-strong)",
                        background: "var(--hairline-strong)",
                        color: "var(--on-ink)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        fontWeight: 600,
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
                      style={{
                        padding: "14px 16px",
                        border: "1px solid var(--hairline-strong)",
                        background: "var(--surface)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        verticalAlign: "top",
                      }}
                    >
                      {row.label}
                    </td>
                    {row.cells.map((cell, i) => (
                      <td
                        key={i}
                        style={{
                          padding: "14px 16px",
                          border: "1px solid var(--hairline-strong)",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.875rem",
                          verticalAlign: "top",
                          color: "var(--text-soft)",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Wrap>
      </Section>

      {/* Annual seat economics */}
      <Section>
        <Wrap>
          <div style={{ display: "grid", gap: 16, marginBottom: 40 }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  fontSize: "3rem",
                  color: "var(--gold)",
                  lineHeight: 1,
                }}
              >
                III.
              </div>
              <span className="t-eyebrow" style={{ display: "block", marginTop: 8 }}>
                — Annual seat economics
              </span>
            </div>
            <div>
              <h2 className="t-h2" style={{ color: "var(--text)", margin: "0 0 10px" }}>
                Per-pack, or annual seat.
              </h2>
              <p className="t-lede" style={{ margin: 0, maxWidth: "60ch" }}>
                An annual seat at Tier III pays for itself at 13 paid packs. Engaged practices
                typically run 6–12 packs of the relevant size per year, so the seat is the cheaper
                path once a practice is committed.
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 1,
              background: "var(--hairline-strong)",
              border: "1px solid var(--hairline-strong)",
              marginTop: 24,
            }}
          >
            {[
              {
                eyebrow: "— Per-pack",
                body: "Pay per read. No commitment. Right for the first 1–3 packs while you decide.",
              },
              {
                eyebrow: "— Annual seat",
                body: "Unlimited packs at chosen tier for one practice (up to 5 named users). Concierge included.",
              },
              {
                eyebrow: "— Multi-seat (Tier IV/V)",
                body: "For practices with multiple offices or large teams. Custom — by arrangement with the concierge.",
              },
            ].map((c) => (
              <div key={c.eyebrow} style={{ background: "var(--bg)", padding: 24 }}>
                <span className="t-eyebrow">{c.eyebrow}</span>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                    color: "var(--text-soft)",
                    margin: "12px 0 0",
                  }}
                >
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* FAQ */}
      <Section tint>
        <Wrap narrow>
          <div style={{ display: "grid", gap: 16, marginBottom: 40 }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  fontSize: "3rem",
                  color: "var(--gold)",
                  lineHeight: 1,
                }}
              >
                IV.
              </div>
              <span className="t-eyebrow" style={{ display: "block", marginTop: 8 }}>
                — Concierge · FAQ
              </span>
            </div>
            <div>
              <h2 className="t-h2" style={{ color: "var(--text)", margin: "0 0 10px" }}>
                Common questions.
              </h2>
              <p className="t-lede" style={{ margin: 0, maxWidth: "60ch" }}>
                Replied to in person within 48 hours if these don&apos;t cover it.
              </p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--hairline-strong)" }}>
            {FAQS.map((f) => (
              <details
                key={f.num}
                open={f.open}
                style={{ borderBottom: "1px solid var(--hairline-strong)", padding: "22px 0" }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    alignItems: "baseline",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "var(--gold)",
                      fontSize: "1.125rem",
                      minWidth: 32,
                    }}
                  >
                    {f.num}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      fontSize: "1rem",
                      color: "var(--text)",
                      flex: 1,
                      lineHeight: 1.4,
                    }}
                  >
                    {f.q}
                  </span>
                </summary>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.65,
                    color: "var(--text-soft)",
                    margin: "12px 0 0 48px",
                    maxWidth: "64ch",
                  }}
                >
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* Locked disclaimer */}
      <section
        style={{
          padding: "48px 0",
          borderTop: "1px solid var(--hairline-strong)",
          borderBottom: "1px solid var(--hairline-strong)",
          background: "var(--surface)",
          textAlign: "center",
        }}
      >
        <Wrap narrow>
          <span className="t-eyebrow">— Notice · Locked disclaimer</span>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "var(--text)",
              maxWidth: "58ch",
              margin: "14px auto 20px",
              padding: "0 20px",
            }}
          >
            VerifIQ is a software-based reading aid. It surfaces, in the documents&apos; own words,
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
