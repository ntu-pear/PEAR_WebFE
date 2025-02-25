import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DataTableRow from "./DataTableRow";
import { Button } from "@/components/ui/button";

export interface TableRowData {
  id: string | number;
  [key: string]: any;
}

interface DataTableClientProps<T extends TableRowData> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
  }>;
  itemsPerPage?: number; // Optional prop to specify number of items per page
  viewMore: boolean;
  viewMoreBaseLink?: string;
  activeTab?: string;
  hideActionsHeader?: boolean;
  className?: string;
  renderActions?: (item: T) => React.ReactNode; // New prop to customize actions column
}

export interface ServerPagination {
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface DataTableServerProps<T extends TableRowData> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
  }>;
  pagination: ServerPagination;
  viewMore: boolean;
  viewMoreBaseLink?: string;
  activeTab?: string;
  hideActionsHeader?: boolean;
  className?: string;
  renderActions?: (item: T) => React.ReactNode; // New prop to customize actions column
  fetchData: (pageNo: number, pageSize: number) => void;
}

// Data Table with Client Pagination
export function DataTableClient<T extends TableRowData>({
  data,
  columns,
  itemsPerPage = 10, // Default to 10 items per page
  viewMore,
  viewMoreBaseLink,
  activeTab,
  hideActionsHeader = false, //default show actions header
  className = "",
  renderActions, // Accept renderActions function as a prop
}: DataTableClientProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the total number of pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Get the data to display for the current page
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) {
      setCurrentPage(1);
    } else if (newPage > totalPages) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage(newPage);
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <p className="text-gray-500">No data found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className={`cursor-pointer ${column.className || ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
              {hideActionsHeader ? null : (
                <TableHead className="pl-9">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <DataTableRow
                key={item.id}
                item={item}
                columns={columns}
                viewMore={viewMore}
                viewMoreLink={`${viewMoreBaseLink}/${item.id}${
                  activeTab ? `?tab=${activeTab}` : ""
                }`}
                renderActions={renderActions} // Pass the custom renderActions function
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Information and Controls */}
      {data.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <strong>
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, data.length)}
            </strong>{" "}
            of <strong>{data.length}</strong> records
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DataTableServer<T extends TableRowData>({
  data,
  columns,
  pagination,
  viewMore,
  viewMoreBaseLink,
  activeTab,
  hideActionsHeader = false, //default show actions header
  className = "",
  renderActions, // Accept renderActions function as a prop
  fetchData,
}: DataTableServerProps<T>) {
  const { pageNo, pageSize, totalRecords, totalPages } = pagination;

  // think pageNo is page offset
  const currentPage = pageNo + 1;

  // Handle page changes
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return; // Skip invalid pages
    }
    await fetchData(newPage - 1, pageSize); // Pass page offset and pageSize
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <p className="text-gray-500">No data found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className={`cursor-pointer ${column.className || ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
              {hideActionsHeader ? null : (
                <TableHead className="pl-9">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <DataTableRow
                key={item.id}
                item={item}
                columns={columns}
                viewMore={viewMore}
                viewMoreLink={`${viewMoreBaseLink}/${item.id}${
                  activeTab ? `?tab=${activeTab}` : ""
                }`}
                renderActions={renderActions} // Pass the custom renderActions function
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Information and Controls 
       start of page = pageNo (Offset) * pageSize + 1
       end of page = currentPage * pageSize or totalRecords whichever is smaller
      
      */}
      {data.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <strong>
              {pageNo * pageSize + 1}-{pageNo * pageSize + data.length}
            </strong>{" "}
            of <strong>{totalRecords}</strong> records
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
