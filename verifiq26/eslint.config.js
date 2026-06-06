// VerifIQ — ESLint flat config (Phase 1)
// ESLint default + @typescript-eslint/recommended, per the Phase 1 style brief.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["src/convex/_generated/**", "src/_legacy_poc/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "error",
    },
  },
);
