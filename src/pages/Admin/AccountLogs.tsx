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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  X,
  User,
  Calendar,
  Activity,
  Search,
  Shield,
  LogIn,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchUserLogs, UserLogsList } from "@/api/logger/userLogs";

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

const AccountLogs: React.FC = () => {
  const [setExpandedRows] = useState<{ [key: number]: boolean }>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Filter states
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [userName, setUserName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Logs data
  const [logsData, setLogsData] = useState<UserLogsList>({
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
      setExpandedRows;
      try {
        const response = await fetchUserLogs(
          "auth",
          selectedAction === "all" ? null : selectedAction,
          null,
          userName || null,
          startDate || null,
          endDate || null,
          "desc",
          page,
          100
        );
        setLogsData(response);
        setJumpPage(response.pageNo + 1);
      } catch (error) {
        console.error("Error fetching user logs", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedAction, userName, startDate, endDate]
  );

  useEffect(() => {
    handleLogs(0);
  }, [handleLogs]);


  const handleFilterReset = () => {
    setSelectedAction("all");
    setSelectedRole("all");
    setUserName("");
    setStartDate("");
    setEndDate("");
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < logsData.totalPages) {
      handleLogs(page);
    }
  };

  const handleJump = () => {
    const page = Math.max(1, Math.min(jumpPage, logsData.totalPages));
    goToPage(page - 1);
  };

  const handleExport = () => {
    const logs = logsData.data;
    const headers = ["Date/Time", "User", "Role", "Action", "Description"];

    const rows = logs.map((log) => [
      format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
      log.user_full_name || log.user,
      log.role || "-",
      log.method,
      log.message,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auth-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
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

  // Filter logs by role on client side
  const filteredLogs =
    selectedRole === "all"
      ? logsData.data
      : logsData.data.filter((log) => log.role?.toUpperCase() === selectedRole.toUpperCase());

  return (
    <div className="flex min-h-screen w-full">
      {/* ================= FILTER SIDEBAR ================= */}
      <div
        className={`${
          sidebarCollapsed ? "w-12" : "w-64"
        } flex-shrink-0 border-r bg-white transition-all duration-300`}
      >
        {sidebarCollapsed ? (
          <div className="p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="w-8 h-8"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="p-4">
            {/* Filter header with collapse */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Toggle filters visibility */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="w-full justify-between mb-2"
            >
              {filtersVisible ? "Hide Filters" : "Show Filters"}
              {filtersVisible ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {filtersVisible && (
              <div className="space-y-4">
                {/* Action Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Action
                  </label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Role
                  </label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* User Name Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <User className="h-4 w-4" />
                    User Name
                  </label>
                  <Input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Search user name..."
                  />
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End date"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-2 space-y-2">
                  <Button className="w-full" onClick={() => handleLogs(0)}>
                    <Search className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleFilterReset}
                  >
                    Reset
                  </Button>
                </div>

                {/* Export */}
                <div className="pt-4 border-t space-y-2">
                  <label className="text-sm font-medium">Export</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 p-6 overflow-auto">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <LogIn className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Authentication Logs</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logsData.totalRecords} records
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
                        <TableHead className="w-40">User</TableHead>
                        <TableHead className="w-32">Role</TableHead>
                        <TableHead className="w-28">Action</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No logs found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log, index) => (
                          <TableRow key={index} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-xs">
                              {index + 1 + logsData.pageNo * logsData.pageSize}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm")}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {log.user_full_name || "-"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.user}
                              </div>
                            </TableCell>
                            <TableCell>
                              {log.role && (
                                <Badge className={getRoleBadgeColor(log.role)}>
                                  {log.role}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={getActionBadgeColor(log.method)}>
                                {log.method}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md truncate">
                              {log.message}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
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
                    <span className="text-sm text-muted-foreground">
                      of {logsData.totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleJump}>
                      Go
                    </Button>
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

export default AccountLogs;