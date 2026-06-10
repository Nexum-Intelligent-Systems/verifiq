import type { Metadata } from "next";
import { MarketingShell, Wrap, Section } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Legal notice — VerifIQ",
  description:
    "VerifIQ's legal posture by jurisdiction: a software-based reading aid for registered design professionals, with the statutory carve-outs each market requires.",
};

const noticePaneStyle: React.CSSProperties = {
  marginTop: 32,
  padding: "40px 36px",
  border: "1px solid var(--hairline-strong)",
  background: "var(--surface)",
};

const lockedClauseStyle: React.CSSProperties = {
  fontStyle: "italic",
  lineHeight: 1.7,
  color: "var(--text)",
  margin: 0,
  paddingLeft: 18,
  borderLeft: "2px solid var(--gold)",
};

const obligationStyle: React.CSSProperties = {
  marginTop: 32,
  padding: "20px 22px",
  border: "1px solid var(--hairline-strong)",
  background: "var(--elevated)",
};

const obLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 10,
};

function LockedClause({ children }: { children: React.ReactNode }) {
  return (
    <p className="t-lede" style={lockedClauseStyle}>
      {children}
    </p>
  );
}

function Obligation({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ ...obligationStyle, ...style }}>
      <span className="t-eyebrow" style={obLabelStyle}>
        {label}
      </span>
      <p className="t-body" style={{ margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

export default function LegalPage() {
  return (
    <MarketingShell>
      <header style={{ padding: "64px 0 40px", borderBottom: "1px solid var(--hairline-strong)" }}>
        <Wrap>
          <span className="t-eyebrow">— Drawing 02 · Legal reference</span>
          <h1 className="t-display" style={{ margin: "12px 0 8px" }}>
            Legal notices.
          </h1>
          <p className="t-lede" style={{ maxWidth: "64ch" }}>
            VerifIQ&rsquo;s role is locked at the same shape in every market &mdash; a software-based
            reading aid for registered design professionals. The exact statutory framing differs
            jurisdiction by jurisdiction. The applicable notice for each jurisdiction is set out
            below.
          </p>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 20 }}>
            <span className="t-meta">Rev · A · 2026-06</span>
            <span className="t-meta">Coordinating · Irish solicitor</span>
            <span className="t-meta">Six jurisdictions · locked</span>
          </div>
        </Wrap>
      </header>

      {/* INTRO */}
      <Section>
        <Wrap narrow>
          <span className="t-eyebrow">— I. Position</span>
          <h2 className="t-h2" style={{ marginTop: 12 }}>
            The single principle that holds it together.
          </h2>
          <p className="t-body" style={{ marginTop: 16 }}>
            VerifIQ is a software-based reading aid. It surfaces, in the documents&rsquo; own words,
            what a registered professional may wish to read closely. It does not certify, sign,
            opine, or substitute for professional judgement. The registered designer reads our
            output, exercises their own judgement, verifies locally, and signs. The professional
            indemnity remains theirs. We carry product-quality risk only.
          </p>
          <p className="t-body" style={{ marginTop: 16 }}>
            That principle governs every customer-facing surface in every market. The text below
            extends it with the statutory carve-outs each market requires, and is to be quoted
            verbatim wherever the relevant jurisdiction applies.
          </p>
        </Wrap>
      </Section>

      {/* BY JURISDICTION */}
      <Section>
        <Wrap narrow>
          <span className="t-eyebrow">— II. By jurisdiction</span>
          <h2 className="t-h2" style={{ marginTop: 12 }}>
            The applicable notice, by jurisdiction.
          </h2>

          {/* IRELAND */}
          <div style={noticePaneStyle} id="privacy">
            <span className="t-eyebrow">
              — Ireland · IE · Building Control Act 1990 · Architects Act 2007
            </span>
            <h3 className="t-h2" style={{ margin: "12px 0 24px" }} id="ie">
              VerifIQ in Ireland
            </h3>
            <LockedClause>
              VerifIQ is a software-based design-review aid. It is not a regulated service under the
              Building Control Act 1990 or the Architects Act 2007. It does not act as Design
              Certifier, Assigned Certifier, or any other person to whom statutory functions are
              assigned. It does not constitute the provision of architectural, engineering,
              surveying, or fire-safety services within the meaning of the relevant Acts.
            </LockedClause>
            <div style={{ marginTop: 20 }}>
              <LockedClause>
                All output is indicative. The registered professional reads it, applies their own
                judgement, verifies locally against the source documents and applicable standards,
                and signs. VerifIQ&rsquo;s role ends at producing reading aids; the
                professional&rsquo;s role and statutory responsibility continue unchanged.
              </LockedClause>
            </div>
            <Obligation label="— Statutory carve-outs · Ireland">
              Building Control Act 1990 · Building Control (Amendment) Regulations 2014 (SI 9/2014) ·
              Architects Act 2007 · Consumer Protection Act 2007 · Sale of Goods and Supply of
              Services Act 1980. Output may not be presented as discharging the role of any person to
              whom statutory functions are assigned under these Acts.
            </Obligation>
          </div>

          {/* UK */}
          <div style={noticePaneStyle} id="uk">
            <span className="t-eyebrow">
              — United Kingdom · UK · Building Safety Act 2022 · Architects Act 1997
            </span>
            <h3 className="t-h2" style={{ margin: "12px 0 24px" }}>
              VerifIQ in the United Kingdom
            </h3>
            <LockedClause>
              VerifIQ provides a software-based reading aid. It does not act as Principal Designer,
              Principal Contractor, Building Safety Coordinator, or any other duty-holder under the
              Building Safety Act 2022 or the Building Regulations 2010. It does not provide
              architectural services as defined in the Architects Act 1997. The registered
              professional retains all statutory and contractual responsibility for the design and
              its certification.
            </LockedClause>
            <div style={{ marginTop: 20 }}>
              <LockedClause>
                The output is information, not a service taken on in respect of any building. The
                registered professional verifies all findings against the source documents and
                applicable Approved Documents before relying on them.
              </LockedClause>
            </div>
            <Obligation label="— Statutory carve-outs · United Kingdom">
              Building Safety Act 2022 · Building Regulations 2010 (with Approved Documents) ·
              Architects Act 1997 · Defective Premises Act 1972 · Consumer Rights Act 2015 ·
              Misrepresentation Act 1967. VerifIQ does not take on duty-holder status under the
              Building Safety Act 2022 for any building, including any higher-risk building as
              defined in that Act.
            </Obligation>
          </div>

          {/* EU */}
          <div style={noticePaneStyle} id="eu">
            <span className="t-eyebrow">
              — European Union · EU · AI Act 2024 · Product Liability Directive 2024
            </span>
            <h3 className="t-h2" style={{ margin: "12px 0 24px" }}>
              VerifIQ in the European Union
            </h3>
            <LockedClause>
              VerifIQ is provided as a general-purpose document-reading aid. It is not designed for,
              marketed for, or intended for use as a safety component of a product or system under
              Article 6 of the EU AI Act 2024. The output is informational and the registered
              professional alone determines whether and how to use any finding. Where a deployer in a
              high-risk context wishes to use VerifIQ output as an input to a safety-critical
              decision, they remain solely responsible for assessing the suitability and accuracy of
              the output in their specific context.
            </LockedClause>
            <Obligation label="— Published artefacts · required by the EU AI Act">
              VerifIQ publishes, and updates on each material change: (a) a technical documentation
              file pursuant to Article 11 of the AI Act, available to competent authorities on
              request; (b) an instruction-for-use document pursuant to Article 13; (c) a register of
              the systems used; (d) a transparency notice to deployers covering model classification,
              training-data provenance posture, and known limitations.
            </Obligation>
            <Obligation label="— Statutory framework · EU" style={{ marginTop: 18 }}>
              EU AI Act 2024 · revised Product Liability Directive 2024 · GDPR · Digital Services Act
              · per-Member-State professional registration regimes (e.g., Architektengesetz in DE).
              Articles 11, 13, 14, 15, and 16 of the AI Act guide our provider obligations. We do not
              claim a high-risk classification, and we do not market for safety-critical deployment.
            </Obligation>
          </div>

          {/* AUSTRALIA */}
          <div style={noticePaneStyle} id="au">
            <span className="t-eyebrow">
              — Australia · AU · Design and Building Practitioners Act 2020 (NSW) · ACL
            </span>
            <h3 className="t-h2" style={{ margin: "12px 0 24px" }}>
              VerifIQ in Australia
            </h3>
            <LockedClause>
              VerifIQ is a software-based design-review aid. It does not perform any function reserved
              to a registered design practitioner under the Design and Building Practitioners Act
              2020 (NSW) or any equivalent State legislation. The registered practitioner retains all
              statutory duties, including the statutory duty of care under section 37 of the DBP Act,
              and is solely responsible for verifying findings against source documents and
              applicable codes before relying on them.
            </LockedClause>
            <Obligation label="— ACL compliance · Australia">
              Consumer guarantees under the Australian Consumer Law (Schedule 2 to the Competition
              and Consumer Act 2010) cannot be excluded. VerifIQ states clearly what the service is
              and what it is not, defines limitation of liability in line with ACL exceptions, and
              makes the indicative nature of output prominent on every customer surface. Misleading or
              deceptive conduct prohibitions under section 18 ACL apply to all marketing claims.
            </Obligation>
            <Obligation label="— Statutory framework · Australia" style={{ marginTop: 18 }}>
              Design and Building Practitioners Act 2020 (NSW) · Building Practitioners Acts (VIC,
              QLD) · National Construction Code · Australian Consumer Law · Privacy Act 1988 +
              Australian Privacy Principles. Personal data of Australian users is held in an
              Australian Convex region in accordance with APP 8.
            </Obligation>
          </div>

          {/* CANADA */}
          <div style={noticePaneStyle} id="ca">
            <span className="t-eyebrow">
              — Canada · CA · Ontario Architects Act · Professional Engineers Act
            </span>
            <h3 className="t-h2" style={{ margin: "12px 0 24px" }}>
              VerifIQ in Canada
            </h3>
            <LockedClause>
              VerifIQ provides software-based reading aids for design documents. It does not practice
              architecture or engineering as defined under the Ontario Architects Act, Professional
              Engineers Act, or equivalent legislation in any province. It does not act as a Qualified
              Person under Part 11 of the Ontario Building Code or under any provincial building
              regulation. The registered design professional retains sole responsibility for design
              decisions, code compliance, and certification.
            </LockedClause>
            <Obligation label="— Quebec · Law 25 · Charter of the French Language">
              Privacy notices are available in French in accordance with the Charter of the French
              Language. A Privacy Officer is designated and contactable by Quebec users at the address
              published in the privacy notice. Automated-processing disclosures comply with the Act
              respecting the protection of personal information in the private sector (Quebec Law 25).
            </Obligation>
            <Obligation label="— Statutory framework · Canada" style={{ marginTop: 18 }}>
              Ontario Architects Act · Professional Engineers Act (per province) · Ontario Building
              Code Part 11 · PIPEDA (federal) · Quebec Law 25 · Consumer Protection Act 2002 (Ontario)
              and equivalents · Competition Act.
            </Obligation>
          </div>

          {/* US */}
          <div style={noticePaneStyle} id="us">
            <span className="t-eyebrow">
              — United States · US · State Practice Acts · FTC § 5 · HIPAA
            </span>
            <h3 className="t-h2" style={{ margin: "12px 0 24px" }}>
              VerifIQ in the United States
            </h3>
            <LockedClause>
              VerifIQ is a software-based document-reading aid. It does not practice architecture,
              engineering, surveying, or any other licensed profession in any U.S. state. It is not a
              substitute for the judgement of a licensed professional. The licensed professional
              verifies findings against source documents and applicable state and local codes before
              relying on them.
            </LockedClause>
            <div style={{ marginTop: 20 }}>
              <LockedClause>
                VerifIQ does not warrant that any finding is correct, complete, or applicable. All
                output is informational and indicative.
              </LockedClause>
            </div>
            <Obligation label="— HIPAA · U.S. healthcare">
              If any U.S. healthcare pack is ever uploaded, a Business Associate Agreement (BAA) is
              mandatory before any document content is processed. Until a BAA is executed with the
              relevant covered entity, VerifIQ marketing does not solicit U.S. healthcare packs, and
              the platform will refuse uploads from accounts flagged as U.S. healthcare without a BAA
              on file.
            </Obligation>
            <Obligation label="— Statutory framework · United States" style={{ marginTop: 18 }}>
              State Architecture / Engineering Practice Acts (per state) · Federal Trade Commission
              Act § 5 · state UDAAP statutes · HIPAA (where healthcare PHI is involved) · CCPA / CPRA
              · Virginia VCDPA · Connecticut CTDPA · state AI laws (NYC Local Law 144, Colorado AI Act
              2024) · International Building Code as amended by each state and municipality.
            </Obligation>
          </div>
        </Wrap>
      </Section>

      {/* GLOBAL BAR */}
      <Section tint>
        <Wrap narrow style={{ textAlign: "center" }}>
          <span className="t-eyebrow" style={{ display: "block", marginBottom: 14 }}>
            — Global · Above all jurisdictions
          </span>
          <p
            className="t-lede"
            style={{ fontStyle: "italic", maxWidth: "60ch", margin: "0 auto", lineHeight: 1.7 }}
          >
            VerifIQ is a software-based reading aid. It surfaces, in the documents&rsquo; own words,
            what a registered professional may wish to read closely. It does not certify, sign, opine,
            or substitute for professional judgement. The registered designer reads our output,
            exercises their own judgement, verifies locally, and signs. The professional indemnity
            remains theirs. We carry product-quality risk only.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              justifyContent: "center",
              marginTop: 28,
            }}
          >
            <span className="t-meta">Last reviewed · 2026-06-01</span>
            <span className="t-meta">Reviewed by · Coordinating Counsel Ireland</span>
            <span className="t-meta">Next review · Quarterly</span>
          </div>
        </Wrap>
      </Section>

      {/* OPERATIONAL — also carries the terms-of-service anchor */}
      <Section>
        <Wrap narrow>
          <span className="t-eyebrow">— III. Operational</span>
          <h2 className="t-h2" style={{ marginTop: 12 }} id="tos">
            How we hold the line in practice.
          </h2>
          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 1,
              background: "var(--hairline-strong)",
              border: "1px solid var(--hairline-strong)",
            }}
          >
            <div style={{ background: "var(--surface)", padding: 24 }}>
              <span className="t-eyebrow">— Locked language</span>
              <p className="t-body" style={{ marginTop: 10 }}>
                The clauses above are locked. No marketing, copywriting, sales, or product decision
                changes them without solicitor review in the relevant jurisdiction. The exact wording
                is published verbatim on every customer-facing surface (web, PDF, XLSX, email).
              </p>
            </div>
            <div style={{ background: "var(--surface)", padding: 24 }}>
              <span className="t-eyebrow">— Reviewer panel</span>
              <p className="t-body" style={{ marginTop: 10 }}>
                Every pack is gated by a chartered Irish reviewer before release. In each new market
                we enter, a local chartered panel must be in place before a single paid scan is
                issued. The reviewer&rsquo;s initials are stamped to the audit log.
              </p>
            </div>
            <div style={{ background: "var(--surface)", padding: 24 }}>
              <span className="t-eyebrow">— Insurance</span>
              <p className="t-body" style={{ marginTop: 10 }}>
                Tech E&amp;O, cyber, and general liability scaled per market. Premium and binders
                confirmed before any market-specific revenue is taken. AI-Act-relevant endorsement
                reviewed before EU entry.
              </p>
            </div>
            <div style={{ background: "var(--surface)", padding: 24 }}>
              <span className="t-eyebrow">— Data residency</span>
              <p className="t-body" style={{ marginTop: 10 }}>
                EU customers in EU-West (Dublin). Australian customers in AU-Sydney. Canadian
                customers in CA-Central. U.S. customers in US-East-1. Documents purged at 14 days;
                hashes 90 days; inference logs 30 days. No customer document trains any model.
              </p>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* CAVEAT */}
      <Section>
        <Wrap narrow>
          <div
            style={{
              padding: "24px 28px",
              border: "1px solid var(--accent)",
              background: "var(--surface)",
            }}
          >
            <span className="t-eyebrow" style={{ color: "var(--accent)" }}>
              — Caveat · Important
            </span>
            <p className="t-body" style={{ margin: "12px 0 0" }}>
              This page is a customer-facing summary of VerifIQ&rsquo;s legal posture. It is not legal
              advice and does not create a solicitor&ndash;client relationship. Every clause is
              reviewed by a qualified solicitor in the relevant jurisdiction before publication;
              readers should consult their own counsel before relying on any clause for their own
              activity.
            </p>
          </div>
        </Wrap>
      </Section>
    </MarketingShell>
  );
}
