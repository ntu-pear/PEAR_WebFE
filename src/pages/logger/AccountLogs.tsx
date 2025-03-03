import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fetchAllLogs, LogsTableDataServer } from '@/api/logger/logs';

// Static log data (for testing)
const staticLogData = {
  data: [
    {
      timestamp: "2025-02-14T11:28:18",
      method: "create",
      table: "Doctor Note",
      user: "admin",
      user_full_name:"Jane Doe",
      message:"Created doctor note",
      original_data: null,
      updated_data: {
        doctorRemarks: "Create sth",
        modifiedById: 0,
        doctorId: 1,
        patientId: 4,
        createdById: 0,
        isDeleted: "0"
      }
    },
    {
      timestamp: "2025-02-13T16:02:21",
      method: "create",
      table: "Doctor Note",
      user: "admin",
      user_full_name:"Jane Doe",
      message:"Created doctor note",
      original_data: null,
      updated_data: {
        doctorRemarks: "Testing123",
        modifiedById: 1,
        doctorId: 1,
        patientId: 2,
        createdById: 1,
        isDeleted: "0"
      }
    }
  ],
  pageNo: 0,
  pageSize: 10,
  totalRecords: 2,
  totalPages: 1
};

// Function to generate description based on action
const generateDescription = (method: string, updatedData: any, table: string) => {
  const actionPastTense = method === "create" ? "Created" :
                          method === "update" ? "Updated" :
                          method === "delete" ? "Deleted" :
                          "Modified";

  // Extract the first meaningful attribute from updated_data
  const firstKey = updatedData ? Object.keys(updatedData)[0] : null;
  const firstValue = firstKey ? updatedData[firstKey] : "Data";

  return `${actionPastTense}: ${firstValue} in ${table}`;
};

const AccountLogs: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});
  const [pageNo] = useState(0); // Since we are using static data
  const [table, setTable] = useState('');
  const [user, setUser] = useState('');
  const [action, setAction] = useState('');
  const [timestampDesc, setTimestampDesc] = useState(true)
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
  
  const handleLogs = async () =>{
    try{
      const timestampOrder = timestampDesc? "desc" : "asc";
      const response = await fetchAllLogs(action, user, table, timestampOrder)
      setLogsTDServer(response)
    }
    catch (error) {
      console.log("Error")
    }
  }

  // Toggle row expansion
  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value.toLowerCase());
  };

  // Filter logs based on search
  const filteredData = logsTDServer.logs.filter(
    (log) =>
      log.user.toLowerCase().includes(search) ||
      log.table.toLowerCase().includes(search) ||
      log.method.toLowerCase().includes(search)
  );

  useEffect(() => {
    handleLogs()
  }, [action, user, table, timestampDesc])

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-4">
      <div className="py-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="flex justify-between mb-4">
              <Input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={handleSearch}
                className="w-1/3 border border-gray-300 p-2 rounded-md"
              />
              <Input
                type="text"
                placeholder="dd/mm/yyyy to dd/mm/yyyy"
                className="w-1/3 border border-gray-300 p-2 rounded-md"
              />
            </div>

            {/* Table */}
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
                        <TableCell>{log.updated_data?.patientId || '-'}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.method.charAt(0).toUpperCase() + log.method.slice(1)}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRow(index)}
                          >
                            {expandedRows[index] ? 'Hide' : 'View'} Details
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
                                <h3 className="text-sm font-semibold mb-2">Old State</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Attribute</TableHead>
                                      <TableHead>Value</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {log.original_data ? (
                                      Object.entries(log.original_data).map(([key, value]) => (
                                        <TableRow key={key}>
                                          <TableCell className="font-semibold text-yellow-600">{key}</TableCell>
                                          <TableCell className="bg-yellow-200">{value}</TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={2} className="text-gray-500 text-center">
                                          No previous data
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* New State */}
                              <div className="w-1/2 border rounded-md p-2 bg-white shadow-md">
                                <h3 className="text-sm font-semibold mb-2">New State</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Attribute</TableHead>
                                      <TableHead>Value</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {log.updated_data &&
                                      Object.entries(log.updated_data).map(([key, value]) => (
                                        <TableRow key={key}>
                                          <TableCell className="font-semibold text-green-600">{key}</TableCell>
                                          <TableCell className="bg-green-200">{value}</TableCell>
                                        </TableRow>
                                      ))}
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

export default AccountLogs;
