import Link from "next/link";
import { StaffAuthNav } from "@/components/auth/StaffAuthNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/** Authed app chrome — wordmark, console context, auth, theme. No marketing footer. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "color-mix(in srgb, var(--bg) 92%, transparent)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--hairline-strong)",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <Link href="/" className="wordmark" style={{ marginRight: "auto" }}>
            VerifIQ
          </Link>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Atelier console
          </span>
          <StaffAuthNav />
          <ThemeToggle />
        </div>
      </nav>
      <main>{children}</main>
      <footer
        style={{
          borderTop: "1px solid var(--hairline-strong)",
          padding: "20px 32px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        VerifIQ · Atelier console · Indicative review aid, not a certification
      </footer>
    </>
  );
}
