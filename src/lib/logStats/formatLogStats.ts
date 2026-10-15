import type { LogLinkHint, LogStats, LogStatsWindow, TrafficPoint } from "@/api/logger/logStats";

const SGT = "Asia/Singapore";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
// Singapore has no DST: local midnight is always 16:00Z of the previous day.
const SGT_OFFSET_MS = 8 * HOUR_MS;

export const WINDOW_LABELS: Record<LogStatsWindow, string> = {
  "24h": "last 24 hours",
  "7d": "last 7 days",
  "30d": "last 30 days",
};

const numberFormat = new Intl.NumberFormat("en-SG");
export const formatCount = (value: number) => numberFormat.format(value);

const hourFormat = new Intl.DateTimeFormat("en-GB", { timeZone: SGT, hour: "2-digit", minute: "2-digit", hour12: false });
const dayFormat = new Intl.DateTimeFormat("en-GB", { timeZone: SGT, day: "numeric", month: "short" });
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: SGT,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const isoDateFormat = new Intl.DateTimeFormat("en-CA", { timeZone: SGT, year: "numeric", month: "2-digit", day: "2-digit" });

const toDate = (value: string | number) => new Date(value);
const valid = (date: Date) => !Number.isNaN(date.getTime());

/** Axis label for a bucket start: "14:00" for hourly windows, "14 Oct" for daily ones (SGT). */
export function formatBucket(t: string | number, window: LogStatsWindow): string {
  const date = toDate(t);
  if (!valid(date)) return String(t);
  return window === "24h" ? hourFormat.format(date) : dayFormat.format(date);
}

export function formatDateTime(value: string): string {
  const date = toDate(value);
  return valid(date) ? `${dateTimeFormat.format(date)} SGT` : value;
}

export function formatClock(date: Date): string {
  return `${hourFormat.format(date)} SGT`;
}

/** YYYY-MM-DD of the instant in Singapore, used to open a log page on that day. */
export function sgtDate(value: string): string | null {
  const date = toDate(value);
  return valid(date) ? isoDateFormat.format(date) : null;
}

/** Every bucket start the window should show, so quiet hours/days read as zero instead of vanishing. */
export function bucketStarts(window: LogStatsWindow, now: Date = new Date()): number[] {
  const nowMs = now.getTime();
  if (window === "24h") {
    const current = Math.floor(nowMs / HOUR_MS) * HOUR_MS;
    return Array.from({ length: 25 }, (_, i) => current - (24 - i) * HOUR_MS);
  }
  const days = window === "7d" ? 7 : 30;
  const today = Math.floor((nowMs + SGT_OFFSET_MS) / DAY_MS) * DAY_MS - SGT_OFFSET_MS;
  return Array.from({ length: days + 1 }, (_, i) => today - (days - i) * DAY_MS);
}

function mergeBuckets(window: LogStatsWindow, times: string[], now?: Date): number[] {
  const set = new Set(bucketStarts(window, now));
  times.forEach((t) => {
    const ms = toDate(t).getTime();
    if (!Number.isNaN(ms)) set.add(ms);
  });
  return Array.from(set).sort((a, b) => a - b);
}

export const OTHER_SERVICE = "other";
export const MAX_SERVICE_SERIES = 4;

export interface TrafficSeries {
  services: string[];
  rows: Array<Record<string, number>>;
  totalRequests: number;
  totalErrors: number;
  peak: { t: number; requests: number } | null;
}

/** Pivot (bucket, service) rows into one row per bucket; the busiest services keep their own series. */
export function buildTraffic(traffic: TrafficPoint[], window: LogStatsWindow, now?: Date): TrafficSeries {
  const perService = new Map<string, number>();
  traffic.forEach((p) => perService.set(p.service, (perService.get(p.service) ?? 0) + p.requests));
  const ranked = Array.from(perService.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([service]) => service);
  // Four chart hues for services; the fifth is reserved for the error line in dark mode.
  const named = ranked.slice(0, MAX_SERVICE_SERIES);
  const services = ranked.length > named.length ? [...named, OTHER_SERVICE] : named;

  const empty = () => Object.fromEntries([...services.map((s) => [s, 0]), ["errors", 0], ["total", 0]]);
  const byTime = new Map<number, Record<string, number>>();
  mergeBuckets(window, traffic.map((p) => p.t), now).forEach((t) => byTime.set(t, { t, ...empty() }));

  let totalRequests = 0;
  let totalErrors = 0;
  traffic.forEach((p) => {
    const row = byTime.get(toDate(p.t).getTime());
    if (!row) return;
    const key = named.includes(p.service) ? p.service : OTHER_SERVICE;
    row[key] += p.requests;
    row.errors += p.errors;
    row.total += p.requests;
    totalRequests += p.requests;
    totalErrors += p.errors;
  });

  const rows = Array.from(byTime.values());
  const peakRow = rows.reduce<Record<string, number> | null>((best, row) => (!best || row.total > best.total ? row : best), null);
  return {
    services,
    rows,
    totalRequests,
    totalErrors,
    peak: peakRow && peakRow.total > 0 ? { t: peakRow.t, requests: peakRow.total } : null,
  };
}

export function buildCountSeries(points: { t: string; count: number }[], window: LogStatsWindow, now?: Date) {
  const byTime = new Map<number, { t: number; count: number }>();
  mergeBuckets(window, points.map((p) => p.t), now).forEach((t) => byTime.set(t, { t, count: 0 }));
  points.forEach((p) => {
    const row = byTime.get(toDate(p.t).getTime());
    if (row) row.count += p.count;
  });
  return Array.from(byTime.values());
}

export function buildAuditSeries(points: LogStats["audit"]["changes_per_day"], window: LogStatsWindow, now?: Date) {
  const actions = Array.from(new Set(points.map((p) => p.action))).sort();
  // Audit changes are bucketed per SGT day whatever the window; a 24h window only spans the days it touches.
  const times = points.map((p) => p.t);
  const starts =
    window === "24h"
      ? Array.from(new Set(times.map((t) => toDate(t).getTime()).filter((ms) => !Number.isNaN(ms)))).sort((a, b) => a - b)
      : mergeBuckets(window, times, now);
  const byTime = new Map<number, Record<string, number>>();
  starts.forEach((t) => byTime.set(t, { t, ...Object.fromEntries(actions.map((a) => [a, 0])) }));
  points.forEach((p) => {
    const row = byTime.get(toDate(p.t).getTime());
    if (row) row[p.action] += p.count;
  });
  return { actions, rows: Array.from(byTime.values()) };
}

export const LINK_LABELS: Record<LogLinkHint, string> = {
  errors: "Error logs",
  requests: "Request logs",
  auth: "Auth event logs",
  sensitive: "Sensitive access",
  patient: "Patient logs",
  activity: "Activity logs",
  system: "System config logs",
};

/**
 * Admin page that holds the flagged lines, opened on the flag's SGT day where the page supports it.
 * Patient and Activity logs are supervisor pages, so there is nothing an admin can open for them.
 */
export function flagLink(hint: LogLinkHint, time: string): string | null {
  switch (hint) {
    case "errors":
    case "requests":
    case "auth":
    case "sensitive": {
      const day = sgtDate(time);
      return `/admin/ops-logs/${hint}${day ? `?date=${day}` : ""}`;
    }
    case "system":
      return "/admin/system-config-logs";
    default:
      return null;
  }
}

export function isEmptyStats(stats: LogStats): boolean {
  return Object.values(stats.totals).every((value) => value === 0) && stats.traffic.length === 0;
}
