import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Bug, Calendar, Eye, Fingerprint, Globe, KeyRound, Layers, Search, Server, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FilterSidebar from "@/components/Filters/FilterSidebar";
import TextFilterField from "@/components/Filters/TextFilterField";
import SelectFilterField from "@/components/Filters/SelectFilterField";
import DateRangeFilterField from "@/components/Filters/DateRangeFilterField";
import FilterActionButtons from "@/components/Filters/FilterActionButtons";
import { DataTableServer } from "@/components/Table/DataTable";
import OpsLogDetails from "@/components/opsLogs/OpsLogDetails";
import {
  fetchOpsLogs,
  OpsLog,
  OpsLogFilters,
  OpsLogKind,
  OpsLogsResult,
} from "@/api/logger/opsLogs";
import {
  describeOpsLog,
  LEVEL_OPTIONS,
  levelBadgeClass,
  SERVICE_OPTIONS,
  statusBadgeClass,
} from "@/lib/opsLogs/formatOpsLog";

type OpsLogsPageProps = {
  kind: OpsLogKind;
  sensitive?: boolean;
};

type OpsLogRow = {
  id: string;
  timestamp: string;
  service: string;
  level: string;
  status: number | null;
  summary: string;
  userId: string;
  requestId: string;
  raw: OpsLog;
};

const PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100].map((size) => ({ label: String(size), value: size }));

const HEADINGS: Record<OpsLogKind, { title: string; icon: React.ElementType }> = {
  errors: { title: "Error Logs", icon: Bug },
  requests: { title: "Request Logs", icon: Globe },
  auth: { title: "Auth Event Logs", icon: KeyRound },
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, "dd/MM/yyyy HH:mm:ss");
};

const normalise = (filters: OpsLogFilters): OpsLogFilters => ({
  ...filters,
  service: filters.service && filters.service !== "all" ? filters.service : null,
  level: filters.level && filters.level !== "all" ? filters.level : null,
});

