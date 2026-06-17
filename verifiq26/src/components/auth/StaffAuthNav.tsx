"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

const buttonStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.6875rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  border: "1px solid var(--hairline-strong)",
  padding: "8px 14px",
  textDecoration: "none",
  background: "transparent",
  cursor: "pointer",
  lineHeight: 1.2,
};

/** Staff entry in the public site header — sign in, console, or sign out. */
export function StaffAuthNav() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (isLoading) {
    return (
      <span style={{ ...buttonStyle, color: "var(--text-muted)", opacity: 0.5 }}>
        …
      </span>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/sign-in"
        style={{
          ...buttonStyle,
          color: "var(--text)",
          borderColor: "var(--gold)",
        }}
      >
        Staff login
      </Link>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Link
        href="/projects/new"
        style={{
          ...buttonStyle,
          color: "var(--gold)",
          borderColor: "var(--gold)",
        }}
      >
        Console
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        style={{ ...buttonStyle, color: "var(--text-muted)" }}
      >
        Sign out
      </button>
    </div>
  );
}
