import type { Metadata } from "next";
import { MarketingShell, Wrap, Section } from "@/components/marketing/MarketingShell";
import { SourceQuote } from "@/components/ui/SourceQuote";

export const metadata: Metadata = {
  title: "About — VerifIQ",
  description:
    "Pre-tender pack review for Irish construction teams. Source-quoted findings, chartered reviewer gate, honest posture on every release.",
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <header style={{ padding: "64px 0 56px", borderBottom: "1px solid var(--hairline-strong)" }}>
        <Wrap>
          <span className="t-eyebrow">— Drawing 30 · About</span>
          <h1 className="t-display" style={{ margin: "16px 0 12px" }}>
            The honesty is the product.
          </h1>
          <p className="t-lede" style={{ maxWidth: "60ch" }}>
            VerifIQ is a reading aid for Irish project teams. It surfaces, in the documents&rsquo; own
            words, what a registered professional may wish to read closely &mdash; and a chartered
            reviewer gates every release.
          </p>
        </Wrap>
      </header>

      <Section>
        <Wrap narrow>
          <h2 className="t-h2" style={{ marginBottom: 16 }}>What we are.</h2>
          <p className="t-body">
            A structured, evidence-based read of your tender pack before it goes to market — or
            before you price it. We read drawings, specifications, schedules, and contract forms
            against the Irish corpus, source-quote every finding, and a chartered reviewer signs
            the audit log before anything is released. We do not certify, sign, opine, or substitute
            for professional judgement.
          </p>
        </Wrap>
      </Section>

      <Section tint>
        <Wrap narrow>
          <h2 className="t-h2" style={{ marginBottom: 16 }}>What most products do instead.</h2>
          <p className="t-body" style={{ marginBottom: 24 }}>
            Most products for the design industry oversell. They imply expert review where none is
            happening, or hide the reviewer behind an &ldquo;expert panel&rdquo; that nobody at the
            company has actually met. We name the reviewer, we mark what is pending sign-off, and we
            tell you exactly what level of review backs each finding.
          </p>
          <SourceQuote
            quote="Findings outside the reviewed discipline appear on your register marked 'pending reviewer sign-off · [discipline]' until the relevant specialist joins the cohort. You see everything; you know exactly what backs each finding."
            reference="VerifIQ — review posture"
          />
        </Wrap>
      </Section>
    </MarketingShell>
  );
}
