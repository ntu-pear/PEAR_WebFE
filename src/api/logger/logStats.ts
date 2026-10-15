import { opsLoggerAPI } from "../apiConfig";
import type { LogFlagCode, LogFlagSeverity } from "@/types/logFlags";

export const LOG_STATS_WINDOWS = ["24h", "7d", "30d"] as const;
export type LogStatsWindow = (typeof LOG_STATS_WINDOWS)[number];

export type LogLinkHint = "errors" | "requests" | "auth" | "sensitive" | "patient" | "activity" | "system";

/** All timestamps are ISO 8601 UTC (bucket start); format them in Asia/Singapore for display. */
export interface LogStatsTotals {
  requests: number;
  errors: number;
  failed_logins: number;
  sensitive_access: number;
  audit_changes: number;
  flagged: number;
}

export interface TrafficPoint {
  t: string;
  service: string;
  requests: number;
  errors: number;
}

export interface TopEndpoint {
  path: string;
  count: number;
  p95_ms: number | null;
}

export interface StatusMix {
  "2xx": number;
  "3xx": number;
  "4xx": number;
  "5xx": number;
}

export interface TopAccount {
  user_id: string;
  name: string | null;
  count: number;
}

export interface LogStatsRecentFlag {
  time: string;
  code: Extract<LogFlagCode, "failed_login_burst" | "bulk_delete" | "mass_access" | "error_spike">;
  severity: LogFlagSeverity;
  reason: string;
  service: string | null;
  link_hint: LogLinkHint;
}

export interface LogStats {
  window: LogStatsWindow;
  totals: LogStatsTotals;
  traffic: TrafficPoint[];
  top_endpoints: TopEndpoint[];
  status_mix: StatusMix;
  auth: {
    failed_logins_over_time: { t: string; count: number }[];
    top_accounts: TopAccount[];
  };
  audit: {
    changes_per_day: { t: string; action: string; count: number }[];
    top_tables: { table: string; count: number }[];
    top_actors: TopAccount[];
  };
  recent_flags: LogStatsRecentFlag[];
}

/** Admin only. Errors (including 503 when the log store is down) propagate to the caller. */
export async function fetchLogStats(window: LogStatsWindow = "24h"): Promise<LogStats> {
  const response = await opsLoggerAPI.get<LogStats>("/Stats", { params: { window } });
  return response.data;
}