/**
 * ESLint config for VerifIQ Phase 1.
 * Base recommended + @typescript-eslint/recommended (per docs/28 § Style).
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: 2021, sourceType: "module" },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: { node: true, es2021: true },
  ignorePatterns: ["src/convex/_generated/", "node_modules/", "dist/"],
  rules: {
    "no-console": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
};
