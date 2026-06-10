import { TopNav } from "./TopNav";
import { Footer } from "./Footer";

/**
 * Wraps every public marketing page with the single-source nav + footer.
 * Pages render only their own content inside <MarketingShell>.
 */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}

/** Standard content width wrapper. */
export function Wrap({
  children,
  narrow = false,
  style,
}: {
  children: React.ReactNode;
  narrow?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ maxWidth: narrow ? 880 : 1240, margin: "0 auto", padding: "0 32px", ...style }}>
      {children}
    </div>
  );
}

/** Standard section band with a hairline divider, matching the register rhythm. */
export function Section({
  children,
  tint = false,
  style,
}: {
  children: React.ReactNode;
  tint?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        padding: "72px 0",
        borderBottom: "1px solid var(--hairline-strong)",
        background: tint ? "var(--elevated)" : "transparent",
        ...style,
      }}
    >
      {children}
    </section>
  );
}
