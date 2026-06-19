/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_classify from "../actions/classify.js";
import type * as actions_coordinate from "../actions/coordinate.js";
import type * as actions_council from "../actions/council.js";
import type * as actions_scan from "../actions/scan.js";
import type * as actions_uploads from "../actions/uploads.js";
import type * as auth from "../auth.js";
import type * as checks from "../checks.js";
import type * as devAuth from "../devAuth.js";
import type * as e2eDrawingTest from "../e2eDrawingTest.js";
import type * as files from "../files.js";
import type * as findings from "../findings.js";
import type * as http from "../http.js";
import type * as invitations from "../invitations.js";
import type * as lib_anthropicClient from "../lib/anthropicClient.js";
import type * as lib_corpus from "../lib/corpus.js";
import type * as lib_disciplineInfer from "../lib/disciplineInfer.js";
import type * as lib_extract from "../lib/extract.js";
import type * as lib_requireAuth from "../lib/requireAuth.js";
import type * as lib_selfCheck from "../lib/selfCheck.js";
import type * as lib_sourceQuote from "../lib/sourceQuote.js";
import type * as pipeline from "../pipeline.js";
import type * as projects from "../projects.js";
import type * as scanState from "../scanState.js";
import type * as seed from "../seed.js";
import type * as staffUploads from "../staffUploads.js";
import type * as storage from "../storage.js";
import type * as uploads from "../uploads.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/classify": typeof actions_classify;
  "actions/coordinate": typeof actions_coordinate;
  "actions/council": typeof actions_council;
  "actions/scan": typeof actions_scan;
  "actions/uploads": typeof actions_uploads;
  auth: typeof auth;
  checks: typeof checks;
  devAuth: typeof devAuth;
  e2eDrawingTest: typeof e2eDrawingTest;
  files: typeof files;
  findings: typeof findings;
  http: typeof http;
  invitations: typeof invitations;
  "lib/anthropicClient": typeof lib_anthropicClient;
  "lib/corpus": typeof lib_corpus;
  "lib/disciplineInfer": typeof lib_disciplineInfer;
  "lib/extract": typeof lib_extract;
  "lib/requireAuth": typeof lib_requireAuth;
  "lib/selfCheck": typeof lib_selfCheck;
  "lib/sourceQuote": typeof lib_sourceQuote;
  pipeline: typeof pipeline;
  projects: typeof projects;
  scanState: typeof scanState;
  seed: typeof seed;
  staffUploads: typeof staffUploads;
  storage: typeof storage;
  uploads: typeof uploads;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