const OpsLogsPage: React.FC<OpsLogsPageProps> = ({ kind, sensitive = false }) => {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<OpsLogFilters>({});
  const [applied, setApplied] = useState<OpsLogFilters>({});
  const [paging, setPaging] = useState({ pageNo: 0, pageSize: PAGE_SIZE });
  const [result, setResult] = useState<OpsLogsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetchOpsLogs(kind, { ...applied, sensitive }, paging.pageNo, paging.pageSize)
      .then((response) => {
        if (!cancelled) setResult(response);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, sensitive, applied, paging]);

  const openTrace = (requestId: string) => navigate(`/admin/ops-logs/trace/${encodeURIComponent(requestId)}`);

  const handleApply = () => {
    setApplied(normalise(draft));
    setPaging((current) => ({ ...current, pageNo: 0 }));
  };

  const handleReset = () => {
    setDraft({});
    setApplied({});
    setPaging({ pageNo: 0, pageSize: PAGE_SIZE });
  };

  const list = result?.status === "ok" ? result.data : null;
  const rows: OpsLogRow[] = (list?.data ?? []).map((log, index) => ({
    id: `${list?.pageNo ?? 0}-${index}-${log.timestamp}`,
    timestamp: log.timestamp,
    service: log.service ?? "-",
    level: log.level ?? "-",
    status: log.status ?? null,
    summary: describeOpsLog(log),
    userId: log.user_id ?? "-",
    requestId: log.request_id ?? "",
    raw: log,
  }));

  const columns = [
    {
      key: "timestamp" as keyof OpsLogRow,
      header: "Date/Time",
      render: (value: string) => <span className="whitespace-nowrap text-sm">{formatTime(value)}</span>,
    },
    {
      key: "service" as keyof OpsLogRow,
      header: "Service",
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    kind === "requests"
      ? {
          key: "status" as keyof OpsLogRow,
          header: "Status",
          render: (value: number | null) => <Badge className={statusBadgeClass(value)}>{value ?? "-"}</Badge>,
        }
      : {
          key: "level" as keyof OpsLogRow,
          header: "Level",
          render: (value: string) => <Badge className={levelBadgeClass(value)}>{value}</Badge>,
        },
    {
      key: "summary" as keyof OpsLogRow,
      header: "Summary",
      render: (value: string) => <div className="max-w-md truncate font-mono text-xs">{value}</div>,
    },
    {
      key: "userId" as keyof OpsLogRow,
      header: "User ID",
    },
    {
      key: "requestId" as keyof OpsLogRow,
      header: "Request ID",
      render: (value: string) =>
        value ? (
          <button
            type="button"
            className="font-mono text-xs text-primary underline underline-offset-2"
            onClick={(event) => {
              event.stopPropagation();
              openTrace(value);
            }}
          >
            {value.slice(0, 8)}
          </button>
        ) : (
          "-"
        ),
    },
  ];

  const heading = sensitive ? { title: "Sensitive Access", icon: Eye } : HEADINGS[kind];
  const HeadingIcon = heading.icon;

  let body: React.ReactNode;
  if (result?.status === "unavailable") {
    body = (
      <p className="text-muted-foreground">
        Operational logs are not available yet: the logging service in this environment has not been updated.
      </p>
    );
  } else if (failed) {
    body = <p className="text-muted-foreground">Could not load logs. Try again later.</p>;
  } else if (!loading && list && list.totalRecords === 0) {
    body = (
      <p className="text-muted-foreground">
        No entries for these filters. Without dates, only the last 24 hours are shown. If this stays empty,
        operational logging may be switched off in this environment.
      </p>
    );
  } else {
    body = (
      <div className="overflow-x-auto">
        <DataTableServer
          data={rows}
          columns={columns}
          pagination={{
            pageNo: list?.pageNo ?? 0,
            pageSize: list?.pageSize ?? paging.pageSize,
            totalRecords: list?.totalRecords ?? 0,
            totalPages: list?.totalPages ?? 0,
          }}
          viewMore={false}
          hideActionsHeader={false}
          fetchData={(pageNo: number, pageSize: number) => setPaging({ pageNo, pageSize })}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          expandable={true}
          expandTogglePlacement="actions"
          renderExpandedContent={(item: OpsLogRow) => <OpsLogDetails log={item.raw} onRequestIdClick={openTrace} />}
          loading={loading}
          showPageSizeSelector={true}
          showPaginationControls={true}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <FilterSidebar title="Filters">
        <SelectFilterField
          label="Service"
          icon={Server}
          value={draft.service ?? "all"}
          onChange={(value) => setDraft({ ...draft, service: value })}
          options={SERVICE_OPTIONS}
          placeholder="Select service"
        />
        {kind !== "requests" && (
          <SelectFilterField
            label="Level"
            icon={Layers}
            value={draft.level ?? "all"}
            onChange={(value) => setDraft({ ...draft, level: value })}
            options={LEVEL_OPTIONS}
            placeholder="Select level"
          />
        )}
        <TextFilterField
          label="User ID"
          icon={User}
          value={draft.userId ?? ""}
          onChange={(value) => setDraft({ ...draft, userId: value })}
          placeholder="Exact user ID"
        />
        <TextFilterField
          label="Request ID"
          icon={Fingerprint}
          value={draft.requestId ?? ""}
          onChange={(value) => setDraft({ ...draft, requestId: value })}
          placeholder="Exact request ID"
        />
        <DateRangeFilterField
          label="Date Range"
          icon={Calendar}
          startDate={draft.startDate ?? ""}
          endDate={draft.endDate ?? ""}
          onStartDateChange={(value) => setDraft({ ...draft, startDate: value })}
          onEndDateChange={(value) => setDraft({ ...draft, endDate: value })}
        />
        <FilterActionButtons applyIcon={Search} onApply={handleApply} onReset={handleReset} />
      </FilterSidebar>

      <div className="flex-1 overflow-auto p-6">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <HeadingIcon className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">{heading.title}</CardTitle>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              Read Only
            </Badge>
          </CardHeader>
          <CardContent>{body}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OpsLogsPage;
