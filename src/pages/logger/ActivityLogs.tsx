import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Calendar,
  Activity,
  Search,
} from "lucide-react";
import {
  fetchActivityLogs,
  ActivityLogsList,
} from "@/api/logger/activityLogs";
import FilterSidebar from "@/components/Filters/FilterSidebar";
import TextFilterField from "@/components/Filters/TextFilterField";
import SelectFilterField from "@/components/Filters/SelectFilterField";
import DateRangeFilterField from "@/components/Filters/DateRangeFilterField";
import FilterActionButtons from "@/components/Filters/FilterActionButtons";
import FilterExportButtons from "@/components/Filters/FilterExportButtons";

const TABLE_OPTIONS = [
  { value: "all", label: "All Tables" },
  { value: "CENTRE_ACTIVITY", label: "Centre Activity" },
  { value: "CENTRE_ACTIVITY_EXCLUSION", label: "Activity Exclusions" },
  { value: "CENTRE_ACTIVITY_PREFERENCE", label: "Preferences" },
  { value: "CENTRE_ACTIVITY_RECOMMENDATION", label: "Activity Recommendation" },
  { value: "Activity", label: "Activity" },
  { value: "AdHoc", label: "Ad Hoc" },
  { value: "ROUTINE", label: "Routines" },
  { value: "ROUTINE_EXCLUSION", label: "Routine Exclusions" },
];

const ACTION_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
];

const ActivityLogs: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [patientName, setPatientName] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [selectedTable, setSelectedTable] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [logsData, setLogsData] = useState<ActivityLogsList>({
    data: [],
    pageNo: 0,
    pageSize: 100,
    totalRecords: 0,
    totalPages: 0,
  });

  const [jumpPage, setJumpPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleLogs = useCallback(
    async (page: number = 0) => {
      setLoading(true);
      setExpandedRows({});
      try {
        const response = await fetchActivityLogs(
          selectedAction === "all" ? null : selectedAction,
          null,
          caregiverName || null,
          selectedTable === "all" ? null : selectedTable,
          null,
          patientName || null,
          null,
          null,
          startDate || null,
          endDate || null,
          "desc",
          page,
          100
        );
        setLogsData(response);
        setJumpPage(response.pageNo + 1);
      } catch (error) {
        console.error("Error fetching activity logs", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedAction, caregiverName, selectedTable, patientName, startDate, endDate]
  );

  useEffect(() => {
    handleLogs(0);
  }, [handleLogs]);

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleFilterReset = () => {
    setPatientName("");
    setCaregiverName("");
    setSelectedTable("all");
    setSelectedAction("all");
    setStartDate("");
    setEndDate("");
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < logsData.totalPages) handleLogs(page);
  };

  const handleJump = () => {
    const page = Math.max(1, Math.min(jumpPage, logsData.totalPages));
    goToPage(page - 1);
  };

  const handleExport = (type: "internal" | "external") => {
    const headers = ["Date/Time", "Patient", "User", "Action", "Table", "Description"];
    const rows = logsData.data.map((log) => [
      format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
      type === "internal" ? log.patient_full_name || log.patient_id || "-" : log.patient_id || "-",
      type === "internal" ? log.user_full_name || log.user : log.user,
      log.method,
      log.table,
      `"${log.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `activity-logs-${type}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const computeDiff = (original: any, updated: any) => {
    const changes: { field: string; old: any; new: any }[] = [];
    const allKeys = new Set([...Object.keys(original || {}), ...Object.keys(updated || {})]);
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

  return (
    <div className="flex min-h-screen w-full">
      <FilterSidebar
        title="Filters"
        footer={
          <FilterExportButtons
            onInternalExport={() => handleExport("internal")}
            onExternalExport={() => handleExport("external")}
          />
        }
      >
        <TextFilterField
          label="Patient Name"
          icon={User}
          value={patientName}
          onChange={setPatientName}
          placeholder="Search patient name..."
        />

        <TextFilterField
          label="Caregiver/Guardian"
          icon={User}
          value={caregiverName}
          onChange={setCaregiverName}
          placeholder="Search caregiver name..."
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
          onApply={() => handleLogs(0)}
          onReset={handleFilterReset}
        />
      </FilterSidebar>

      <div className="flex-1 p-6 overflow-auto">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Activity Logs</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {logsData.data.length} of {logsData.totalRecords} records
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="w-32">Date/Time</TableHead>
                        <TableHead className="w-40">Patient</TableHead>
                        <TableHead className="w-40">Caregiver</TableHead>
                        <TableHead className="w-24">Action</TableHead>
                        <TableHead className="w-32">Table</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-24">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsData.data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No logs found
                          </TableCell>
                        </TableRow>
                      ) : (
                        logsData.data.map((log, index) => (
                          <React.Fragment key={index}>
                            <TableRow className="hover:bg-muted/50">
                              <TableCell className="font-mono text-xs">
                                {index + 1 + logsData.pageNo * logsData.pageSize}
                              </TableCell>
                              <TableCell className="text-sm whitespace-nowrap">
                                {format(new Date(log.timestamp), "dd-MMM-yyyy h:mm a").toUpperCase()}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{log.patient_full_name || "-"}</div>
                                {log.patient_id && (
                                  <div className="text-xs text-muted-foreground">ID: {log.patient_id}</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{log.user_full_name}</div>
                                <div className="text-xs text-muted-foreground">{log.user}</div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getActionBadgeColor(log.method)}>
                                  {log.method}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{log.table || "-"}</Badge>
                              </TableCell>
                              <TableCell className="max-w-md truncate">{log.message}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => toggleRow(index)}>
                                  {expandedRows[index] ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>

                            {expandedRows[index] && (
                              <TableRow>
                                <TableCell colSpan={8} className="p-0">
                                  <div className="bg-muted/30 p-4">
                                    <div className="mb-4">
                                      <h4 className="font-semibold mb-2">Change Details</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">Entity ID:</span>{" "}
                                          {log.entity_id || "-"}
                                        </div>
                                      </div>
                                    </div>

                                    {(log.original_data || log.updated_data) && (
                                      <div className="mt-4">
                                        <h5 className="text-sm font-medium mb-2">Field Changes</h5>
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
                                            {computeDiff(log.original_data, log.updated_data).map((change, idx) => (
                                              <TableRow key={idx}>
                                                <TableCell className="font-medium">{change.field}</TableCell>
                                                <TableCell className="text-red-600 bg-red-50/50">
                                                  {change.old === undefined ? "-" : String(change.old)}
                                                </TableCell>
                                                <TableCell className="text-green-600 bg-green-50/50">
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
                                            ))}
                                            {computeDiff(log.original_data, log.updated_data).length === 0 && (
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
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {logsData.totalPages > 0 && (
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <input
                      type="number"
                      className="w-16 text-center border rounded-md px-2 py-1 text-sm"
                      min={1}
                      max={logsData.totalPages}
                      value={jumpPage}
                      onChange={(e) => setJumpPage(Number(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">of {logsData.totalPages}</span>
                    <Button variant="outline" size="sm" onClick={handleJump}>Go</Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={logsData.pageNo <= 0}
                      onClick={() => goToPage(logsData.pageNo - 1)}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={logsData.pageNo >= logsData.totalPages - 1}
                      onClick={() => goToPage(logsData.pageNo + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLogs;