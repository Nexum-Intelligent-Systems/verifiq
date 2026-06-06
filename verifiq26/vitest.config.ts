import { defineConfig } from "vitest/config";

// convex-test runs Convex functions in-process; it needs the edge-runtime
// environment and convex-test inlined. See https://docs.convex.dev/testing.
export default defineConfig({
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    include: ["tests/**/*.test.ts"],
  },
});
