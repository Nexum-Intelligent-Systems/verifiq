export type DisciplineUploadProgress = {
  discipline: string;
  scanStatus: string;
  classificationStatus?: string;
  fileCount: number;
  findingsCount: number;
};

export type PipelineProgress = {
  intake: number;
  classify: number;
  review: number;
  overall: number;
};

export function disciplineProgressPct(du: DisciplineUploadProgress): number {
  if (du.scanStatus === "completed") return 100;
  if (du.scanStatus === "scanning") return 78;
  if (du.scanStatus === "queued") return 58;
  if (du.classificationStatus === "classified") return 42;
  if (du.fileCount > 0) return 22;
  return 8;
}

export function disciplineProgressLabel(du: DisciplineUploadProgress): string {
  if (du.scanStatus === "completed") return "Complete";
  if (du.scanStatus === "scanning") return "Scanning";
  if (du.scanStatus === "queued") return "Queued";
  if (du.classificationStatus === "classified") return "Ready to scan";
  if (du.fileCount > 0 && du.classificationStatus === "pending") return "Classifying";
  if (du.fileCount > 0) return "Extracted";
  return "Waiting";
}

export function computePipelineProgress(
  phase: string,
  uploads: DisciplineUploadProgress[],
  headerProgressPct: number,
): PipelineProgress {
  if (uploads.length === 0) {
    return { intake: 0, classify: 0, review: 0, overall: 0 };
  }

  const withFiles = uploads.filter((u) => u.fileCount > 0).length;
  const classified = uploads.filter((u) => u.classificationStatus === "classified").length;
  const scanDone = uploads.filter((u) => u.scanStatus === "completed").length;
  const scanActive = uploads.filter(
    (u) => u.scanStatus === "scanning" || u.scanStatus === "queued",
  ).length;

  const intake = Math.round((withFiles / uploads.length) * 100);
  const classify = Math.round((classified / uploads.length) * 100);
  const review =
    scanDone === uploads.length
      ? 100
      : Math.round(((scanDone + scanActive * 0.5) / uploads.length) * 100);

  let overall = headerProgressPct;
  if (phase === "confirm_classify") {
    overall = Math.max(overall, 35 + classify * 0.15);
  }
  if (phase === "scanning") {
    overall = Math.max(overall, 50 + review * 0.45);
  }
  if (scanDone === uploads.length && uploads.length > 0) {
    overall = Math.max(overall, 95);
  }

  return {
    intake,
    classify,
    review,
    overall: Math.min(99, Math.round(overall)),
  };
}
