import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/** Single source of truth for the public site header. */
const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/hunt", label: "Hunt" },
  { href: "/studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function TopNav() {
  return (
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

        <ul
          style={{
            display: "flex",
            gap: 22,
            listStyle: "none",
            margin: 0,
            padding: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{ color: "var(--text)", borderBottom: "1px solid transparent" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/request"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent)",
            borderBottom: "1px solid var(--accent)",
            paddingBottom: 2,
          }}
        >
          Request the brief ↗
        </Link>

        <ThemeToggle />
      </div>
    </nav>
  );
}
