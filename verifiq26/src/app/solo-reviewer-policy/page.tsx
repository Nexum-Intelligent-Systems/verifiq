import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, Wrap, Section } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Solo reviewer phase policy — VerifIQ",
  description:
    "The honesty rules that govern how VerifIQ reviews packs during the pilot cohort, before discipline specialists are formally on the panel.",
};

const cellStyle: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  border: "1px solid var(--hairline-strong)",
  verticalAlign: "top",
};

const thStyle: React.CSSProperties = {
  ...cellStyle,
  background: "var(--elevated)",
  color: "var(--text)",
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.6875rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

const listStyle: React.CSSProperties = {
  lineHeight: 1.7,
  color: "var(--text-soft)",
  paddingLeft: 22,
};

const optionStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--hairline-strong)",
  padding: 24,
  margin: "24px 0",
};

export default function SoloReviewerPolicyPage() {
  return (
    <MarketingShell>
      <header style={{ padding: "64px 0 40px", borderBottom: "1px solid var(--hairline-strong)" }}>
        <Wrap narrow>
          <span className="t-eyebrow">— Drawing 13 · Reviewer scope</span>
          <h1 className="t-display" style={{ margin: "14px 0 8px" }}>
            Solo reviewer phase policy.
          </h1>
          <p className="t-lede" style={{ fontStyle: "italic" }}>
            The honesty rules that govern how VerifIQ reviews packs during the pilot cohort, before
            discipline specialists are formally on the panel.
          </p>
        </Wrap>
      </header>

      <Section>
        <Wrap narrow>
          <h2 className="t-h2" style={{ margin: "0 0 14px" }}>
            1 · The principle
          </h2>
          <p className="t-body" style={{ color: "var(--text-soft)" }}>
            During the pilot cohort, every paid VerifIQ pack is reviewed by Liam Doolan, founder of
            GovIQ Ltd, in his capacity as a specialist in Irish public-sector procurement, capital
            governance, and tender-pack coordination. Findings within that discipline scope are
            signed by the reviewer on the audit log; findings outside that scope are surfaced honestly
            and marked as pending chartered review by the relevant discipline specialist.
          </p>
          <p className="t-body" style={{ color: "var(--text-soft)" }}>
            <strong style={{ color: "var(--text)" }}>The honesty is the product.</strong> We will
            never silently stamp findings outside the reviewer&rsquo;s discipline as
            &ldquo;chartered-reviewed.&rdquo; If we cannot back a finding with a chartered
            specialist&rsquo;s eye, we tell you on the register.
          </p>

          <h2 className="t-h2" style={{ margin: "40px 0 14px" }}>
            2 · What the reviewer signs
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
            <thead>
              <tr>
                <th className="t-meta" style={thStyle}>
                  Category
                </th>
                <th className="t-meta" style={thStyle}>
                  Signed
                </th>
                <th className="t-meta" style={thStyle}>
                  Rationale
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Contract-form coherence (PW-CF variants, LD mechanics, Dates)", "Direct expertise"],
                ["CWMF / OGP procurement risk", "Direct expertise"],
                ["Tender-pack document hygiene", "Direct expertise"],
                ["BCAR doc-set completeness (NOT AC function)", "Direct expertise"],
                [
                  "Cross-discipline coordination (spec vs schedule vs drawing)",
                  "Direct expertise — the killer skill",
                ],
                ["Cost / QS coordination", "Direct expertise"],
                ["Address / title-block / metadata anomalies", "Direct expertise"],
                ["Standards prefix / typo flags", "Pattern recognition"],
              ].map(([cat, rationale]) => (
                <tr key={cat}>
                  <td className="t-body" style={cellStyle}>
                    {cat}
                  </td>
                  <td style={{ ...cellStyle, color: "var(--accent)", fontWeight: 700 }}>✓</td>
                  <td className="t-body" style={cellStyle}>
                    {rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="t-h2" style={{ margin: "40px 0 14px" }}>
            3 · What the reviewer does NOT sign
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
            <thead>
              <tr>
                <th className="t-meta" style={thStyle}>
                  Category
                </th>
                <th className="t-meta" style={thStyle}>
                  Signed
                </th>
                <th className="t-meta" style={thStyle}>
                  Required specialism
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Architectural design adequacy · TGD B", "RIAI-registered architect"],
                ["Structural design · Eurocode application", "CEng C&S (Engineers Ireland)"],
                ["M&E specification adequacy", "CEng MEP (Engineers Ireland)"],
                ["Fire engineering · cause-and-effect", "FSE / IFSE"],
                ["Detailed energy / Part L", "SEAI-registered EED consultant"],
                ["BCAR Assigned Certifier function itself", "Out of VerifIQ scope, permanently"],
              ].map(([cat, spec]) => (
                <tr key={cat}>
                  <td className="t-body" style={cellStyle}>
                    {cat}
                  </td>
                  <td style={{ ...cellStyle, color: "var(--accent)", fontWeight: 700 }}>✕</td>
                  <td className="t-body" style={cellStyle}>
                    {spec}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="t-h2" style={{ margin: "40px 0 14px" }}>
            4 · How findings outside discipline are handled
          </h2>
          <p className="t-body" style={{ color: "var(--text-soft)" }}>
            For each pack, we apply one of three options at intake, depending on the customer&rsquo;s
            preference and pack profile.
          </p>

          <div style={optionStyle}>
            <h3 className="t-h3" style={{ margin: "0 0 10px" }}>
              Option A — Defer until specialist on board
            </h3>
            <p className="t-body" style={{ margin: "8px 0 0", color: "var(--text-soft)" }}>
              We politely defer the pack until the relevant discipline specialist joins the cohort.
              Right for customers whose hot-button risk sits outside Liam&rsquo;s discipline.
            </p>
          </div>
          <div style={optionStyle}>
            <h3 className="t-h3" style={{ margin: "0 0 10px" }}>
              Option B — Ship findings marked &ldquo;AI-surfaced · pending chartered review&rdquo;
            </h3>
            <p className="t-body" style={{ margin: "8px 0 0", color: "var(--text-soft)" }}>
              The pack is processed. Findings appear on the register with two columns:
              chartered-reviewed (Liam-signed) and AI-surfaced-pending. The cover page is unambiguous
              about which is which.{" "}
              <strong style={{ color: "var(--text)" }}>
                This is the default option for the pilot cohort.
              </strong>
            </p>
          </div>
          <div style={optionStyle}>
            <h3 className="t-h3" style={{ margin: "0 0 10px" }}>
              Option C — Per-pack specialist (Tier III+ only)
            </h3>
            <p className="t-body" style={{ margin: "8px 0 0", color: "var(--text-soft)" }}>
              For high-stakes flagship packs, we retain a one-off specialist for that pack at
              concierge cost. The output reads as fully panel-reviewed. Subject to availability of the
              relevant chartered eye in our network.
            </p>
          </div>

          <h2 className="t-h2" style={{ margin: "40px 0 14px" }}>
            5 · Marketing honesty
          </h2>
          <p className="t-body" style={{ color: "var(--text-soft)" }}>
            VerifIQ&rsquo;s customer-facing surfaces will NEVER claim a chartered panel of multiple
            specialists during the solo phase. The phrase &ldquo;Reviewed by [discipline] chartered
            panel&rdquo; is reserved for when there actually IS a multi-member panel signed and
            operational. Until then:
          </p>
          <ul className="t-body" style={listStyle}>
            <li>
              Standards bodies appear under &ldquo;Standards we read against&rdquo; (corpora indexed),{" "}
              <strong style={{ color: "var(--text)" }}>not</strong> &ldquo;Reviewed by&rdquo;
              (chartered affiliation).
            </li>
            <li>
              The pilot reviewer is named transparently on the home page and the{" "}
              <Link href="/about" style={{ color: "var(--accent)" }}>
                about page
              </Link>
              .
            </li>
            <li>The discipline scope is published — this page, this section.</li>
            <li>
              &ldquo;Discipline specialists joining the cohort sequentially&rdquo; is the wording used
              when describing the panel&rsquo;s future state.
            </li>
          </ul>

          <h2 className="t-h2" style={{ margin: "40px 0 14px" }}>
            6 · Triggers that end the solo phase
          </h2>
          <p className="t-body" style={{ color: "var(--text-soft)" }}>
            The solo-reviewer phase ends when any of the following fires:
          </p>
          <ul className="t-body" style={listStyle}>
            <li>4 paid packs/week sustained for 4 weeks → reviewer-chair recruitment begins.</li>
            <li>
              Customer dispute or escalation on a finding → solo phase ends immediately; full panel
              formalised before the next pack.
            </li>
            <li>
              Pre-seed pitch deck assembled → panel chair + 2 named specialists required for
              credibility.
            </li>
            <li>
              €25k cumulative VerifIQ revenue → formalise per-pack specialist relationships as
              standing arrangements.
            </li>
            <li>
              Customer explicitly requires chartered specialty in a discipline Liam does not hold →
              Option A or Option C invoked, then formalisation triggered.
            </li>
          </ul>

          <h2 className="t-h2" style={{ margin: "40px 0 14px" }}>
            7 · Audit log signature format
          </h2>
          <p className="t-body" style={{ color: "var(--text-soft)" }}>
            The reviewer signature on every audit log entry uses this exact form:
          </p>
          <p
            className="t-data"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.875rem",
              background: "var(--elevated)",
              border: "1px solid var(--hairline-strong)",
              padding: "16px 18px",
              color: "var(--text)",
            }}
          >
            Reviewed by L. Doolan, Director, VerifIQ (a GovIQ Ltd product) — capital governance
            specialism. Findings outside this discipline carry &ldquo;AI-surfaced · pending chartered
            review · [discipline]&rdquo; markings, separately audited.
          </p>
          <p className="t-body" style={{ color: "var(--text-soft)" }}>
            The reviewer&rsquo;s personal chartered status (if any) is never invoked as the basis of
            the finding signature. The reviewer signs in their VerifIQ-founder capacity. This is
            critical for keeping the locked legal posture intact across all jurisdictions.
          </p>

          <h2 className="t-h2" style={{ margin: "40px 0 14px" }}>
            8 · Customer rights under this policy
          </h2>
          <p className="t-body" style={{ color: "var(--text-soft)" }}>
            If you are uncomfortable with the solo-reviewer phase at any time, you may:
          </p>
          <ul className="t-body" style={listStyle}>
            <li>
              Choose Option A and wait for the relevant specialist (we will notify you when joined).
            </li>
            <li>Choose Option C and pay concierge rates for per-pack specialist cover.</li>
            <li>Decline engagement entirely and receive your free taster output uncharged.</li>
          </ul>
          <p className="t-body" style={{ color: "var(--text-soft)" }}>
            We will not push paid customers through Option B against their preference. The brief
            request includes an explicit acknowledgement of this policy before any paid scan is run.
          </p>
        </Wrap>
      </Section>

      <Section tint>
        <Wrap narrow style={{ textAlign: "center" }}>
          <span className="t-eyebrow">— Notice · Locked disclaimer</span>
          <p
            className="t-lede"
            style={{
              fontStyle: "italic",
              lineHeight: 1.7,
              color: "var(--text)",
              maxWidth: "58ch",
              margin: "14px auto",
            }}
          >
            VerifIQ is a software-based reading aid. It surfaces, in the documents&rsquo; own words,
            what a registered professional may wish to read closely. It does not certify, sign,
            opine, or substitute for professional judgement. The registered designer reads our
            output, exercises their own judgement, verifies locally, and signs. The professional
            indemnity remains theirs. We carry product-quality risk only.
          </p>
        </Wrap>
      </Section>
    </MarketingShell>
  );
}
