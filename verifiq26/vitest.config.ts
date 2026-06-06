/**
 * Vitest configuration for VerifIQ Phase 1.
 *
 * Uses the edge-runtime environment because `convex-test` runs Convex
 * functions (mutations/queries) against the schema in an in-memory model
 * that mirrors the Convex server runtime.
 *
 * Spec references: docs/28 § Deliverable 5 (smoke test).
 * Version: 0.3.0-phase1
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    include: ["tests/**/*.test.ts"],
  },
});
