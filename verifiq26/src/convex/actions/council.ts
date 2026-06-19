"use node";

/**
 * VerifIQ — Council Pipeline
 * Stages 5–7: peer challenge → adjudication → council chair report.
 */

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { callClaudeWithCache } from "../lib/anthropicClient";

const PEER_CHALLENGE_PAIRS: Record<string, string[]> = {
  arch: ["fire", "mech", "qs"],
  cs: ["arch", "qs"],
  mech: ["fire", "arch", "elec"],
  elec: ["fire", "mech", "arch"],
  fire: ["arch", "mech", "elec"],
  qs: ["arch", "mech", "cs"],
  bcar: ["arch", "cs"],
  cross: ["arch", "fire", "qs"],
};

const PEER_SYSTEM = `You are a Peer Challenge Agent in the VerifIQ Pre-Build Compliance Council.
Challenge findings from the originating discipline. Return JSON array only:
[{"findingId":"A-001","decision":"Retained|Amended|Merged|Downgraded|Escalated|Deleted","reason":"...","revisedRisk":"CRITICAL|HIGH|MEDIUM|LOW"}]
Rules: only challenge if you have a reason; default Retained if valid; Deleted if no evidence or wrong discipline.`;

const ADJUDICATOR_SYSTEM = `You are the Adjudicator Agent for the VerifIQ Pre-Build Compliance Council.
Merge peer challenges with original findings. Return JSON array:
[{"findingId":"A-001","councilDecision":"Retained|Amended|Merged|Downgraded|Escalated|Deleted","rationale":"...","severity":"CRITICAL|HIGH|MEDIUM|LOW"}]
Remove vague findings. One owner. Evidence required.`;

const CHAIR_SYSTEM = `You are the Council Chair of the VerifIQ Pre-Build Compliance Council.
Return JSON only:
{
  "buildReadinessRating": "Green|Amber|Red|Grey",
  "executiveDecision": "Proceed|Proceed with conditions|Pause before build|Insufficient information",
  "summary": "2-3 paragraphs plain English",
  "reportMarkdown": "Full markdown report sections 1-13",
  "criticalBlockers": 0,
  "highRiskConditions": 0
}
Irish pre-build compliance context. Sober tone. No generic advice.`;

function parseDecisionRows(raw: { content?: Array<{ type: string; text?: string }> }): Array<{
  findingId?: string;
  decision?: string;
  councilDecision?: string;
  reason?: string;
  rationale?: string;
  revisedRisk?: string;
  severity?: string;
}> {
  const text =
    raw?.content
      ?.filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("") ?? "";
  try {
    const match = text.match(/\[[\s\S]+\]/);
    if (match) return JSON.parse(match[0]);
  } catch {
    /* fall through */
  }
  return [];
}

export const startCouncilPipeline = internalAction({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(internal.projects.get, { id: args.projectId });
    if (!project || project.councilPhase === "complete") return;

    await ctx.runMutation(internal.projects.setCouncilPhase, {
      projectId: args.projectId,
      councilPhase: "peer_challenge",
    });

    const jobId = await ctx.runMutation(internal.pipeline.createJob, {
      projectId: args.projectId,
      jobType: "peer_challenge",
    });

    await ctx.runMutation(internal.pipeline.logEvent, {
      projectId: args.projectId,
      stage: "peer_challenge",
      message: "Council peer challenge starting",
      detail: "Disciplines challenge each other's findings before adjudication",
    });

    await ctx.scheduler.runAfter(0, internal.actions.council.runPeerChallenge, {
      projectId: args.projectId,
      jobId,
    });
  },
});

