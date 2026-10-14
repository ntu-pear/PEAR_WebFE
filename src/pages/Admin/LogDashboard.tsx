import React, { useCallback, useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { ArrowDown, ArrowUpRight, ChartColumn, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FlagBadge } from "@/components/logFlags/FlagBadge";
import { fetchLogStats, LOG_STATS_WINDOWS, LogStats, LogStatsWindow, TopAccount } from "@/api/logger/logStats";
import {
  buildAuditSeries,
  buildCountSeries,
  buildTraffic,
  flagLink,
  formatBucket,
  formatClock,
  formatCount,
  formatDateTime,
  isEmptyStats,
  LINK_LABELS,
  OTHER_SERVICE,
  WINDOW_LABELS,
} from "@/lib/logStats/formatLogStats";
import { cn } from "@/lib/utils";

type LoadState =
  | { status: "loading" }
  | { status: "ok"; stats: LogStats; at: Date }
  | { status: "error"; unavailable: boolean };

const WINDOW_TABS: Record<LogStatsWindow, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days" };

const SERIES_COLORS = [1, 2, 3, 4].map((n) => `hsl(var(--chart-${n}))`);
const OTHER_COLOR = "hsl(var(--muted-foreground) / 0.45)";
// Destructive is too dark to read as a line on the dark card, so dark mode borrows the fifth chart hue.
const ERROR_THEME = { light: "hsl(var(--destructive))", dark: "hsl(var(--chart-5))" };

const STATUS_BANDS: { key: keyof LogStats["status_mix"]; label: string; color: string }[] = [
  { key: "2xx", label: "Success", color: "hsl(var(--chart-2))" },
  { key: "3xx", label: "Redirect", color: "hsl(var(--chart-3))" },
  { key: "4xx", label: "Client error", color: "hsl(var(--chart-4))" },
  { key: "5xx", label: "Server error", color: "var(--status-5xx)" },
];

const statusOf = (error: unknown) => (error as { response?: { status?: number } } | null)?.response?.status;

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

/* ---------- building blocks ---------- */

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} />
);

const Section: React.FC<{
  id?: string;
  title: string;
  summary?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ id, title, summary, className, children }) => {
  const generatedId = useId();
  const headingId = id ?? generatedId;
  return (
    <Card className={cn("flex min-w-0 flex-col", className)} aria-labelledby={headingId} role="region">
      <CardHeader className="space-y-1 p-5 pb-3">
        <CardTitle
          id={headingId}
          className="scroll-mt-24 rounded-sm text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          tabIndex={id ? -1 : undefined}
        >
          {title}
        </CardTitle>
        {summary && <CardDescription>{summary}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 p-5 pt-0">{children}</CardContent>
    </Card>
  );
};

const EmptyNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex h-full min-h-24 items-center justify-center rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
    {children}
  </p>
);

