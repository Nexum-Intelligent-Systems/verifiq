"use node";

import { modifyAccountCredentials } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Dev-only staff password reset. Requires DEV_AUTH_RESET_SECRET on the deployment:
 *   npx convex env set DEV_AUTH_RESET_SECRET "<secret>"
 *   npx convex run devAuth:resetStaffPassword '{"email":"you@example.com","newPassword":"...","secret":"<secret>"}'
 */
export const resetStaffPassword = action({
  args: {
    email: v.string(),
    newPassword: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    const expected = process.env.DEV_AUTH_RESET_SECRET;
    if (!expected) {
      throw new Error("DEV_AUTH_RESET_SECRET is not configured on this deployment.");
    }
    if (args.secret !== expected) {
      throw new Error("Invalid reset secret.");
    }
    if (args.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: args.email, secret: args.newPassword },
    });

    return { ok: true as const, email: args.email };
  },
});
