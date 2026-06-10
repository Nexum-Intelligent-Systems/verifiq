import Link from "next/link";
import { MarketingShell, Wrap } from "@/components/marketing/MarketingShell";
import { SheetTagButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <MarketingShell>
      <Wrap style={{ padding: "120px 32px", textAlign: "center" }}>
        <span className="t-eyebrow">— Sheet not found</span>
        <h1 className="t-display" style={{ margin: "16px 0 12px" }}>
          404
        </h1>
        <p className="t-lede" style={{ maxWidth: "48ch", margin: "0 auto 32px" }}>
          This drawing isn&rsquo;t in the set. The reference may have changed, or it was never issued.
        </p>
        <div style={{ display: "inline-flex" }}>
          <SheetTagButton code="A-000" label="Return home" href="/" />
        </div>
        <p className="t-meta" style={{ marginTop: 28 }}>
          Or read <Link href="/legal">the legal notice</Link>.
        </p>
      </Wrap>
    </MarketingShell>
  );
}
