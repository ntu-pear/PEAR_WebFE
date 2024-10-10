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

interface DataTableProps<T extends TableRowData> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  itemsPerPage?: number; // Optional prop to specify number of items per page
  viewMore: boolean;
  renderActions?: (item: T) => React.ReactNode; // New prop to customize actions column
}

function DataTable<T extends TableRowData>({
  data,
  columns,
  itemsPerPage = 10, // Default to 10 items per page
  viewMore,
  renderActions, // Accept renderActions function as a prop
}: DataTableProps<T>) {
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
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className="cursor-pointer"
                >
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="pl-9">Actions</TableHead> 
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <DataTableRow
                key={item.id}
                item={item}
                columns={columns}
                viewMore={viewMore}
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

export default DataTable;
