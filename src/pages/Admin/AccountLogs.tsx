import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import Searchbar from "@/components/Searchbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import useDebounce from "@/hooks/useDebounce";
import { fetchAuditLogs } from "@/api/logger/logs";
import { formatDateTime } from "@/utils/formatDate";

type AuditLogRecord = {
  id?: string | number;
  timestamp: string;
  method: string;
  table: string;
  user: string;
  user_full_name: string;
  patient_id: number | null;
  entity_id: number | null;
  original_data: Record<string, unknown> | null;
  updated_data: Record<string, unknown> | null;
  message: string;
  role: string | null;
};

type AuditLogTableDataServer = {
  page: number;
  page_size: number;
  total: number;
  logs: AuditLogRecord[];
};

const PAGE_SIZE_OPTIONS: (number | string)[] = [5, 10, 20, 50, 100, "All"];

const formatMethod = (method: string) => {
  switch (method?.toLowerCase()) {
    case "create":
      return "Create";
    case "update":
      return "Update";
    case "delete":
      return "Delete";
    default:
      return method ?? "-";
  }
};

const stringifyValue = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getPatientId = (log: AuditLogRecord) => {
  return (
    log.patient_id ??
    ((log.updated_data?.patient_id as number | undefined) ??
      (log.original_data?.patient_id as number | undefined) ??
      "-")
  );
};

const buildDescription = (log: AuditLogRecord) => {
  return log.message || "-";
};

