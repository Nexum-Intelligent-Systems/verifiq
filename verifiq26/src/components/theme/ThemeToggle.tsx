"use client";

import { useTheme } from "./ThemeProvider";

/**
 * Drawing-register styled theme switch: a mono label + the current state.
 * Reads as a sheet annotation rather than a generic sun/moon toggle.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-mono)",
        fontSize: "0.625rem",
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        background: "transparent",
        border: "1px solid var(--hairline)",
        padding: "6px 10px",
        cursor: "pointer",
      }}
    >
      <span aria-hidden style={{ color: isDark ? "var(--text-muted)" : "var(--accent)" }}>
        ☼ Bone
      </span>
      <span aria-hidden style={{ width: 1, height: 12, background: "var(--hairline)" }} />
      <span aria-hidden style={{ color: isDark ? "var(--accent)" : "var(--text-muted)" }}>
        ☾ Dark
      </span>
    </button>
  );
}
