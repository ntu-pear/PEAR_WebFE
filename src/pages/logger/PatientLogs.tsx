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
import { fetchAllLogs, LogsTableDataServer } from "@/api/logger/logs";
import { ChevronDown, ChevronUp } from "lucide-react";

const PatientLogs: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});
  const [table, setTable] = useState("");
  const [user, setUser] = useState("");
  const [action, setAction] = useState("");
  const [patient, setPatient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(true); // <-- toggle

  const [filters, setFilters] = useState({
    table: "",
    user: "",
    patient: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState(1);

  const [logsTDServer, setLogsTDServer] = useState<LogsTableDataServer>({
    logs: [],
    pagination: {
      pageNo: 0,
      pageSize: 0,
      totalRecords: 0,
      totalPages: 0,
    },
  });

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLogs = async () => {
    setExpandedRows({});
    try {
      const response = await fetchAllLogs(
        filters.action,
        filters.user,
        filters.table,
        filters.patient,
        filters.startDate,
        filters.endDate,
        "desc",
        currentPage,
        pageSize
      );
      setLogsTDServer(response);
    } catch (error) {
      console.log("Error fetching logs", error);
    }
  };

  const handleFilterReset = () => {
    setAction("");
    setUser("");
    setPatient("");
    setTable("");
    setStartDate("");
    setEndDate("");
    setFilters({
      table: "",
      user: "",
      patient: "",
      action: "",
      startDate: "",
      endDate: "",
    });
    setExpandedRows({});
    setCurrentPage(0);
    setJumpPage(1);
  };

  const handleJumpPage = () => {
    const page = Math.max(1, Math.min(Number(jumpPage), logsTDServer.pagination.totalPages));
    setCurrentPage(page - 1); // API is 0-indexed
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
    setJumpPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, logsTDServer.pagination.totalPages - 1));
    setJumpPage((prev) => Math.min(prev + 1, logsTDServer.pagination.totalPages));
  };

  useEffect(() => {
    handleLogs();
  }, [filters, currentPage, pageSize]);

  return (
    <div className="flex min-h-screen w-full container mx-auto static max-w-[1400px]">
      {/* ================= FILTER SIDEBAR ================= */}
      <div className="w-full sm:w-1/4 md:w-1/6 p-6 border absolute left-0 h-full bg-white">
        {/* Filter header with toggle */}
        <div
          className="p-4 border-b flex justify-between items-center cursor-pointer"
          onClick={() => setFiltersVisible((prev) => !prev)}
        >
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Filters</h3>
          {filtersVisible ? <ChevronUp /> : <ChevronDown />}
        </div>

        {/* Filter content */}
        {filtersVisible && (
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Date Range</label>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Start Date</span>
                  <Input
                    type="date"
                    className="w-full mt-1"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500">End Date</span>
                  <Input
                    type="date"
                    className="w-full mt-1"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Patient */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Patient</label>
              <Input
                type="text"
                placeholder="Search patients..."
                className="w-full"
                value={patient}
                onChange={(e) => setPatient(e.target.value)}
              />
            </div>

            {/* Action */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Action</label>
              <div className="space-y-1">
                {["Create", "Update", "Delete"].map((a) => (
                  <div key={a} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={action === a}
                      onChange={(e) => setAction(e.target.checked ? a : "")}
                    />
                    <label className="text-sm">{a}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* User */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Account ID</label>
              <Input
                type="text"
                placeholder="Search accounts..."
                className="w-full"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="pt-2">
              <Button
                className="w-full"
                onClick={() => setFilters({ table, user, patient, action, startDate, endDate })}
              >
                Apply Filters
              </Button>
              <Button variant="outline" className="w-full mt-2" onClick={handleFilterReset}>
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ================= PATIENT LOGS TABLE ================= */}
      <div className="py-6 flex-1 justify-center ml-[20%]">
        <Card>
          <CardHeader>
            <CardTitle>Patient Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>PatientID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsTDServer.logs.map((log, index) => (
                    <React.Fragment key={index}>
                      <TableRow>
                        <TableCell>{index + 1 + currentPage * pageSize}</TableCell>
                        <TableCell>{log.patient_id || "-"}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.method.charAt(0).toUpperCase() + log.method.slice(1)}</TableCell>
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

                      {/* Expanded row */}
                      {expandedRows[index] && (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <div className="flex gap-4 p-4 border-t bg-gray-100">
                              <div className="w-full sm:w-1/2 border rounded-md p-2 bg-white shadow-md">
                                <h3 className="text-sm font-semibold mb-2">Old State</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Attribute</TableHead>
                                      <TableHead>Value</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {log.original_data
                                      ? Object.entries(log.original_data).map(([key, value]) => (
                                          <TableRow key={key}>
                                            <TableCell className="font-semibold text-gray-500">{key}</TableCell>
                                            <TableCell>{value}</TableCell>
                                          </TableRow>
                                        ))
                                      : (
                                        <TableRow>
                                          <TableCell colSpan={2} className="text-gray-500 text-center">
                                            No previous data
                                          </TableCell>
                                        </TableRow>
                                      )}
                                  </TableBody>
                                </Table>
                              </div>
                              <div className="w-full sm:w-1/2 border rounded-md p-2 bg-white shadow-md">
                                <h3 className="text-sm font-semibold mb-2">New State</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Attribute</TableHead>
                                      <TableHead>Value</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {log.updated_data
                                      ? Object.entries(log.updated_data).map(([key, value]) => (
                                          <TableRow key={key}>
                                            <TableCell className="font-semibold text-gray-500">{key}</TableCell>
                                            <TableCell>{value}</TableCell>
                                          </TableRow>
                                        ))
                                      : (
                                        <TableRow>
                                          <TableCell colSpan={2} className="text-gray-500 text-center">
                                            No new data
                                          </TableCell>
                                        </TableRow>
                                      )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* ================= PAGINATION CONTROLS ================= */}
            <div className="flex items-center justify-end gap-2 mt-4">
              
              <span>
                Page{" "}
                <input
                  type="number"
                  className="w-12 text-center border rounded-md"
                  value={jumpPage}
                  min={1}
                  max={logsTDServer.pagination.totalPages || 1}
                  onChange={(e) => setJumpPage(Number(e.target.value))}
                />{" "}
                / {logsTDServer.pagination.totalPages || 1}
              </span>
              <Button variant="outline" size="sm" onClick={handleJumpPage}>
                Go
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentPage === 0}>
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage >= (logsTDServer.pagination.totalPages - 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogs;