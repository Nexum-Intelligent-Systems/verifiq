export type DisciplineUploadProgress = {
  discipline: string;
  scanStatus: string;
  classificationStatus?: string;
  fileCount: number;
  filesClassified?: number;
  filesScanned?: number;
  findingsCount: number;
  currentActivity?: string;
  currentFileName?: string;
};

export type PipelineProgress = {
  intake: number;
  classify: number;
  review: number;
  overall: number;
};

export function disciplineProgressPct(du: DisciplineUploadProgress): number {
  if (du.scanStatus === "completed") return 100;
  if (du.fileCount === 0) return 0;

  const classifyPct =
    du.classificationStatus === "classified"
      ? 100
      : Math.round(((du.filesClassified ?? 0) / du.fileCount) * 100);

  const scanPct =
    du.scanStatus === "completed"
      ? 100
      : Math.round(((du.filesScanned ?? 0) / du.fileCount) * 100);

  if (du.scanStatus === "scanning" || du.scanStatus === "queued") {
    return Math.min(99, Math.round(35 + classifyPct * 0.15 + scanPct * 0.5));
  }

  if (du.classificationStatus === "classified") {
    return Math.min(40, 30 + classifyPct * 0.1);
  }

  return Math.min(30, Math.round(classifyPct * 0.3));
}

export function disciplineProgressLabel(du: DisciplineUploadProgress): string {
  if (du.scanStatus === "completed") return "Complete";
  if (du.currentActivity && du.currentFileName) {
    return `${du.currentActivity} · ${du.currentFileName}`;
  }
  if (du.currentActivity) return du.currentActivity;
  if (du.scanStatus === "scanning") {
    return `Scanning ${du.filesScanned ?? 0} / ${du.fileCount}`;
  }
  if (du.scanStatus === "queued") return "Queued for scan";
  if (du.classificationStatus === "classified") return "Ready to scan";
  if (du.fileCount > 0 && du.classificationStatus === "pending") {
    return `Classifying ${du.filesClassified ?? 0} / ${du.fileCount}`;
  }
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