const RankedList: React.FC<{ label: string; items: { key: string; name: React.ReactNode; count: number }[]; empty: string }> = ({
  label,
  items,
  empty,
}) => {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-sm font-medium">{label}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ol className="space-y-1.5">
          {items.map((item) => (
            <li key={item.key} className="relative overflow-hidden rounded-md px-2 py-1.5 text-sm">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 bg-muted"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
              <span className="relative flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">{item.name}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{formatCount(item.count)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const accountItems = (accounts: TopAccount[]) =>
  accounts.map((account) => ({
    key: account.user_id,
    count: account.count,
    name: account.name ? (
      <span title={account.user_id}>{account.name}</span>
    ) : (
      <span className="font-mono text-xs">{account.user_id}</span>
    ),
  }));

const axisProps = { tickLine: false, axisLine: false, tickMargin: 8 } as const;

/* ---------- sections ---------- */

const StatStrip: React.FC<{ stats: LogStats }> = ({ stats }) => {
  const { totals } = stats;
  const errorRate = percent(totals.errors, totals.requests);
  const cells: { label: string; value: number; note?: React.ReactNode; alert?: boolean; href?: string }[] = [
    { label: "Requests", value: totals.requests },
    { label: "Errors", value: totals.errors, note: totals.requests > 0 ? `${errorRate}% of requests` : undefined, alert: totals.errors > 0 },
    { label: "Failed logins", value: totals.failed_logins, alert: totals.failed_logins > 0 },
    { label: "Sensitive access", value: totals.sensitive_access },
    { label: "Audit changes", value: totals.audit_changes },
    { label: "Flagged", value: totals.flagged, alert: totals.flagged > 0, href: "#recent-flags" },
  ];
  return (
    <Card className="overflow-hidden">
      <dl className="grid grid-cols-2 gap-px bg-border md:grid-cols-3 xl:grid-cols-6">
        {cells.map((cell) => {
          const content = (
            <>
              <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {cell.alert && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--status-5xx)]" />}
                {cell.label}
                {cell.href && <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{formatCount(cell.value)}</dd>
              {cell.note && <dd className="mt-0.5 text-xs text-muted-foreground">{cell.note}</dd>}
            </>
          );
          return cell.href ? (
            <a
              key={cell.label}
              href={cell.href}
              onClick={(event) => {
                const target = document.getElementById(cell.href!.slice(1));
                if (!target) return;
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                target.focus({ preventScroll: true });
              }}
              className="group bg-card px-5 py-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              aria-label={`${formatCount(cell.value)} flagged items: view recent flags`}
            >
              {content}
            </a>
          ) : (
            <div key={cell.label} className="bg-card px-5 py-4">
              {content}
            </div>
          );
        })}
      </dl>
    </Card>
  );
};

const TrafficSection: React.FC<{ stats: LogStats; window: LogStatsWindow; className?: string }> = ({ stats, window, className }) => {
  const traffic = buildTraffic(stats.traffic, window);
  const config: ChartConfig = {
    ...Object.fromEntries(traffic.services.map((service) => [service, { label: service === OTHER_SERVICE ? "Other" : service }])),
    errors: { label: "Errors", theme: ERROR_THEME },
  };
  const unit = window === "24h" ? "hour" : "day";
  const summary =
    traffic.totalRequests === 0
      ? `No requests in the ${WINDOW_LABELS[window]}.`
      : `${formatCount(traffic.totalRequests)} requests and ${formatCount(traffic.totalErrors)} errors per ${unit}` +
        (traffic.peak ? `, busiest ${formatBucket(traffic.peak.t, window)} with ${formatCount(traffic.peak.requests)} requests.` : ".");

  return (
    <Section title="Traffic" summary={`Requests by service per ${unit}, errors on the right axis`} className={className}>
      {traffic.totalRequests === 0 && traffic.totalErrors === 0 ? (
        <EmptyNote>No requests were logged in the {WINDOW_LABELS[window]}.</EmptyNote>
      ) : (
        <figure>
          <ChartContainer config={config} className="aspect-auto h-[320px] w-full" aria-hidden="true">
            <ComposedChart data={traffic.rows} margin={{ left: 0, right: 0, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="t" {...axisProps} minTickGap={24} tickFormatter={(t) => formatBucket(t, window)} />
              <YAxis yAxisId="requests" {...axisProps} width={44} allowDecimals={false} tickFormatter={formatCount} />
              <YAxis yAxisId="errors" orientation="right" {...axisProps} width={36} allowDecimals={false} />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(_, payload) => formatBucket(payload?.[0]?.payload?.t, window)} />}
              />
              {traffic.services.map((service, index) => (
                <Bar
                  key={service}
                  dataKey={service}
                  yAxisId="requests"
                  stackId="requests"
                  fill={service === OTHER_SERVICE ? OTHER_COLOR : SERIES_COLORS[index % SERIES_COLORS.length]}
                  isAnimationActive={false}
                />
              ))}
              <Line
                dataKey="errors"
                yAxisId="errors"
                type="monotone"
                stroke="var(--color-errors)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
            </ComposedChart>
          </ChartContainer>
          <figcaption className="sr-only">{summary}</figcaption>
        </figure>
      )}
    </Section>
  );
};

const StatusMixSection: React.FC<{ stats: LogStats }> = ({ stats }) => {
  const mix = stats.status_mix;
  const total = STATUS_BANDS.reduce((sum, band) => sum + (mix[band.key] ?? 0), 0);
  return (
    <Section title="Status mix" summary={total ? `${formatCount(total)} responses by status class` : undefined}>
      {total === 0 ? (
        <EmptyNote>No responses in this window.</EmptyNote>
      ) : (
        <div className="space-y-4">
          <div aria-hidden="true" className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {STATUS_BANDS.map((band) =>
              mix[band.key] ? (
                <span key={band.key} style={{ width: `${percent(mix[band.key], total)}%`, background: band.color }} />
              ) : null
            )}
          </div>
          <ul className="divide-y text-sm">
            {STATUS_BANDS.map((band) => (
              <li key={band.key} className="flex items-center gap-3 py-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: band.color }} />
                <span className="font-medium tabular-nums">{band.key}</span>
                <span className="text-muted-foreground">{band.label}</span>
                <span className="ml-auto tabular-nums">{formatCount(mix[band.key] ?? 0)}</span>
                <span className="w-14 text-right tabular-nums text-muted-foreground">{percent(mix[band.key] ?? 0, total)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
};

const FailedLoginsSection: React.FC<{ stats: LogStats; window: LogStatsWindow }> = ({ stats, window }) => {
  const series = buildCountSeries(stats.auth.failed_logins_over_time, window);
  const total = series.reduce((sum, row) => sum + row.count, 0);
  const config: ChartConfig = { count: { label: "Failed logins", color: "hsl(var(--chart-4))" } };
  const peak = series.reduce((best, row) => (row.count > best.count ? row : best), { t: 0, count: 0 });
  return (
    <Section
      title="Failed logins"
      summary={total ? `${formatCount(total)} failed sign-ins in the ${WINDOW_LABELS[window]}` : undefined}
    >
      {total === 0 ? (
        <EmptyNote>No failed logins in the {WINDOW_LABELS[window]}.</EmptyNote>
      ) : (
        <div className="space-y-5">
          <figure>
            <ChartContainer config={config} className="aspect-auto h-[180px] w-full" aria-hidden="true">
              <BarChart data={series} margin={{ left: 0, right: 0, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="t" {...axisProps} minTickGap={24} tickFormatter={(t) => formatBucket(t, window)} />
                <YAxis {...axisProps} width={32} allowDecimals={false} />
                <ChartTooltip
                  content={<ChartTooltipContent labelFormatter={(_, payload) => formatBucket(payload?.[0]?.payload?.t, window)} />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
            <figcaption className="sr-only">
              {`${formatCount(total)} failed logins, most at ${formatBucket(peak.t, window)} with ${formatCount(peak.count)}.`}
            </figcaption>
          </figure>
          <RankedList label="Most failed accounts" items={accountItems(stats.auth.top_accounts)} empty="No account stands out." />
        </div>
      )}
    </Section>
  );
};

const AuditSection: React.FC<{ stats: LogStats; window: LogStatsWindow }> = ({ stats, window }) => {
  const { actions, rows } = buildAuditSeries(stats.audit.changes_per_day, window);
  const total = stats.audit.changes_per_day.reduce((sum, p) => sum + p.count, 0);
  const colorOf = (index: number) => `hsl(var(--chart-${(index % 5) + 1}))`;
  const config: ChartConfig = Object.fromEntries(actions.map((action) => [action, { label: action }]));
  const byAction = actions.map((action) => ({
    action,
    count: stats.audit.changes_per_day.filter((p) => p.action === action).reduce((sum, p) => sum + p.count, 0),
  }));
  return (
    <Section title="Audit activity" summary={total ? `${formatCount(total)} record changes per day, by action` : undefined}>
      {total === 0 ? (
        <EmptyNote>No records were created, changed or deleted in the {WINDOW_LABELS[window]}.</EmptyNote>
      ) : (
        <div className="space-y-5">
          <figure>
            <ChartContainer config={config} className="aspect-auto h-[180px] w-full" aria-hidden="true">
              <BarChart data={rows} margin={{ left: 0, right: 0, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="t" {...axisProps} minTickGap={24} tickFormatter={(t) => formatBucket(t, "7d")} />
                <YAxis {...axisProps} width={32} allowDecimals={false} />
                <ChartTooltip
                  content={<ChartTooltipContent labelFormatter={(_, payload) => formatBucket(payload?.[0]?.payload?.t, "7d")} />}
                />
                {actions.map((action, index) => (
                  <Bar key={action} dataKey={action} stackId="audit" fill={colorOf(index)} isAnimationActive={false} />
                ))}
                <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
              </BarChart>
            </ChartContainer>
            <figcaption className="sr-only">
              {`${formatCount(total)} changes: ${byAction.map((a) => `${formatCount(a.count)} ${a.action}`).join(", ")}.`}
            </figcaption>
          </figure>
          <div className="grid gap-5 sm:grid-cols-2">
            <RankedList label="Top actors" items={accountItems(stats.audit.top_actors)} empty="No actors recorded." />
            <RankedList
              label="Most changed tables"
              items={stats.audit.top_tables.map((table) => ({
                key: table.table,
                count: table.count,
                name: <span className="font-mono text-xs">{table.table}</span>,
              }))}
              empty="No tables recorded."
            />
          </div>
        </div>
      )}
    </Section>
  );
};

const TopEndpointsSection: React.FC<{ stats: LogStats; className?: string }> = ({ stats, className }) => (
  <Section title="Top endpoints" summary="Busiest paths with their 95th percentile response time" className={className}>
    {stats.top_endpoints.length === 0 ? (
      <EmptyNote>No requests to rank yet.</EmptyNote>
    ) : (
      <div className="-mx-5 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 pl-5">Endpoint</TableHead>
              <TableHead className="h-9 text-right">Requests</TableHead>
              <TableHead className="h-9 pr-5 text-right">p95</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.top_endpoints.map((endpoint) => (
              <TableRow key={endpoint.path}>
                <TableCell className="max-w-[28rem] py-2 pl-5">
                  <span className="block truncate font-mono text-xs" title={endpoint.path}>
                    {endpoint.path}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-right tabular-nums">{formatCount(endpoint.count)}</TableCell>
                <TableCell className="whitespace-nowrap py-2 pr-5 text-right tabular-nums">
                  {endpoint.p95_ms === null ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    `${formatCount(Math.round(endpoint.p95_ms))} ms`
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </Section>
);

const RecentFlagsSection: React.FC<{ stats: LogStats; window: LogStatsWindow; className?: string }> = ({
  stats,
  window,
  className,
}) => {
  const flags = stats.recent_flags;
  const summary =
    stats.totals.flagged > flags.length
      ? `Latest ${flags.length} of ${formatCount(stats.totals.flagged)} flags`
      : "Bursts and spikes found by the flag rules, newest first";
  return (
    <Section id="recent-flags" title="Recent flags" summary={summary} className={className}>
      {flags.length === 0 ? (
        <EmptyNote>Nothing unusual was flagged in the {WINDOW_LABELS[window]}.</EmptyNote>
      ) : (
        <ul
          tabIndex={0}
          aria-label="Recent flags list"
          className="-mx-5 max-h-[356px] divide-y overflow-y-auto border-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {flags.map((flag, index) => {
            const href = flagLink(flag.link_hint, flag.time);
            return (
              <li key={`${flag.time}-${flag.code}-${index}`} className="space-y-1.5 px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <FlagBadge flag={{ code: flag.code, reason: flag.reason, severity: flag.severity }} />
                  <time dateTime={flag.time} className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                    {formatDateTime(flag.time)}
                  </time>
                </div>
                <p className="text-sm leading-snug">{flag.reason}</p>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{flag.service ?? "Service not recorded"}</span>
                  {href ? (
                    <Link
                      to={href}
                      className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {LINK_LABELS[flag.link_hint]}
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span>{LINK_LABELS[flag.link_hint]} (supervisor page)</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
};

const DashboardSkeleton: React.FC = () => (
  <div className="space-y-4" data-testid="log-dashboard-skeleton">
    <Card className="grid grid-cols-2 gap-6 p-5 md:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </Card>
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="space-y-4 p-5 xl:col-span-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-[320px] w-full" />
      </Card>
      <Card className="space-y-3 p-5">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      {[0, 1].map((i) => (
        <Card key={i} className="space-y-4 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-[180px] w-full" />
        </Card>
      ))}
    </div>
  </div>
);

/* ---------- page ---------- */

const LogDashboard: React.FC = () => {
  const [window, setWindow] = useState<LogStatsWindow>("24h");
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setRefreshing(true);
    // Keep the previous window on screen (dimmed) while the next one loads, so the layout does not jump.
    setState((current) => (current.status === "ok" ? current : { status: "loading" }));
    fetchLogStats(window)
      .then((stats) => {
        if (!cancelled) setState({ status: "ok", stats, at: new Date() });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "error", unavailable: statusOf(error) === 503 });
      })
      .finally(() => {
        if (!cancelled) setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [window, attempt]);

  let body: React.ReactNode;
  if (state.status === "loading") {
    body = <DashboardSkeleton />;
  } else if (state.status === "error") {
    body = (
      <Card role="alert" className="flex flex-col items-start gap-3 p-6">
        <div className="space-y-1">
          <h2 className="font-semibold">
            {state.unavailable ? "The log store is not responding" : "Could not load log statistics"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {state.unavailable
              ? "Statistics come from Elasticsearch, which is unreachable right now. Log pages may also be slow. Try again in a minute."
              : "Something went wrong while loading the dashboard. Try again, and check the logging service if it keeps failing."}
          </p>
        </div>
        <Button variant="outline" onClick={retry} disabled={refreshing}>
          <RefreshCw className={cn(refreshing && "animate-spin")} />
          Try again
        </Button>
      </Card>
    );
  } else if (isEmptyStats(state.stats)) {
    body = (
      <Card className="p-6">
        <h2 className="font-semibold">No log activity in the {WINDOW_LABELS[window]}</h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Nothing was logged by any service in this window. Try a longer window. If it stays empty, operational logging may be
          switched off in this environment.
        </p>
      </Card>
    );
  } else {
    const { stats } = state;
    body = (
      <div className={cn("space-y-4 transition-opacity duration-200", refreshing && "opacity-60")}>
        <StatStrip stats={stats} />
        <div className="grid gap-4 xl:grid-cols-3">
          <TrafficSection stats={stats} window={window} className="xl:col-span-2" />
          <RecentFlagsSection stats={stats} window={window} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <FailedLoginsSection stats={stats} window={window} />
          <AuditSection stats={stats} window={window} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <StatusMixSection stats={stats} />
          <TopEndpointsSection stats={stats} className="lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 [--status-5xx:hsl(var(--destructive))] dark:[--status-5xx:hsl(var(--chart-5))]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ChartColumn className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-semibold leading-none tracking-tight">Log Dashboard</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
            All services, {WINDOW_LABELS[window]}
            {state.status === "ok" && <> · updated {formatClock(state.at)}</>}
            {refreshing && state.status === "ok" && <> · refreshing</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={window} onValueChange={(value) => setWindow(value as LogStatsWindow)}>
            <TabsList aria-label="Time window">
              {LOG_STATS_WINDOWS.map((value) => (
                <TabsTrigger key={value} value={value}>
                  {WINDOW_TABS[value]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={retry} disabled={refreshing} aria-label="Refresh statistics">
            <RefreshCw className={cn(refreshing && "animate-spin motion-reduce:animate-none")} />
          </Button>
        </div>
      </div>
      <div aria-busy={refreshing}>{body}</div>
    </div>
  );
};

export default LogDashboard;