export const runPeerChallenge = internalAction({
  args: {
    projectId: v.id("projects"),
    jobId: v.id("pipelineJobs"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.pipeline.markJobRunning, { jobId: args.jobId });

    const findings = await ctx.runQuery(internal.findings.listByProjectAllStatuses, {
      projectId: args.projectId,
    });

    if (findings.length === 0) {
      await finishPeerChallenge(ctx, args);
      return;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      await runDemoPeerChallenge(ctx, args, findings);
      return;
    }

    let challenged = 0;
    for (const [originDisc, challengers] of Object.entries(PEER_CHALLENGE_PAIRS)) {
      const originFindings = findings.filter((f) => f.discipline === originDisc);
      if (originFindings.length === 0) continue;

      for (const challenger of challengers) {
        const brief = originFindings
          .slice(0, 30)
          .map(
            (f) =>
              `[${f.findingId}|${f.severity}] ${f.oneSentenceIssue} | basis: ${f.regulatoryBasis}`,
          )
          .join("\n");

        const response = await callClaudeWithCache({
          model: "claude-sonnet-4-6-20250115",
          systemPrompt: PEER_SYSTEM,
          userPrompt: `You are the ${challenger.toUpperCase()} discipline challenging ${originDisc.toUpperCase()} findings:\n\n${brief}`,
          maxTokens: 3_000,
          cacheControl: { type: "ephemeral" },
        });

        const rows = parseDecisionRows(response.raw);

        for (const row of rows) {
          if (!row.findingId || !row.decision) continue;
          await ctx.runMutation(internal.findings.recordPeerChallenge, {
            projectId: args.projectId,
            findingId: row.findingId,
            challengerDiscipline: challenger,
            decision: row.decision,
            reason: row.reason ?? "Peer challenge",
            revisedRisk: row.revisedRisk,
          });
          challenged++;
        }

        await ctx.runMutation(internal.pipeline.logEvent, {
          projectId: args.projectId,
          stage: "peer_challenge",
          discipline: challenger,
          message: `${challenger.toUpperCase()} challenged ${originDisc.toUpperCase()} findings`,
          detail: `${originFindings.length} findings reviewed`,
        });
      }
    }

    await ctx.runMutation(internal.pipeline.logEvent, {
      projectId: args.projectId,
      stage: "peer_challenge",
      message: `Peer challenge complete — ${challenged} decisions recorded`,
      progressPct: 100,
    });

    await finishPeerChallenge(ctx, args);
  },
});

async function finishPeerChallenge(
  ctx: { runMutation: Function; scheduler: { runAfter: Function } },
  args: { projectId: string; jobId: string },
) {
  await ctx.runMutation(internal.pipeline.markJobSucceeded, { jobId: args.jobId });

  await ctx.runMutation(internal.projects.setCouncilPhase, {
    projectId: args.projectId,
    councilPhase: "adjudicate",
  });

  const jobId = await ctx.runMutation(internal.pipeline.createJob, {
    projectId: args.projectId,
    jobType: "adjudicate",
  });

  await ctx.scheduler.runAfter(0, internal.actions.council.runAdjudication, {
    projectId: args.projectId,
    jobId,
  });
}

export const runAdjudication = internalAction({
  args: {
    projectId: v.id("projects"),
    jobId: v.id("pipelineJobs"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.pipeline.markJobRunning, { jobId: args.jobId });

    const findings = await ctx.runQuery(internal.findings.listByProjectAllStatuses, {
      projectId: args.projectId,
    });
    const challenges = await ctx.runQuery(internal.findings.listPeerChallenges, {
      projectId: args.projectId,
    });

    await ctx.runMutation(internal.pipeline.logEvent, {
      projectId: args.projectId,
      stage: "adjudicate",
      message: "Adjudicator consolidating register",
      detail: `${findings.length} findings · ${challenges.length} peer challenges`,
    });

    if (!process.env.ANTHROPIC_API_KEY) {
      await runDemoAdjudication(ctx, args, findings);
      return;
    }

    const findingsBrief = findings
      .slice(0, 80)
      .map((f) => `[${f.findingId}|${f.severity}|${f.discipline}] ${f.oneSentenceIssue}`)
      .join("\n");

    const challengesBrief = challenges
      .map((c) => `[${c.findingId}] ${c.challengerDiscipline}: ${c.decision} — ${c.reason}`)
      .join("\n");

    const response = await callClaudeWithCache({
      model: "claude-sonnet-4-6-20250115",
      systemPrompt: ADJUDICATOR_SYSTEM,
      userPrompt: `ORIGINAL FINDINGS:\n${findingsBrief}\n\nPEER CHALLENGES:\n${challengesBrief}`,
      maxTokens: 6_000,
      cacheControl: { type: "ephemeral" },
    });

    const rows = parseDecisionRows(response.raw);

    let retained = 0;
    let deleted = 0;
    for (const row of rows) {
      const decision = row.councilDecision ?? row.decision;
      if (!row.findingId || !decision) continue;
      await ctx.runMutation(internal.findings.applyAdjudication, {
        projectId: args.projectId,
        findingId: row.findingId,
        councilDecision: decision,
        rationale: row.rationale ?? row.reason ?? "",
        severity: row.revisedRisk ?? row.severity,
      });
      if (row.councilDecision === "Deleted" || decision === "Deleted") deleted++;
      else retained++;
    }

    await ctx.runMutation(internal.pipeline.logEvent, {
      projectId: args.projectId,
      stage: "adjudicate",
      message: `Adjudication complete — ${retained} retained, ${deleted} removed`,
      progressPct: 100,
    });

    await finishAdjudication(ctx, args);
  },
});

