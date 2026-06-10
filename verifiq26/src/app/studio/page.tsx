import Link from "next/link";
import { MarketingShell, Wrap, Section } from "@/components/marketing/MarketingShell";
import { SheetTagButton, LeaderButton } from "@/components/ui/Button";

export const metadata = {
  title: "VerifIQ — Studio · For the sole practitioner",
  description:
    "Studio is VerifIQ for the sole practitioner. Single discipline. One pack. A lighter touch — source-quoted findings on the document set you actually have to sign.",
};

/**
 * Studio — sole-practitioner product page.
 * Product accent: moss/green (--sev-low). The accent override below
 * cascades through eyebrows and buttons on this page only.
 */
const ACCENT: React.CSSProperties = {
  ["--accent" as string]: "var(--sev-low)",
  ["--accent-hover" as string]: "var(--sev-low)",
};

export default function StudioPage() {
  return (
    <MarketingShell>
      <div style={ACCENT}>
        {/* HERO */}
        <Section style={{ paddingTop: 88, paddingBottom: 104 }}>
          <Wrap narrow style={{ margin: "0 auto" }}>
            <div style={{ maxWidth: 760 }}>
              <span className="t-eyebrow" style={{ color: "var(--sev-low)" }}>
                — Drawing 30 · Studio · Sole practitioner
              </span>
              <h1 className="t-display" style={{ margin: "18px 0" }}>
                One discipline. One pack.{" "}
                <em style={{ fontStyle: "italic", color: "var(--sev-low)" }}>
                  A lighter touch.
                </em>
              </h1>
              <p className="t-lede" style={{ maxWidth: "32em" }}>
                Studio is VerifIQ for the architect, engineer, or surveyor working alone — or as
                the named lead on a single discipline within a wider team. Source-quoted findings
                on the document set you actually have to sign.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "center",
                  marginTop: 32,
                  flexWrap: "wrap",
                }}
              >
                <SheetTagButton code="S-001" label="Begin Studio" href="/request" />
                <LeaderButton num="01" label="Is this you?" href="#fit" />
              </div>
            </div>
          </Wrap>
        </Section>

        {/* I — THE DELIBERATE QUIET */}
        <Section>
          <Wrap narrow>
            <SectionHead
              num="I."
              title="The deliberate quiet."
              lede="Studio is built for the practitioner who doesn't need a multi-discipline team product. One discipline. The corpora that matter to your charter. The level of detail your signature requires."
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 1,
                background: "var(--hairline-strong)",
                border: "1px solid var(--hairline-strong)",
              }}
            >
              <Panel
                title="Single discipline."
                body="Architecture only, or M&E only, or fire only — whichever charter you hold. We read against that discipline's corpora and surface only the findings that affect your scope. No cross-pass, no other-discipline noise."
              />
              <Panel
                title="Right-sized pack."
                body="Up to 50 documents per pack. Right for the typical sole-practitioner brief — a residential extension, a small commercial fit-out, a single-discipline review on a wider team's pack where you're the named lead."
              />
              <Panel
                title="Lighter touch."
                body="One-pass read. Source-quoted findings. RFI-ready language. No coordination cross-pass (that's the multi-discipline product). No reviewer queue overhead. Released within 24 hours."
              />
              <Panel
                title="Same locked posture."
                body="Same review discipline. Same locked disclaimer. Same audit log. The professional indemnity stays with you; we surface, you verify, you sign."
              />
            </div>
          </Wrap>
        </Section>

        {/* II — WHO STUDIO IS FOR */}
        <Section tint>
          <Wrap narrow>
            <div id="fit" style={{ scrollMarginTop: 80 }} />
            <SectionHead
              num="II."
              title="Who Studio is for."
              lede="If you recognise yourself in one of these, Studio probably fits."
            />
            <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gap: 10 }}>
              {WHO.map((item) => (
                <li
                  key={item}
                  className="t-body"
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--sev-low)",
                      flexShrink: 0,
                      transform: "translateY(2px)",
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p
              className="t-lede"
              style={{ fontSize: "1.125rem", marginTop: 24 }}
            >
              If your job is multi-discipline coordination on a big team&rsquo;s pack,{" "}
              <Link href="/">Verify</Link> is the right product. If you&rsquo;re a contractor
              pricing a tender, <Link href="/hunt">Hunt</Link> is the right product. Studio is the
              quietest of the three.
            </p>
          </Wrap>
        </Section>

        {/* III — PRICING */}
        <Section>
          <Wrap narrow>
            <SectionHead
              num="III."
              title="Pricing."
              lede="Per-pack or annual. Sole practitioners typically pick per-pack and graduate to annual if they run two or more packs per quarter."
            />
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
              <PriceCell
                eyebrow="— Per-pack"
                title="Studio pack."
                sub="Single discipline · up to 50 docs"
                price="€290"
                priceSub="+ VAT · per pack"
                items={[
                  "Source-quoted findings",
                  "RFI-ready language",
                  "Reviewer-signed audit log",
                  "XLSX register export",
                  "Released within 24 hours",
                ]}
                cta={<LeaderButton num="I" label="Start a Studio pack" href="/request" />}
              />
              <PriceCell
                featured
                eyebrow="— Annual seat"
                title="Studio year."
                sub="Unlimited Studio packs · single user"
                price="€2,800"
                priceSub="+ VAT · per year"
                items={[
                  "Unlimited Studio packs",
                  "One named user",
                  "Concierge replies in 48 hours",
                  "Audit log retention · 2 years",
                  "Studio-specific reviewer queue",
                ]}
                cta={<SheetTagButton code="YEAR" label="Take a Studio year" href="/request" />}
              />
            </div>
          </Wrap>
        </Section>

        {/* IV — WHAT STUDIO IS NOT */}
        <Section tint>
          <Wrap narrow>
            <SectionHead
              num="IV."
              title="What Studio is not."
              lede="Honest about scope. Same as every VerifIQ product."
            />
            <div className="t-body" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
              <p>
                Studio is not a substitute for your professional judgement. The chartered eye stays
                with you; we surface, you verify, you sign.
              </p>
              <p>
                Studio is not a multi-discipline read. If your pack covers more than one discipline,{" "}
                <Link href="/">Verify</Link> is the right product — Studio will only read the
                discipline you nominate.
              </p>
              <p>
                Studio is not the BCAR Assigned Certifier function. If you are signing as Assigned
                Certifier, Studio is a reading aid to support your work — it does not replace the AC
                function.
              </p>
              <p>
                Studio is not a tender-strategy or design-strategy consultancy. We surface
                what&rsquo;s in the documents you&rsquo;ve shared; we do not advise on what to design
                or how to bid.
              </p>
            </div>
          </Wrap>
        </Section>

        {/* NEXT STEP CTA */}
        <Section>
          <Wrap narrow style={{ textAlign: "center" }}>
            <span className="t-eyebrow" style={{ color: "var(--sev-low)" }}>
              — Next step
            </span>
            <h2 className="t-h1" style={{ margin: "14px 0 12px" }}>
              A free taster, on your discipline.
            </h2>
            <p className="t-lede" style={{ margin: "0 0 28px" }}>
              One discipline. Up to twenty documents. Counts plus one worked finding. No card.
              Twenty-two minutes end-to-end.
            </p>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <SheetTagButton code="FREE" label="Free taster" href="/request" />
              <LeaderButton num="01" label="Request the brief" href="/request" />
            </div>
          </Wrap>
        </Section>

        {/* LOCKED DISCLAIMER */}
        <LockedBlock />
      </div>
    </MarketingShell>
  );
}

