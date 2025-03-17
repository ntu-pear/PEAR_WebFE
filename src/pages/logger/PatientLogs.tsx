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

const PatientLogs: React.FC = () => {
  const [search /*setSearch*/] = useState("");
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  //const [pageNo] = useState(0); // Since we are using static data
  const [table, setTable] = useState("");
  const [user, setUser] = useState("");
  const [action, setAction] = useState("");
  const [patient, setPatient] = useState("");
  const [filters, setFilters] = useState({
    table: "",
    user: "",
    patient: "",
    action: "",
  });
  const [logsTDServer, setLogsTDServer] = useState<LogsTableDataServer>({
    logs: [],
    pagination: {
      pageNo: 0,
      pageSize: 0,
      totalRecords: 0,
      totalPages: 0,
    },
  });
  // Using static data instead of fetching

  const handleLogs = async () => {
    console.log("Calling logger ", filters);
    try {
      const response = await fetchAllLogs(
        filters.action,
        filters.user,
        filters.table,
        "desc"
      );
      setLogsTDServer(response);
    } catch (error) {
      console.log("Error");
    }
  };
  const handleFilterReset = () => {
    setAction("");
    setUser("");
    setPatient("");
    setTable("");
    setFilters({ table: "", user: "", patient: "", action: "" });
  };

  // Toggle row expansion
  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Filter logs based on search
  const filteredData = logsTDServer.logs.filter(
    (log) =>
      log.user.toLowerCase().includes(search) ||
      log.table.toLowerCase().includes(search) ||
      log.method.toLowerCase().includes(search)
  );

  useEffect(() => {
    handleLogs();
  }, [filters]);

  return (
    <div className="flex min-h-screen w-full container mx-auto static">
      <div className="w-1/6 p-6 border absolute left-0 h-full bg-white">
        <div className="p-4 border-b items-center">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            Filters
          </h3>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Date Range</label>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">Start Date</span>
                <Input type="date" className="w-full mt-1" />
              </div>
              <div>
                <span className="text-xs text-gray-500">End Date</span>
                <Input type="date" className="w-full mt-1" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Patient</label>
            <Input
              type="text"
              placeholder="Search accounts..."
              className="w-full"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Action</label>
            <div className="space-y-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="action-view"
                  className="mr-2"
                  checked={action === "Create"}
                  onChange={(e) => setAction(e.target.checked ? "Create" : "")}
                />
                <label htmlFor="action-view" className="text-sm">
                  Create
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="action-edit"
                  className="mr-2"
                  checked={action === "Update"}
                  onChange={(e) => setAction(e.target.checked ? "Update" : "")}
                />
                <label htmlFor="action-edit" className="text-sm">
                  Update
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="action-delete"
                  className="mr-2"
                  checked={action === "Delete"}
                  onChange={(e) => setAction(e.target.checked ? "Delete" : "")}
                />
                <label htmlFor="action-delete" className="text-sm">
                  Delete
                </label>
              </div>
            </div>
          </div>

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

          <div className="pt-2">
            <Button
              className="w-full"
              onClick={() => setFilters({ table, user, patient, action })}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => handleFilterReset()}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
      <div className="py-6 flex-1 justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Account Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Log AccountID</TableHead>
                    <TableHead>PatientID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((log, index) => (
                    <React.Fragment key={index}>
                      <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {log.updated_data?.patientId || "-"}
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>
                          {log.method.charAt(0).toUpperCase() +
                            log.method.slice(1)}
                        </TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>
                          {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm")}
                        </TableCell>
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
                      {/* Expanded row for Old vs. New state */}
                      {expandedRows[index] && (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <div className="flex gap-4 p-4 border-t bg-gray-100">
                              {/* Old State */}
                              <div className="w-1/2 border rounded-md p-2 bg-white shadow-md">
                                <h3 className="text-sm font-semibold mb-2">
                                  Old State
                                </h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Attribute</TableHead>
                                      <TableHead>Value</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {log.original_data ? (
                                      Object.entries(log.original_data).map(
                                        ([key, value]) => (
                                          <TableRow key={key}>
                                            <TableCell className="font-semibold text-yellow-600">
                                              {key}
                                            </TableCell>
                                            <TableCell className="bg-yellow-200">
                                              {value}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )
                                    ) : (
                                      <TableRow>
                                        <TableCell
                                          colSpan={2}
                                          className="text-gray-500 text-center"
                                        >
                                          No previous data
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* New State */}
                              <div className="w-1/2 border rounded-md p-2 bg-white shadow-md">
                                <h3 className="text-sm font-semibold mb-2">
                                  New State
                                </h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Attribute</TableHead>
                                      <TableHead>Value</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {log.updated_data &&
                                      Object.entries(log.updated_data).map(
                                        ([key, value]) => (
                                          <TableRow key={key}>
                                            <TableCell className="font-semibold text-green-600">
                                              {key}
                                            </TableCell>
                                            <TableCell className="bg-green-200">
                                              {value}
                                            </TableCell>
                                          </TableRow>
                                        )
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
            {/* Pagination */}
            {/* <div className="flex justify-between items-center mt-4">
              <Button
                className="bg-gray-300"
                disabled={pageNo === 0}
                onClick={() => pageNo((prev: number) => Math.max(prev - 1, 0))}
              >
                Previous
              </Button>
              <span className="text-gray-600">Page {pageNo + 1} / {data?.totalPages || 1}</span>
              <Button
                className="bg-gray-300"
                disabled={pageNo >= (data?.totalPages || 1) - 1}
                onClick={() => pageNo((prev: number) => prev + 1)}
              >
                Next
              </Button>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogs;
