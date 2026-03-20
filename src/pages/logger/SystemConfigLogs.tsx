import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  FileText,
  User,
  Calendar,
  Activity,
  Search,
  Shield,
} from "lucide-react";

import { fetchSystemLogs, SystemLogsList } from "@/api/logger/systemLogs";
import FilterSidebar from "@/components/Filters/FilterSidebar";
import TextFilterField from "@/components/Filters/TextFilterField";
import SelectFilterField from "@/components/Filters/SelectFilterField";
import DateRangeFilterField from "@/components/Filters/DateRangeFilterField";
import FilterActionButtons from "@/components/Filters/FilterActionButtons";
import { DataTableServer } from "@/components/Table/DataTable";

const TABLE_OPTIONS = [
  { value: "all", label: "All Tables" },
  { value: "ACTIVITY", label: "Activity" },
  { value: "AllergyReactionType", label: "Allergy Reaction Type" },
  { value: "AllergyType", label: "Allergy Type" },
  { value: "CARE_CENTRE", label: "Care Centre" },
  { value: "CENTRE_ACTIVITY_AVAILABILITY", label: "Centre availability" },
  { value: "CENTRE_ACTIVITY", label: "Centre Activities" },
  { value: "DementiaStage", label: "Dementia Stage" },
  { value: "DementiaType", label: "Dementia Type" },
  { value: "Doctor", label: "Doctor" },
  { value: "DosageForm", label: "Dosage Form" },
  { value: "Frequency", label: "Frequency" },
  { value: "HighlightType", label: "Highlight types" },
  { value: "Instruction", label: "Instruction" },
  { value: "Mobility", label: "Mobility" },
  { value: "Problem", label: "Problem" },
  { value: "PatientAssignedDementiaList", label: "Patient Assigned Dementia" },
  { value: "PatientDementiaStageList", label: "Patient Dementia Stage" },
  { value: "PatientGuardianRelationshipMapping", label: "Guardian Relationship" },
  { value: "PatientList", label: "Patient List" },
  { value: "PatientListDiet", label: "Diet" },
  { value: "PatientListEducation", label: "Education" },
  { value: "Role", label: "Role" },
  { value: "SocialHistory", label: "Social History" },
  { value: "VitalType", label: "Vital Type" },
  { value: "PatientGuardian", label: "Guardian" },
];

const ACTION_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
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

type SystemLogRow = {
  id: string | number;
  indexLabel: string;
  timestamp: string;
  adminDisplay: string;
  method: string;
  table: string;
  message: string;
  raw: any;
};

const SystemConfigLogs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [logsData, setLogsData] = useState<SystemLogsList>({
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

  const urlAdminName = queryParams.get("adminName") ?? "";
  const urlTable = queryParams.get("table") ?? "all";
  const urlAction = queryParams.get("action") ?? "all";
  const urlStartDate = queryParams.get("startDate") ?? "";
  const urlEndDate = queryParams.get("endDate") ?? "";
  const page = parsePage(queryParams.get("page"));
  const pageSize = parsePageSize(queryParams.get("pageSize"));

  const [adminName, setAdminName] = useState(urlAdminName);
  const [selectedTable, setSelectedTable] = useState(urlTable);
  const [selectedAction, setSelectedAction] = useState(urlAction);
  const [startDate, setStartDate] = useState(urlStartDate);
  const [endDate, setEndDate] = useState(urlEndDate);

  const updateQuery = (updates: {
    adminName?: string;
    table?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const next = new URLSearchParams(location.search);

    const nextAdminName = updates.adminName ?? (next.get("adminName") ?? "");
    const nextTable = updates.table ?? (next.get("table") ?? "all");
    const nextAction = updates.action ?? (next.get("action") ?? "all");
    const nextStartDate = updates.startDate ?? (next.get("startDate") ?? "");
    const nextEndDate = updates.endDate ?? (next.get("endDate") ?? "");
    const nextPage = updates.page ?? parsePage(next.get("page"));
    const nextPageSize = updates.pageSize ?? parsePageSize(next.get("pageSize"));

    nextAdminName.trim()
      ? next.set("adminName", nextAdminName.trim())
      : next.delete("adminName");
    nextTable !== "all" ? next.set("table", nextTable) : next.delete("table");
    nextAction !== "all" ? next.set("action", nextAction) : next.delete("action");
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
    setAdminName(urlAdminName);
    setSelectedTable(urlTable);
    setSelectedAction(urlAction);
    setStartDate(urlStartDate);
    setEndDate(urlEndDate);
  }, [urlAdminName, urlTable, urlAction, urlStartDate, urlEndDate]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    fetchSystemLogs(
      urlAction === "all" ? null : urlAction,
      null,
      urlAdminName || null,
      urlTable === "all" ? null : urlTable,
      null,
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
          console.error("Error fetching system logs", error);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urlAction, urlAdminName, urlTable, urlStartDate, urlEndDate, page, pageSize]);

  const handleApplyFilters = () => {
    updateQuery({
      adminName,
      table: selectedTable,
      action: selectedAction,
      startDate,
      endDate,
      page: 0,
    });
  };

  const handleFilterReset = () => {
    setAdminName("");
    setSelectedTable("all");
    setSelectedAction("all");
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

  const computeDiff = (original: any, updated: any) => {
    const changes: { field: string; old: any; new: any }[] = [];
    const allKeys = new Set([
      ...Object.keys(original || {}),
      ...Object.keys(updated || {}),
    ]);

    allKeys.forEach((key) => {
      const oldVal = original?.[key];
      const newVal = updated?.[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ field: key, old: oldVal, new: newVal });
      }
    });

    return changes;
  };

  const getActionBadgeColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "create":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "update":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "delete":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const tableRows: SystemLogRow[] = logsData.data.map((log, index) => ({
    id: `${logsData.pageNo}-${index}-${log.timestamp}-${log.entity_id ?? "row"}`,
    indexLabel: String(index + 1 + logsData.pageNo * logsData.pageSize),
    timestamp: log.timestamp,
    adminDisplay: log.user_full_name || "-",
    method: log.method,
    table: log.table || "-",
    message: log.message,
    raw: log,
  }));

  const columns = [
    {
      key: "indexLabel" as keyof SystemLogRow,
      header: "#",
      render: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      ),
    },
    {
      key: "timestamp" as keyof SystemLogRow,
      header: "Date/Time",
      render: (value: string) => (
        <span className="text-sm whitespace-nowrap">
          {format(new Date(value), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
    {
      key: "adminDisplay" as keyof SystemLogRow,
      header: "System Admin",
      render: (_: string, item: SystemLogRow) => (
        <div>
          <div className="font-medium">{item.raw.user_full_name || "-"}</div>
          <div className="text-xs text-muted-foreground">{item.raw.user}</div>
        </div>
      ),
    },
    {
      key: "method" as keyof SystemLogRow,
      header: "Action",
      render: (value: string) => (
        <Badge className={getActionBadgeColor(value)}>{value}</Badge>
      ),
    },
    {
      key: "table" as keyof SystemLogRow,
      header: "Table",
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "message" as keyof SystemLogRow,
      header: "Description",
      render: (value: string) => <div className="max-w-md truncate">{value}</div>,
    },
  ];

  const renderExpandedContent = (item: SystemLogRow) => {
    const log = item.raw;
    const diff = computeDiff(log.original_data, log.updated_data);

    return (
      <div className="bg-muted/30 p-4">
        <div className="mb-4">
          <h4 className="mb-2 font-semibold">Change Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Entity ID:</span>{" "}
              {log.entity_id || "-"}
            </div>
            {log.entity_name && (
              <div>
                <span className="text-muted-foreground">Entity Name:</span>{" "}
                {log.entity_name}
              </div>
            )}
          </div>
        </div>

        {(log.original_data || log.updated_data) && (
          <div className="mt-4">
            <h5 className="mb-2 text-sm font-medium">Field Changes</h5>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Old Value</TableHead>
                  <TableHead>New Value</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diff.length > 0 ? (
                  diff.map((change, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{change.field}</TableCell>
                      <TableCell className="bg-red-50/50 text-red-600">
                        {change.old === undefined ? "-" : String(change.old)}
                      </TableCell>
                      <TableCell className="bg-green-50/50 text-green-600">
                        {change.new === undefined ? "-" : String(change.new)}
                      </TableCell>
                      <TableCell>
                        {!change.old && change.new ? (
                          <Badge className="bg-green-100 text-green-800">Added</Badge>
                        ) : change.old && !change.new ? (
                          <Badge className="bg-red-100 text-red-800">Removed</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">Modified</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No changes detected
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  };

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
      <FilterSidebar title="Filters">
        <TextFilterField
          label="System Admin"
          icon={User}
          value={adminName}
          onChange={setAdminName}
          placeholder="Search admin name..."
        />

        <SelectFilterField
          label="Table"
          icon={FileText}
          value={selectedTable}
          onChange={setSelectedTable}
          options={TABLE_OPTIONS}
          placeholder="Select table"
        />

        <SelectFilterField
          label="Action"
          icon={Activity}
          value={selectedAction}
          onChange={setSelectedAction}
          options={ACTION_OPTIONS}
          placeholder="Select action"
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
      </FilterSidebar>

      <div className="flex-1 overflow-auto p-6">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">System Configuration Logs</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-muted-foreground">
                Read Only
              </Badge>
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
              hideActionsHeader={false}
              fetchData={handleTableFetch}
              pageSizeOptions={pageSizeOptions}
              expandable={true}
              expandTogglePlacement="actions"
              renderExpandedContent={renderExpandedContent}
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

export default SystemConfigLogs;