const WHO = [
  "A chartered architect signing a residential extension or refurbishment under PSDP / BCAR.",
  "A CEng M&E engineer reviewing one discipline of a wider team's tender pack, where you're the named technical lead.",
  "A SCSI quantity surveyor checking a Bill of Quantities for a small commercial fit-out before issue.",
  "A fire safety consultant reviewing a fire strategy + cause-and-effect matrix for a single-discipline appointment.",
  "A conservation architect reviewing a Method Statement for a Protected Structure works package.",
  "An Assigned Certifier preparing the BCAR doc-set hygiene check (NOT the AC function itself — that stays with you).",
  "A sole-practitioner architectural technologist drafting under the supervision of a registered architect.",
];

/* ---------- page-local building blocks ---------- */

function SectionHead({ num, title, lede }: { num: string; title: string; lede: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: "2.5rem",
          color: "var(--sev-low)",
          lineHeight: 1,
        }}
      >
        {num}
      </div>
      <h2 className="t-h2" style={{ margin: "12px 0 10px" }}>
        {title}
      </h2>
      <p className="t-lede" style={{ margin: 0, maxWidth: "56ch" }}>
        {lede}
      </p>
    </div>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: "var(--bg)", padding: "32px 28px" }}>
      <h3 className="t-h2" style={{ fontSize: "1.375rem", margin: "0 0 12px" }}>
        {title}
      </h3>
      <p className="t-body" style={{ margin: 0, fontSize: "0.9375rem" }}>
        {body}
      </p>
    </div>
  );
}

function PriceCell({
  eyebrow,
  title,
  sub,
  price,
  priceSub,
  items,
  cta,
  featured = false,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  price: string;
  priceSub: string;
  items: string[];
  cta: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      style={{
        background: featured ? "var(--surface)" : "var(--bg)",
        padding: "36px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <span className="t-eyebrow" style={{ color: "var(--sev-low)" }}>
        {eyebrow}
      </span>
      <h3 className="t-h2" style={{ fontSize: "1.5rem", margin: "10px 0 4px" }}>
        {title}
      </h3>
      <span className="t-meta" style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>
        {sub}
      </span>
      <div
        className="t-data"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: "2.5rem",
          lineHeight: 1,
          margin: "20px 0 6px",
          color: "var(--text)",
        }}
      >
        {price}
      </div>
      <span className="t-meta" style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>
        {priceSub}
      </span>
      <ul style={{ listStyle: "none", padding: 0, margin: "20px 0", width: "100%" }}>
        {items.map((it) => (
          <li
            key={it}
            className="t-body"
            style={{
              fontSize: "0.875rem",
              padding: "5px 0",
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              lineHeight: 1.55,
            }}
          >
            <span style={{ color: "var(--sev-low)", fontWeight: 700, fontSize: "1.25rem" }}>·</span>
            {it}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}

function LockedBlock() {
  return (
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
        <span className="t-eyebrow">— Notice · Locked Disclaimer</span>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "var(--text)",
            maxWidth: "58ch",
            margin: "14px auto",
            padding: "0 20px",
          }}
        >
          VerifIQ is a software-based reading aid. It surfaces, in the documents&rsquo; own words,
          what a registered professional may wish to read closely. It does not certify, sign, opine,
          or substitute for professional judgement. The registered designer reads our output,
          exercises their own judgement, verifies locally, and signs. The professional indemnity
          remains theirs. We carry product-quality risk only.
        </p>
      </Wrap>
    </section>
  );
}