async function finishAdjudication(
  ctx: { runMutation: Function; scheduler: { runAfter: Function } },
  args: { projectId: string; jobId: string },
) {
  await ctx.runMutation(internal.pipeline.markJobSucceeded, { jobId: args.jobId });

  await ctx.runMutation(internal.projects.setCouncilPhase, {
    projectId: args.projectId,
    councilPhase: "chair",
  });

  const jobId = await ctx.runMutation(internal.pipeline.createJob, {
    projectId: args.projectId,
    jobType: "council_chair",
  });

  await ctx.scheduler.runAfter(0, internal.actions.council.runCouncilChair, {
    projectId: args.projectId,
    jobId,
  });
}

export const runCouncilChair = internalAction({
  args: {
    projectId: v.id("projects"),
    jobId: v.id("pipelineJobs"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.pipeline.markJobRunning, { jobId: args.jobId });

    const project = await ctx.runQuery(internal.projects.get, { id: args.projectId });
    const findings = await ctx.runQuery(internal.findings.listAdjudicated, {
      projectId: args.projectId,
    });

    await ctx.runMutation(internal.pipeline.logEvent, {
      projectId: args.projectId,
      stage: "council_chair",
      message: "Council Chair issuing Build Readiness position",
      detail: `${findings.length} adjudicated findings`,
    });

    if (!process.env.ANTHROPIC_API_KEY) {
      await runDemoChair(ctx, args, project, findings);
      return;
    }

    const register = findings
      .map(
        (f) =>
          `[${f.findingId}|${f.severity}|${f.councilDecision ?? "Retained"}] ${f.oneSentenceIssue}`,
      )
      .join("\n");

    const response = await callClaudeWithCache({
      model: "claude-sonnet-4-6-20250115",
      systemPrompt: CHAIR_SYSTEM,
      userPrompt: `Project: ${project?.name}\nContract: ${project?.contractType ?? "PW-CF5"}\n\nADJUDICATED REGISTER:\n${register}`,
      maxTokens: 8_000,
      cacheControl: { type: "ephemeral" },
    });

    const text = response.raw?.content?.find((c: { type: string }) => c.type === "text")?.text ?? "";
    const parsed = parseChairReport(text);

    const reportId = await ctx.runMutation(internal.findings.saveCouncilReport, {
      projectId: args.projectId,
      ...parsed,
      corpusVersion: "v.2026.06",
    });

    await ctx.runMutation(internal.projects.setCouncilComplete, {
      projectId: args.projectId,
      councilReportId: reportId,
    });

    await ctx.runMutation(internal.pipeline.logEvent, {
      projectId: args.projectId,
      stage: "reviewer_queue",
      message: `Council report ready — ${parsed.executiveDecision}`,
      detail: `Rating: ${parsed.buildReadinessRating}`,
      progressPct: 100,
    });

    await ctx.runMutation(internal.pipeline.markJobSucceeded, { jobId: args.jobId });
    await ctx.runMutation(internal.scanState.syncFromUpload, { projectId: args.projectId });
  },
});

