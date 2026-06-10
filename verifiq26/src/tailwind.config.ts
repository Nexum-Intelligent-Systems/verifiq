import type { Config } from "tailwindcss";

/**
 * Tailwind is wired to the semantic theme tokens in app/theme.css so that
 * utility classes (bg-surface, text-muted, border-hairline, etc.) follow the
 * active [data-theme] automatically. Raw hexes never appear in components.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        text: { DEFAULT: "var(--text)", soft: "var(--text-soft)", muted: "var(--text-muted)" },
        hairline: "var(--hairline)",
        accent: { DEFAULT: "var(--accent)", hover: "var(--accent-hover)" },
        gold: "var(--gold)",
        sev: {
          critical: "var(--sev-critical)",
          high: "var(--sev-high)",
          medium: "var(--sev-medium)",
          low: "var(--sev-low)",
        },
      },
      fontFamily: {
        serif: "var(--font-serif)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      borderRadius: { sm: "var(--r-sm)", md: "var(--r-md)", lg: "var(--r-lg)" },
    },
  },
  plugins: [],
};

export default config;
