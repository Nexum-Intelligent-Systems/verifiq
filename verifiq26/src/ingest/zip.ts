/**
 * VerifIQ — ZIP entry helpers (Phase 6 web-upload).
 *
 * Pure path logic shared by the browser (`/upload` expands a dropped .zip into
 * individual files before upload) and the Node ingest action (a raw .zip that
 * reaches the server is expanded there too). The actual inflate is done by
 * `fflate` at each call site; this module only decides which archive entries are
 * worth keeping and what to call them — so it stays dependency-free and unit
 * testable.
 *
 * Version: 0.8.0-phase6
 */

import { fileTextKind } from "./extract";

/** Is a filename a ZIP archive (by extension)? */
export function isZipName(filename: string): boolean {
  return /\.zip$/i.test(filename.trim());
}

/** The bare filename of a zip entry path (drops any folder components). */
export function zipEntryBasename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

/**
 * Should a zip entry be pulled out and reviewed? Keep readable documents (PDF /
 * text); drop folders, OS junk (`__MACOSX/`, `.DS_Store`, dotfiles), nested
 * archives, and unsupported binaries (images, etc.). Used to filter the entry
 * map `fflate` returns.
 */
export function isReviewableZipPath(path: string): boolean {
  if (!path || path.endsWith("/")) return false; // directory marker
  if (path.startsWith("__MACOSX/") || path.includes("/__MACOSX/")) return false;
  const name = zipEntryBasename(path);
  if (!name || name.startsWith(".")) return false; // .DS_Store, dotfiles
  if (isZipName(name)) return false; // don't recurse into nested zips
  return fileTextKind(name) !== "unsupported";
}