function parseChairReport(text: string): {
  buildReadinessRating: "Green" | "Amber" | "Red" | "Grey";
  executiveDecision:
    | "Proceed"
    | "Proceed with conditions"
    | "Pause before build"
    | "Insufficient information";
  summary: string;
  reportMarkdown: string;
  criticalBlockers: number;
  highRiskConditions: number;
} {
  try {
    const match = text.match(/\{[\s\S]+\}/);
    if (match) {
      const p = JSON.parse(match[0]);
      return {
        buildReadinessRating: p.buildReadinessRating ?? "Amber",
        executiveDecision: p.executiveDecision ?? "Proceed with conditions",
        summary: p.summary ?? "Council review complete.",
        reportMarkdown: p.reportMarkdown ?? text,
        criticalBlockers: p.criticalBlockers ?? 0,
        highRiskConditions: p.highRiskConditions ?? 0,
      };
    }
  } catch {
    /* fall through */
  }
  return {
    buildReadinessRating: "Amber",
    executiveDecision: "Proceed with conditions",
    summary: "Council review complete. See adjudicated register for actions.",
    reportMarkdown: text,
    criticalBlockers: 0,
    highRiskConditions: 0,
  };
}

async function runDemoPeerChallenge(ctx: any, args: any, findings: any[]) {
  for (const f of findings.slice(0, 12)) {
    await ctx.runMutation(internal.findings.recordPeerChallenge, {
      projectId: args.projectId,
      findingId: f.findingId,
      challengerDiscipline: "fire",
      decision: "Retained",
      reason: "Demo peer challenge — set ANTHROPIC_API_KEY for live council",
    });
  }
  await ctx.runMutation(internal.pipeline.logEvent, {
    projectId: args.projectId,
    stage: "peer_challenge",
    message: "Demo peer challenge complete",
    progressPct: 100,
  });
  await finishPeerChallenge(ctx, args);
}

async function runDemoAdjudication(ctx: any, args: any, findings: any[]) {
  for (const f of findings) {
    await ctx.runMutation(internal.findings.applyAdjudication, {
      projectId: args.projectId,
      findingId: f.findingId,
      councilDecision: "Retained",
      rationale: "Demo adjudication",
    });
  }
  await ctx.runMutation(internal.pipeline.logEvent, {
    projectId: args.projectId,
    stage: "adjudicate",
    message: "Demo adjudication complete",
    progressPct: 100,
  });
  await finishAdjudication(ctx, args);
}

async function runDemoChair(ctx: any, args: any, project: any, findings: any[]) {
  const critical = findings.filter((f) => f.severity === "CRITICAL").length;
  const high = findings.filter((f) => f.severity === "HIGH").length;
  const reportId = await ctx.runMutation(internal.findings.saveCouncilReport, {
    projectId: args.projectId,
    buildReadinessRating: critical > 0 ? "Red" : high > 2 ? "Amber" : "Green",
    executiveDecision: critical > 0 ? "Pause before build" : "Proceed with conditions",
    summary: `Demo council report for ${project?.name}. ${findings.length} adjudicated findings.`,
    reportMarkdown: `# VERIFIQ PRE-BUILD COMPLIANCE COUNCIL REPORT\n\nProject: ${project?.name}\n\nDemo mode — live chair report requires ANTHROPIC_API_KEY.`,
    criticalBlockers: critical,
    highRiskConditions: high,
    corpusVersion: "local-demo",
  });
  await ctx.runMutation(internal.projects.setCouncilComplete, {
    projectId: args.projectId,
    councilReportId: reportId,
  });
  await ctx.runMutation(internal.pipeline.markJobSucceeded, { jobId: args.jobId });
  await ctx.runMutation(internal.scanState.syncFromUpload, { projectId: args.projectId });
}
