/**
 * VerifIQ — locked constants.
 *
 * Purpose: the verbatim legal disclaimer and the banned/permitted language
 * lists, exported for use by every output surface and by the pre-release
 * language validator. Source of truth: `verifiq-prompts/08_guardrails.md`.
 *
 * The disclaimer string is LEGALLY LOCKED — changing it requires solicitor
 * review (see verifiq-prompts/README.md § Update cadence). Do not edit casually.
 *
 * Version: 0.3.0-phase1
 */

/**
 * The locked disclaimer. Must appear on every PDF cover, every XLSX cover
 * sheet, every DOCX footer, every customer-facing web footer, every
 * transactional email footer, every API response (`disclaimer` field), and the
 * Council Chair report closing block. (file 08)
 */
export const LOCKED_DISCLAIMER =
  "VerifIQ is a software-based reading aid. It surfaces, in the documents' own " +
  "words, what a registered professional may wish to read closely. It does not " +
  "certify, sign, opine, or substitute for professional judgement. The registered " +
  "designer reads our output, exercises their own judgement, verifies locally, and " +
  "signs. The professional indemnity remains theirs. We carry product-quality risk only.";

/**
 * Verbs banned on customer-facing surfaces (marketing, email, demos, sales).
 * The pre-release validator flags these. (file 08 § Banned marketing language)
 */
export const BANNED_VERBS: readonly string[] = [
  "verify",
  "certify",
  "approve",
  "validate",
  "guarantee",
  "comply",
  "ensure",
  "prove",
  "confirm",
  "sign off",
];

/** Nouns banned on customer-facing surfaces. (file 08 § Banned marketing nouns) */
export const BANNED_NOUNS: readonly string[] = [
  "certifier",
  "approver",
  "regulator",
  "expert",
  "authority",
  "opinion",
  "judgement",
];

/** Permitted verbs — the approved reviewer/marketing vocabulary. (file 08) */
export const PERMITTED_VERBS: readonly string[] = [
  "check",
  "read",
  "surface",
  "indicate",
  "highlight",
  "flag",
  "draw attention to",
  "help find",
  "point at",
  "assist",
  "augment",
  "review",
  "assess",
];

/**
 * Scan a piece of customer-facing text for banned marketing verbs/nouns.
 * Returns the list of banned terms present (case-insensitive, word-boundary).
 * Used by the Phase 2 pre-release validator; provided in Phase 1 so the gate
 * exists from day one. (file 08 § What violates these guardrails)
 */
export function findBannedTerms(text: string): string[] {
  const haystack = text.toLowerCase();
  const hits: string[] = [];
  for (const term of [...BANNED_VERBS, ...BANNED_NOUNS]) {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(haystack)) hits.push(term);
  }
  return hits;
}
