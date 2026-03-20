import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  User,
  Calendar,
  Activity,
  Search,
  Shield,
  LogIn,
} from "lucide-react";

import { fetchUserLogs, UserLogsList } from "@/api/logger/userLogs";
import FilterSidebar from "@/components/Filters/FilterSidebar";
import TextFilterField from "@/components/Filters/TextFilterField";
import SelectFilterField from "@/components/Filters/SelectFilterField";
import DateRangeFilterField from "@/components/Filters/DateRangeFilterField";
import FilterActionButtons from "@/components/Filters/FilterActionButtons";
import FilterExportButtons from "@/components/Filters/FilterExportButtons";
import { DataTableServer } from "@/components/Table/DataTable";

const ACTION_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "password_change", label: "Password Change" },
];

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "CAREGIVER", label: "Caregiver" },
  { value: "GUARDIAN", label: "Guardian" },
  { value: "GAME_THERAPIST", label: "Game Therapist" },
];

const DEFAULT_PAGE_SIZE = 10;
const VALID_PAGE_SIZES = [5, 10, 50, 100];

function parsePage(raw: string | null): number {
  const n = Number(raw ?? "0");
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

function parsePageSize(raw: string | null): number {
  const n = Number(raw ?? String(DEFAULT_PAGE_SIZE));
  return Number.isNaN(n) || n <= 0 ? DEFAULT_PAGE_SIZE : n;
}

type AccountLogRow = {
  id: string | number;
  indexLabel: string;
  timestamp: string;
  userDisplay: string;
  role: string;
  method: string;
  message: string;
  raw: any;
};

const AccountLogs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [logsData, setLogsData] = useState<UserLogsList>({
    data: [],
    pageNo: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    totalRecords: 0,
    totalPages: 0,
  });

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const urlAction = queryParams.get("action") ?? "all";
  const urlRole = queryParams.get("role") ?? "all";
  const urlUserName = queryParams.get("userName") ?? "";
  const urlStartDate = queryParams.get("startDate") ?? "";
  const urlEndDate = queryParams.get("endDate") ?? "";
  const page = parsePage(queryParams.get("page"));
  const pageSize = parsePageSize(queryParams.get("pageSize"));

  const [selectedAction, setSelectedAction] = useState(urlAction);
  const [selectedRole, setSelectedRole] = useState(urlRole);
  const [userName, setUserName] = useState(urlUserName);
  const [startDate, setStartDate] = useState(urlStartDate);
  const [endDate, setEndDate] = useState(urlEndDate);

  const updateQuery = (updates: {
    action?: string;
    role?: string;
    userName?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const next = new URLSearchParams(location.search);

    const nextAction = updates.action ?? (next.get("action") ?? "all");
    const nextRole = updates.role ?? (next.get("role") ?? "all");
    const nextUserName = updates.userName ?? (next.get("userName") ?? "");
    const nextStartDate = updates.startDate ?? (next.get("startDate") ?? "");
    const nextEndDate = updates.endDate ?? (next.get("endDate") ?? "");
    const nextPage = updates.page ?? parsePage(next.get("page"));
    const nextPageSize = updates.pageSize ?? parsePageSize(next.get("pageSize"));

    nextAction !== "all" ? next.set("action", nextAction) : next.delete("action");
    nextRole !== "all" ? next.set("role", nextRole) : next.delete("role");
    nextUserName.trim()
      ? next.set("userName", nextUserName.trim())
      : next.delete("userName");
    nextStartDate ? next.set("startDate", nextStartDate) : next.delete("startDate");
    nextEndDate ? next.set("endDate", nextEndDate) : next.delete("endDate");
    nextPage > 0 ? next.set("page", String(nextPage)) : next.delete("page");

    if (nextPageSize !== DEFAULT_PAGE_SIZE) {
      next.set("pageSize", String(nextPageSize));
    } else {
      next.delete("pageSize");
    }

    const nextSearch = next.toString();
    const currentSearch = location.search.startsWith("?")
      ? location.search.slice(1)
      : location.search;

    if (nextSearch !== currentSearch) {
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : "",
        },
        { replace: true }
      );
    }
  };

  useEffect(() => {
    setSelectedAction(urlAction);
    setSelectedRole(urlRole);
    setUserName(urlUserName);
    setStartDate(urlStartDate);
    setEndDate(urlEndDate);
  }, [urlAction, urlRole, urlUserName, urlStartDate, urlEndDate]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    fetchUserLogs(
      "auth",
      urlAction === "all" ? null : urlAction,
      null,
      urlUserName || null,
      urlStartDate || null,
      urlEndDate || null,
      "desc",
      page,
      pageSize
    )
      .then((response) => {
        if (!cancelled) {
          setLogsData(response);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error fetching user logs", error);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urlAction, urlUserName, urlStartDate, urlEndDate, page, pageSize]);

  const handleApplyFilters = () => {
    updateQuery({
      action: selectedAction,
      role: selectedRole,
      userName,
      startDate,
      endDate,
      page: 0,
    });
  };

  const handleFilterReset = () => {
    setSelectedAction("all");
    setSelectedRole("all");
    setUserName("");
    setStartDate("");
    setEndDate("");

    navigate(
      {
        pathname: location.pathname,
        search: "",
      },
      { replace: true }
    );
  };

  const handleTableFetch = async (pageNo: number, nextPageSize: number) => {
    updateQuery({
      page: pageNo,
      pageSize: nextPageSize,
    });
  };

  const getActionBadgeColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "login":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "logout":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "password_change":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "SUPERVISOR":
        return "bg-blue-100 text-blue-800";
      case "DOCTOR":
        return "bg-green-100 text-green-800";
      case "CAREGIVER":
        return "bg-orange-100 text-orange-800";
      case "GUARDIAN":
        return "bg-pink-100 text-pink-800";
      case "GAME_THERAPIST":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredLogs =
    urlRole === "all"
      ? logsData.data
      : logsData.data.filter(
          (log) => log.role?.toUpperCase() === urlRole.toUpperCase()
        );

  const handleExport = () => {
    const headers = ["Date/Time", "User", "Role", "Action", "Description"];

    const rows = filteredLogs.map((log) => [
      format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
      log.user_full_name || log.user,
      log.role || "-",
      log.method,
      `"${String(log.message).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auth-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const tableRows: AccountLogRow[] = filteredLogs.map((log, index) => ({
    id: `${logsData.pageNo}-${index}-${log.timestamp}-${log.user ?? "user"}`,
    indexLabel: String(index + 1 + logsData.pageNo * logsData.pageSize),
    timestamp: log.timestamp,
    userDisplay: log.user_full_name || "-",
    role: log.role || "-",
    method: log.method,
    message: log.message,
    raw: log,
  }));

  const columns = [
    {
      key: "indexLabel" as keyof AccountLogRow,
      header: "#",
      render: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      ),
    },
    {
      key: "timestamp" as keyof AccountLogRow,
      header: "Date/Time",
      render: (value: string) => (
        <span className="text-sm whitespace-nowrap">
          {format(new Date(value), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
    {
      key: "userDisplay" as keyof AccountLogRow,
      header: "User",
      render: (_: string, item: AccountLogRow) => (
        <div>
          <div className="font-medium">{item.raw.user_full_name || "-"}</div>
          <div className="text-xs text-muted-foreground">{item.raw.user}</div>
        </div>
      ),
    },
    {
      key: "role" as keyof AccountLogRow,
      header: "Role",
      render: (value: string) =>
        value && value !== "-" ? (
          <Badge className={getRoleBadgeColor(value)}>{value}</Badge>
        ) : null,
    },
    {
      key: "method" as keyof AccountLogRow,
      header: "Action",
      render: (value: string) => (
        <Badge className={getActionBadgeColor(value)}>{value}</Badge>
      ),
    },
    {
      key: "message" as keyof AccountLogRow,
      header: "Description",
      render: (value: string) => <div className="max-w-md truncate">{value}</div>,
    },
  ];

  const pageSizeOptions =
    logsData.totalRecords > 0
      ? [
          ...VALID_PAGE_SIZES.map((size) => ({
            label: String(size),
            value: size,
          })),
          ...(!VALID_PAGE_SIZES.includes(logsData.totalRecords)
            ? [
                {
                  label: "All",
                  value: logsData.totalRecords,
                },
              ]
            : []),
        ]
      : VALID_PAGE_SIZES.map((size) => ({
          label: String(size),
          value: size,
        }));

  const effectivePageSize = Math.max(logsData.pageSize, 1);

  const effectiveTotalPages =
    logsData.totalRecords === 0
      ? 0
      : Math.ceil(logsData.totalRecords / effectivePageSize);

  return (
    <div className="flex min-h-screen w-full">
      <FilterSidebar>
        <SelectFilterField
          label="Action"
          icon={Activity}
          value={selectedAction}
          onChange={setSelectedAction}
          options={ACTION_OPTIONS}
          placeholder="Select action"
        />

        <SelectFilterField
          label="Role"
          icon={Shield}
          value={selectedRole}
          onChange={setSelectedRole}
          options={ROLE_OPTIONS}
          placeholder="Select role"
        />

        <TextFilterField
          label="User Name"
          icon={User}
          value={userName}
          onChange={setUserName}
          placeholder="Search user name..."
        />

        <DateRangeFilterField
          label="Date Range"
          icon={Calendar}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <FilterActionButtons
          applyIcon={Search}
          onApply={handleApplyFilters}
          onReset={handleFilterReset}
        />

        <FilterExportButtons
          onInternalExport={handleExport}
          internalLabel="Export CSV"
        />
      </FilterSidebar>

      <div className="flex-1 overflow-auto p-6">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <LogIn className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Authentication Logs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DataTableServer
              data={tableRows}
              pagination={{
                pageNo: logsData.pageNo,
                pageSize: logsData.pageSize,
                totalRecords: logsData.totalRecords,
                totalPages: effectiveTotalPages,
              }}
              columns={columns}
              viewMore={false}
              hideActionsHeader={true}
              fetchData={handleTableFetch}
              pageSizeOptions={pageSizeOptions}
              expandable={false}
              loading={loading}
              showPageSizeSelector={true}
              showPaginationControls={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountLogs;