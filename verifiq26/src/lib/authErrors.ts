/** Map Convex Auth / Password provider errors to staff-friendly copy. */
export function formatAuthError(message: string, flow: "signIn" | "signUp"): string {
  if (message === "InvalidSecret" || message === "Invalid credentials") {
    return "Incorrect password. Sign in with the password you used when you first created this account.";
  }

  if (message === "InvalidAccountId") {
    return flow === "signIn"
      ? "No account found for this email. Create one instead."
      : "No account found for this email.";
  }

  if (message === "TooManyFailedAttempts") {
    return "Too many failed sign-in attempts. Wait a few minutes and try again.";
  }

  const accountExistsMatch = /^Account (.+) already exists$/.exec(message);
  if (accountExistsMatch) {
    return `An account for ${accountExistsMatch[1]} already exists. Sign in with your existing password — do not create a new account.`;
  }

  if (message.includes("Uncaught Error:")) {
    const inner = message.replace(/^Uncaught Error:\s*/i, "").replace(/^Uncaught Error:\s*/i, "");
    return formatAuthError(inner, flow);
  }

  return message;
}
