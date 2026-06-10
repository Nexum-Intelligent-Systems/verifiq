import type { Metadata } from "next";
import { MarketingShell, Wrap, Section } from "@/components/marketing/MarketingShell";
import { RequestForm } from "@/components/marketing/RequestForm";

export const metadata: Metadata = {
  title: "Request the brief — VerifIQ",
  description: "Ask for a VerifIQ brief. A concierge replies within 48 hours.",
};

export default function RequestPage() {
  return (
    <MarketingShell>
      <header style={{ padding: "64px 0 56px", borderBottom: "1px solid var(--hairline-strong)" }}>
        <Wrap narrow>
          <span className="t-eyebrow">— A-001 · Request the brief</span>
          <h1 className="t-h1" style={{ margin: "16px 0 12px" }}>
            Tell us what you&rsquo;re reading.
          </h1>
          <p className="t-lede" style={{ maxWidth: "56ch" }}>
            One pack, one discipline, or a full design-team set. We&rsquo;ll confirm scope, corpus and
            timeline before anything begins.
          </p>
        </Wrap>
      </header>

      <Section>
        <Wrap narrow>
          <RequestForm />
        </Wrap>
      </Section>
    </MarketingShell>
  );
}
