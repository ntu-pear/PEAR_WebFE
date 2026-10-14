import { opsLoggerAPI } from "../apiConfig";
import { mergeTrace } from "@/lib/opsLogs/formatOpsLog";

export type OpsLogKind = "errors" | "requests" | "auth";
export type OpsType = "error" | "request" | "auth";

export interface OpsLog {
  timestamp: string;
  ops_type: OpsType;
  message: string;
  level?: string | null;
  service?: string | null;
  environment?: string | null;
  logger?: string | null;
  request_id?: string | null;
  user_id?: string | null;
  method?: string | null;
  path?: string | null;
  query?: string | null;
  status?: number | null;
  duration_ms?: number | null;
  event?: string | null;
  reason?: string | null;
  exception_type?: string | null;
  stack_trace?: string | null;
}

export interface OpsLogsList {
  data: OpsLog[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface OpsLogFilters {
  service?: string | null;
  level?: string | null;
  requestId?: string | null;
  userId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  sensitive?: boolean;
}

export type OpsLogsResult = { status: "ok"; data: OpsLogsList } | { status: "unavailable" };

const PATHS: Record<OpsLogKind, string> = {
  errors: "/Errors",
  requests: "/Requests",
  auth: "/Auth",
};

export function buildOpsLogParams(
  kind: OpsLogKind,
  filters: OpsLogFilters,
  pageNo: number,
  pageSize: number
): Record<string, string | number> {
  const params: Record<string, string | number> = { pageNo, pageSize };
  const requestId = filters.requestId?.trim();
  const userId = filters.userId?.trim();
  if (filters.service) params.service = filters.service;
  if (filters.level) params.level = filters.level;
  if (requestId) params.request_id = requestId;
  if (userId) params.user_id = userId;
  if (filters.startDate) params.start_date = `${filters.startDate}T00:00:00`;
  if (filters.endDate) params.end_date = `${filters.endDate}T23:59:59`;
  if (kind === "requests" && filters.sensitive) params.sensitive = "true";
  return params;
}

export async function fetchOpsLogs(
  kind: OpsLogKind,
  filters: OpsLogFilters = {},
  pageNo: number = 0,
  pageSize: number = 20
): Promise<OpsLogsResult> {
  try {
    const response = await opsLoggerAPI.get<OpsLogsList>(PATHS[kind], {
      params: buildOpsLogParams(kind, filters, pageNo, pageSize),
    });
    return { status: "ok", data: response.data };
  } catch (error) {
    const status = (error as { response?: { status?: number } } | null)?.response?.status;
    if (status === 404) return { status: "unavailable" };
    throw error;
  }
}

/** Every error, request and auth line that carries this request ID, oldest first. */
export async function fetchRequestTrace(requestId: string): Promise<OpsLog[]> {
  const kinds: OpsLogKind[] = ["errors", "requests", "auth"];
  const results = await Promise.all(kinds.map((kind) => fetchOpsLogs(kind, { requestId }, 0, 100)));
  return mergeTrace(results.map((result) => (result.status === "ok" ? result.data.data : [])));
}
