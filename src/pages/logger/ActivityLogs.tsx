import React, { useEffect, useState } from "react";
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
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react"; 

import { fetchActivityLogs, ActivityLogBase, ActivityLogsList } from "@/api/logger/activityLogs";

const ActivityLogs: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});
  const [table, setTable] = useState("");
  const [user, setUser] = useState("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(true); 

  const [filters, setFilters] = useState({
    table: "",
    user: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  const [logsData, setLogsData] = useState<ActivityLogsList>({
    data: [],
    pageNo: 0,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });
  const [jumpPage, setJumpPage] = useState(1);

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLogs = async (page: number = 0) => {
    setExpandedRows({});
    try {
      const res = await fetchActivityLogs(
        filters.action || null,
        filters.user || null,
        filters.table || null,
        filters.startDate || null,
        filters.endDate || null,
        "desc",
        page,
        logsData.pageSize
      );
      setLogsData(res);
      setJumpPage(res.pageNo + 1);
    } catch (error) {
      console.error("Error fetching activity logs", error);
    }
  };

  const handleFilterReset = () => {
    setAction("");
    setUser("");
    setTable("");
    setStartDate("");
    setEndDate("");
    setFilters({
      table: "",
      user: "",
      action: "",
      startDate: "",
      endDate: "",
    });
    handleLogs(0);
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

  useEffect(() => {
    handleLogs(0);
  }, [filters]);

  return (
    <div className="flex min-h-screen w-full container mx-auto static max-w-[1400px]">
      {/* ================= FILTER SIDEBAR ================= */}
      <div className="w-full sm:w-1/4 md:w-1/6 p-6 border absolute left-0 h-full bg-white">
        {/* Filter header with toggle */}
        <div
          className="p-4 border-b flex justify-between items-center cursor-pointer"
          onClick={() => setFiltersVisible((prev) => !prev)}
        >
          <h3 className="text-2xl font-semibold">Filters</h3>
          {filtersVisible ? <ChevronUp /> : <ChevronDown />}
        </div>

        {/* Filter content - only visible when toggled */}
        {filtersVisible && (
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Date Range</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Table */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Table</label>
              <Input
                type="text"
                placeholder="Table name..."
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Action */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Action</label>
              {["create", "update", "delete"].map((a) => (
                <div key={a} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={action === a}
                    onChange={(e) => setAction(e.target.checked ? a : "")}
                  />
                  <label className="capitalize">{a}</label>
                </div>
              ))}
            </div>

            {/* User */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">User</label>
              <Input
                type="text"
                placeholder="Account ID..."
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 space-y-2">
              <Button
                className="w-full"
                onClick={() => setFilters({ table, user, action, startDate, endDate })}
              >
                Apply Filters
              </Button>
              <Button variant="outline" className="w-full" onClick={handleFilterReset}>
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ================= ACTIVITY LOGS TABLE ================= */}
      <div className="py-6 flex-1 justify-center ml-[20%]">
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>EntityID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsData.data.map((log, index) => (
                    <React.Fragment key={index}>
                      <TableRow>
                        <TableCell>{index + 1 + logsData.pageNo * logsData.pageSize}</TableCell>
                        <TableCell>{log.table}</TableCell>
                        <TableCell>{log.entity_id ?? "-"}</TableCell>
                        <TableCell>{log.user_full_name} ({log.user})</TableCell>
                        <TableCell className="capitalize">{log.method}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>{format(new Date(log.timestamp), "dd/MM/yyyy HH:mm")}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRow(index)}
                          >
                            {expandedRows[index] ? "Hide" : "View"} Details
                          </Button>
                        </TableCell>
                      </TableRow>

                      {expandedRows[index] && (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <div className="flex gap-4 p-4 border-t bg-gray-100">
                              {/* Old and New State tables */}
                              {["original_data", "updated_data"].map((key) => {
                                const title = key === "original_data" ? "Old State" : "New State";
                                const data = log[key as "original_data" | "updated_data"];
                                const compare = log[key === "original_data" ? "updated_data" : "original_data"];
                                const mode = key === "original_data" ? "old" : "new";
                                return (
                                  <div key={key} className="w-full sm:w-1/2 border rounded-md p-2 bg-white shadow-md">
                                    <h3 className="text-sm font-semibold mb-2">{title}</h3>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Attribute</TableHead>
                                          <TableHead>Value</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {data && Object.keys(data).length > 0 ? (
                                          Object.entries(data).map(([attr, val]) => {
                                            const isDeleted = mode === "old" && compare && Object.keys(compare).length === 0;
                                            const isCreated = mode === "new" && compare && Object.keys(compare).length === 0;
                                            const isUpdated = !isDeleted && !isCreated && compare && compare[attr] !== val;
                                            return (
                                              <TableRow key={attr}>
                                                <TableCell className={`font-semibold ${isUpdated ? "text-yellow-600" : isDeleted ? "text-red-500" : isCreated ? "text-green-500" : "text-gray-500"}`}>
                                                  {attr}
                                                </TableCell>
                                                <TableCell className={`${isUpdated ? "bg-yellow-200" : isDeleted ? "bg-red-200" : isCreated ? "bg-green-200" : ""}`}>
                                                  {String(val)}
                                                </TableCell>
                                              </TableRow>
                                            );
                                          })
                                        ) : (
                                          <TableRow>
                                            <TableCell colSpan={2} className="text-gray-500 text-center">
                                              No data
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>

              {/* ================= PAGINATION ================= */}
              <div className="flex items-center justify-end gap-2 mt-4">
                <span>
                  Page{" "}
                  <input
                    type="number"
                    className="w-12 text-center border rounded-md"
                    min={1}
                    max={logsData.totalPages || 1}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(Number(e.target.value))}
                  />{" "}
                  of {logsData.totalPages || 1}
                </span>
                <Button variant="outline" size="sm" onClick={handleJump}>
                  Go
                </Button>
                <Button variant="outline" size="sm" disabled={logsData.pageNo <= 0} onClick={() => goToPage(logsData.pageNo - 1)}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={logsData.pageNo >= (logsData.totalPages - 1)} onClick={() => goToPage(logsData.pageNo + 1)}>
                  Next
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLogs;