/**
 * VerifIQ — logger abstraction (Phase 1)
 *
 * Purpose: The single sanctioned logging surface. No other committed file may
 *   call `console.*` directly (style requirement in the Phase 1 brief). Inside
 *   a Convex function the platform captures stdout/stderr automatically, so the
 *   wrapper delegates to `console` here — and only here.
 *
 * Version: phase1-v0.1
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  [key: string]: unknown;
}

function emit(level: LogLevel, message: string, fields?: LogFields): void {
  const entry = {
    level,
    message,
    ...(fields ?? {}),
    ts: new Date().toISOString(),
  };
  // eslint-disable-next-line no-console -- this module is the only console sink.
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  sink(JSON.stringify(entry));
}

export const logger = {
  debug: (message: string, fields?: LogFields): void => emit("debug", message, fields),
  info: (message: string, fields?: LogFields): void => emit("info", message, fields),
  warn: (message: string, fields?: LogFields): void => emit("warn", message, fields),
  error: (message: string, fields?: LogFields): void => emit("error", message, fields),
};
