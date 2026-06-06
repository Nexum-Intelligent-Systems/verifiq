/**
 * VerifIQ — guardrail constants + mechanical validators (Phase 1)
 *
 * Purpose: Exports the locked disclaimer string and the banned-verb / banned-
 *   noun lists from `verifiq-prompts/08_guardrails.md`, plus a mechanical
 *   scanner used by the pre-release validator (and the Phase 1 self-test) to
 *   prove no banned language reaches a customer-facing surface.
 *
 * Implements: 08_guardrails.md.
 * Version: phase1-v0.1
 */

/**
 * The locked disclaimer — VERBATIM from 08_guardrails.md. Must appear on every
 * PDF/XLSX/DOCX export, every web + email footer, and every API response in a
 * top-level `disclaimer` field. Do not edit this string without a guardrails
 * change-control review.
 */
export const LOCKED_DISCLAIMER =
  "VerifIQ is a software-based reading aid. It surfaces, in the documents' own words, " +
  "what a registered professional may wish to read closely. It does not certify, sign, " +
  "opine, or substitute for professional judgement. The registered designer reads our " +
  "output, exercises their own judgement, verifies locally, and signs. The professional " +
  "indemnity remains theirs. We carry product-quality risk only.";

/**
 * Banned marketing verbs (08_guardrails.md). Must not appear on any customer-
 * facing surface. "verify" is excluded from the scan: it is the product name
 * and is permitted in internal/reviewer language ("review" / "read" / "check").
 */
export const BANNED_VERBS: readonly string[] = [
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

/** Banned marketing nouns (08_guardrails.md). */
export const BANNED_NOUNS: readonly string[] = [
  "certifier",
  "approver",
  "regulator",
  "expert",
  "authority",
  "opinion",
];

/** Permitted verbs (08_guardrails.md) — the sanctioned vocabulary. */
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

export interface BannedTermHit {
  term: string;
  index: number;
}

/**
 * Scan text for banned terms (whole-word, case-insensitive). Used by the
 * pre-release validator to block any output that uses banned marketing
 * language, per 08_guardrails.md § "What violates these guardrails".
 *
 * @param text - The customer-facing text to scan.
 * @param terms - Term list to check (defaults to verbs + nouns).
 * @returns Every hit found, in order; empty array means the text is clean.
 */
export function findBannedTerms(
  text: string,
  terms: readonly string[] = [...BANNED_VERBS, ...BANNED_NOUNS],
): BannedTermHit[] {
  const hits: BannedTermHit[] = [];
  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "gi");
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      hits.push({ term, index: match.index });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}
