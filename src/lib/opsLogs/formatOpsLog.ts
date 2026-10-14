import type { OpsLog } from "@/api/logger/opsLogs";

export const SERVICE_OPTIONS = [
  { value: "all", label: "All services" },
  { value: "patient", label: "Patient" },
  { value: "activity", label: "Activity" },
  { value: "user", label: "User" },
  { value: "scheduler", label: "Scheduler" },
];

export const LEVEL_OPTIONS = [
  { value: "all", label: "All levels" },
  { value: "WARNING", label: "Warning" },
  { value: "ERROR", label: "Error" },
  { value: "CRITICAL", label: "Critical" },
];

const time = (log: OpsLog): number => {
  const value = Date.parse(log.timestamp);
  return Number.isNaN(value) ? 0 : value;
};

/** All lines for one request ID, oldest first. */
export function mergeTrace(lists: OpsLog[][]): OpsLog[] {
  return ([] as OpsLog[]).concat(...lists).sort((a, b) => time(a) - time(b));
}

/** One-line summary for the table's Summary column. */
export function describeOpsLog(log: OpsLog): string {
  if (log.ops_type === "request") {
    const query = log.query ? `?${log.query}` : "";
    return `${log.method ?? ""} ${log.path ?? ""}${query}`.trim() || log.message;
  }
  if (log.ops_type === "auth") {
    const event = log.event ?? "auth event";
    return log.reason ? `${event}: ${log.reason}` : event;
  }
  return log.exception_type ? `${log.exception_type}: ${log.message}` : log.message;
}

export function statusBadgeClass(status?: number | null): string {
  if (status === null || status === undefined) return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  if (status >= 500) return "bg-red-100 text-red-800 hover:bg-red-100";
  if (status >= 400) return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  if (status >= 300) return "bg-blue-100 text-blue-800 hover:bg-blue-100";
  return "bg-green-100 text-green-800 hover:bg-green-100";
}

export function levelBadgeClass(level?: string | null): string {
  const value = (level ?? "").toUpperCase();
  if (value === "ERROR" || value === "CRITICAL") return "bg-red-100 text-red-800 hover:bg-red-100";
  if (value === "WARNING") return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  return "bg-gray-100 text-gray-800 hover:bg-gray-100";
}