const AccountLogs: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [accountLogsTDServer, setAccountLogsTDServer] =
    useState<AuditLogTableDataServer>({
      page: 0,
      page_size: 10,
      total: 0,
      logs: [],
    });

  const [searchItem, setSearchItem] = useState("");
  const [tabValue, setTabValue] = useState("all");
  const debouncedSearch = useDebounce(searchItem, 300);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchItem(e.target.value);
    },
    []
  );

  const handleFilter = async (pageNo: number, pageSize: number) => {
    try {
      const fetchedLogs = await fetchAuditLogs({
        pageNo,
        pageSize,
        user: debouncedSearch,
      });

      setExpandedRows({});
      setAccountLogsTDServer({
        page: fetchedLogs.pageNo,
        page_size: fetchedLogs.pageSize,
        total: fetchedLogs.totalRecords,
        logs: fetchedLogs.data,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error fetching account logs");
    }
  };

  const handlePageChange = async (newPage: number) => {
    const totalPages = Math.ceil(
      accountLogsTDServer.total / accountLogsTDServer.page_size
    );

    if (newPage < 1 || newPage > totalPages) return;
    await handleFilter(newPage - 1, accountLogsTDServer.page_size);
  };

  const handlePageSizeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    const newPageSize =
      value === "All"
        ? Math.max(accountLogsTDServer.total, 1)
        : Number(value);

    await handleFilter(0, newPageSize);
  };

  const toggleRow = (rowKey: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  useEffect(() => {
    handleFilter(0, accountLogsTDServer.page_size || 10);
  }, [debouncedSearch]);

  const { page, page_size, total, logs } = accountLogsTDServer;
  const totalPages = Math.max(Math.ceil(total / page_size), 1);
  const currentPage = page + 1;
  const startRecord = total === 0 ? 0 : page * page_size + 1;
  const endRecord = total === 0 ? 0 : page * page_size + logs.length;

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 sm:pr-14">
        <div className="flex items-center">
          {/* <Searchbar
            searchItem={searchItem}
            onSearchChange={handleInputChange}
            placeholder="Search by user ID..."
            ariaLabel="Search logs"
          /> */}
        </div>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Account Logs</CardTitle>
                  <CardDescription>
                    View user audit logs and activity history.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {logs.length === 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-gray-500">No data found</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Actor</TableHead>
                              <TableHead>User ID</TableHead>
                              <TableHead>Table</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>Patient ID</TableHead>
                              <TableHead>Entity ID</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Date Time</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {logs.map((log, index) => {
                              const rowKey = `${log.timestamp}-${log.entity_id ?? index}-${index}`;

                              return (
                                <React.Fragment key={rowKey}>
                                  <TableRow>
                                    <TableCell>{log.user_full_name || "-"}</TableCell>
                                    <TableCell>{log.user || "-"}</TableCell>
                                    <TableCell>{log.table || "-"}</TableCell>
                                    <TableCell>{formatMethod(log.method)}</TableCell>
                                    <TableCell>{getPatientId(log)}</TableCell>
                                    <TableCell>{log.entity_id ?? "-"}</TableCell>
                                    <TableCell className="max-w-[320px] whitespace-normal break-words">
                                      {buildDescription(log)}
                                    </TableCell>
                                    <TableCell>
                                      {formatDateTime(log.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleRow(rowKey)}
                                      >
                                        {expandedRows[rowKey] ? "Hide" : "View"} Details
                                      </Button>
                                    </TableCell>
                                  </TableRow>

                                  {expandedRows[rowKey] && (
                                    <TableRow>
                                      <TableCell colSpan={9}>
                                        <div className="flex flex-col lg:flex-row gap-4 p-4 border-t bg-gray-50">
                                          <div className="w-full lg:w-1/2 border rounded-md p-3 bg-white shadow-sm">
                                            <h3 className="text-sm font-semibold mb-3">
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
                                                {log.original_data &&
                                                Object.keys(log.original_data).length > 0 ? (
                                                  Object.entries(log.original_data).map(
                                                    ([key, value]) => {
                                                      const isRowDeleted =
                                                        log.updated_data &&
                                                        Object.keys(log.updated_data)
                                                          .length === 0;

                                                      const newValue =
                                                        log.updated_data?.[key];
                                                      const isRowUpdated =
                                                        !isRowDeleted &&
                                                        stringifyValue(newValue) !==
                                                          stringifyValue(value);

                                                      return (
                                                        <TableRow key={`old-${key}`}>
                                                          <TableCell
                                                            className={`font-semibold ${
                                                              isRowUpdated
                                                                ? "text-yellow-600"
                                                                : isRowDeleted
                                                                  ? "text-red-500"
                                                                  : "text-gray-500"
                                                            }`}
                                                          >
                                                            {key}
                                                          </TableCell>
                                                          <TableCell
                                                            className={`${
                                                              isRowUpdated
                                                                ? "bg-yellow-100"
                                                                : isRowDeleted
                                                                  ? "bg-red-100"
                                                                  : ""
                                                            }`}
                                                          >
                                                            {stringifyValue(value)}
                                                          </TableCell>
                                                        </TableRow>
                                                      );
                                                    }
                                                  )
                                                ) : (
                                                  <TableRow>
                                                    <TableCell
                                                      colSpan={2}
                                                      className="text-center text-gray-500"
                                                    >
                                                      No previous data
                                                    </TableCell>
                                                  </TableRow>
                                                )}
                                              </TableBody>
                                            </Table>
                                          </div>

                                          <div className="w-full lg:w-1/2 border rounded-md p-3 bg-white shadow-sm">
                                            <h3 className="text-sm font-semibold mb-3">
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
                                                Object.keys(log.updated_data).length > 0 ? (
                                                  Object.entries(log.updated_data).map(
                                                    ([key, value]) => {
                                                      const isRowCreated =
                                                        log.original_data &&
                                                        Object.keys(log.original_data)
                                                          .length === 0;

                                                      const oldValue =
                                                        log.original_data?.[key];
                                                      const isRowUpdated =
                                                        !isRowCreated &&
                                                        stringifyValue(oldValue) !==
                                                          stringifyValue(value);

                                                      return (
                                                        <TableRow key={`new-${key}`}>
                                                          <TableCell
                                                            className={`font-semibold ${
                                                              isRowUpdated
                                                                ? "text-yellow-600"
                                                                : isRowCreated
                                                                  ? "text-green-600"
                                                                  : "text-gray-500"
                                                            }`}
                                                          >
                                                            {key}
                                                          </TableCell>
                                                          <TableCell
                                                            className={`${
                                                              isRowUpdated
                                                                ? "bg-yellow-100"
                                                                : isRowCreated
                                                                  ? "bg-green-100"
                                                                  : ""
                                                            }`}
                                                          >
                                                            {stringifyValue(value)}
                                                          </TableCell>
                                                        </TableRow>
                                                      );
                                                    }
                                                  )
                                                ) : (
                                                  <TableRow>
                                                    <TableCell
                                                      colSpan={2}
                                                      className="text-center text-gray-500"
                                                    >
                                                      No updated data
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
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-6">
                          <div className="text-xs text-muted-foreground">
                            Showing <strong>{startRecord}-{endRecord}</strong> of{" "}
                            <strong>{total}</strong> records
                          </div>

                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Items per page</p>
                            <select
                              value={page_size >= total && total > 0 ? "All" : page_size}
                              onChange={handlePageSizeChange}
                              className="h-8 w-[80px] rounded-md border px-2 text-sm"
                            >
                              {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size.toString()} value={size.toString()}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || page_size >= total}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || page_size >= total}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AccountLogs;