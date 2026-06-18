/**
 * VerifIQ — transactional email send (Scaleway Transactional Email).
 *
 * Sprint 1 path: the "Your secure upload link" email (docs/18 voice, docs/42
 * §5.3 B3). Kept deliberately thin and dependency-free — a `fetch` to Scaleway's
 * REST API, available in the Convex action runtime and Node 20+ alike, so no
 * SDK and no new package are pulled in.
 *
 * EU data residency: our recipients are EU-resident, so we use Scaleway TEM — an
 * EU-owned provider (French) that processes and logs entirely within the EU
 * (`fr-par` / `nl-ams`) with no US parent and no data leaving the EU per its DPA.
 * Unlike Resend (EU *sending* but US-stored metadata), this gives true EU
 * residency, consistent with the R2-EU / docs/20 GDPR posture. See docs/43 §1a.
 *
 * If `SCW_SECRET_KEY` or `SCW_PROJECT_ID` is unset (offline dev / `convex dev`
 * without secrets) the send is a no-op that reports `{ sent: false }` rather than
 * throwing — so the intake flow still creates the project + code and stays
 * testable. The raw code is NEVER logged or returned over HTTP; it travels only
 * inside this email.
 */

/** Build the region-scoped Scaleway TEM send endpoint (default `fr-par`, EU). */
function temEndpoint(): string {
  const region = process.env.SCW_TEM_REGION ?? "fr-par";
  return `https://api.scaleway.com/transactional-email/v1alpha1/regions/${region}/emails`;
}

/**
 * Parse `EMAIL_FROM` (`"VerifIQ <hello@verifiq.ie>"` or a bare address) into the
 * `{ name, email }` object Scaleway's API expects.
 */
function parseFrom(raw: string): { name: string; email: string } {
  const m = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m && m[2]) return { name: m[1] || "VerifIQ", email: m[2].trim() };
  return { name: "VerifIQ", email: raw.trim() };
}

/** Locked disclaimer footer (docs/18) — appended to every transactional email. */
const DISCLAIMER =
  "VerifIQ is a software-based reading aid. It does not certify, sign, opine, " +
  "or substitute for professional judgement. The registered designer verifies " +
  "locally and retains all professional responsibility.";

export interface UploadLinkEmail {
  to: string;
  name: string;
  projectName: string;
  /** One-click magic link, e.g. https://app.verifiq.ie/upload?code=… */
  link: string;
  /** Human fallback code (D4) for when the link is mangled / spam-binned. */
  code: string;
}

/** Plain-text body for the upload-link email (docs/18 sober founder voice). */
export function renderUploadLinkEmail(e: UploadLinkEmail): string {
  return [
    `Hi ${e.name},`,
    "",
    `Your VerifIQ upload link for ${e.projectName} is ready. Open it and drag`,
    "your pack straight in — it uploads directly, resumes if your connection",
    "drops, and the read starts the moment the last file lands.",
    "",
    `Upload your pack:  ${e.link}`,
    "",
    `If the link doesn't open, go to the upload page and enter this code: ${e.code}`,
    "",
    "The link is single-use and expires in 72 hours. If it lapses, just request",
    "a new one from the site.",
    "",
    "— Liam",
    "Founder, VerifIQ (a GovIQ Ltd product)",
    "",
    "— — —",
    DISCLAIMER,
  ].join("\n");
}

/**
 * Send the upload-link email. Returns `{ sent: false }` (never throws) when the
 * Scaleway credentials are absent or the API rejects the request, so a delivery
 * failure parks the intake rather than 500-ing the whole request.
 */
export async function sendUploadLinkEmail(e: UploadLinkEmail): Promise<{ sent: boolean }> {
  const key = process.env.SCW_SECRET_KEY;
  const projectId = process.env.SCW_PROJECT_ID;
  if (!key || !projectId) return { sent: false };
  const from = parseFrom(process.env.EMAIL_FROM ?? "VerifIQ <hello@verifiq.ie>");

  try {
    const res = await fetch(temEndpoint(), {
      method: "POST",
      headers: {
        "X-Auth-Token": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [{ email: e.to, name: e.name }],
        subject: "Your secure VerifIQ upload link",
        text: renderUploadLinkEmail(e),
        project_id: projectId,
      }),
    });
    return { sent: res.ok };
  } catch {
    return { sent: false };
  }
}
