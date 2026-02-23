import React, { useState, useMemo, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTableRow from "./DataTableRow";
import { Button } from "@/components/ui/button";

export interface TableRowData {
  id: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

type DataTableColumn<T extends Record<string, any>> = {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  className?: string;
};

export type DataTableColumns<T extends Record<string, any>> = Array<
  DataTableColumn<T>
>;

interface DataTableClientProps<T extends TableRowData> {
  data: T[];
  columns: DataTableColumns<T>;
  itemsPerPage?: number; // Optional prop to specify number of items per page
  viewMore: boolean;
  viewMoreBaseLink?: string;
  activeTab?: string;
  hideActionsHeader?: boolean;
  className?: string;
  renderActions?: (item: T) => React.ReactNode; // New prop to customize actions column
  expandable?: boolean;
  renderExpandedContent?: (item: T) => React.ReactNode;
  onExpand?: (item: T) => void;
  selectable?: boolean;
  selectedItems?: T[];
  onSelectChange?: (selected: T[]) => void;
  getRowId?: (item: T) => string | number;
  getViewMoreId?: (item: T) => string | number

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
    sortable?: boolean; // Add sortable property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  fetchData: (
    pageNo: number,
    pageSize: number,
    sortColumn?: string,
    sortDirection?: "asc" | "desc"
  ) => void;
  sortBy?: string | null; // Add sorting props
  sortDir?: "asc" | "desc";
  onSort?: (column: string) => void;
  onPageSizeChange?: (pageSize: number | string) => void; // Add page size change handler
  pageSizeOptions?: (number | string)[]; // Add configurable page size options
  expandable?: boolean;
  renderExpandedContent?: (item: T) => React.ReactNode;
  onExpand?: (item: T) => void;
  getRowId?: (item: T) => string | number;
  getViewMoreId?: (item: T) => string | number;

}

// Data Table with Client Pagination
export function DataTableClient<T extends TableRowData>({
  data,
  columns,
  getRowId,
  getViewMoreId,
  itemsPerPage = 10, // Default to 10 items per page
  viewMore,
  viewMoreBaseLink,
  activeTab,
  hideActionsHeader = false, //default show actions header
  className = "",
  renderActions, // Accept renderActions function as a prop
  expandable = false,
  renderExpandedContent,
  onExpand,
  selectable = false,
  selectedItems,
  onSelectChange,


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

  useEffect(() => {
    if (data.length !== 0 && totalPages < currentPage)
      setCurrentPage(totalPages);
  }, []);

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
              {selectable && selectedItems && onSelectChange && (
                <TableHead className="w-12 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === data.length && data.length > 0
                    }
                    onChange={() => {
                      const allSelected = selectedItems.length === data.length;
                      onSelectChange(allSelected ? [] : data);
                    }}
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
                  />
                </TableHead>
              )}
              {expandable && <TableHead className="w-12"></TableHead>}
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
            {paginatedData.map((item) => {
              const rowId = getRowId ? getRowId(item) : item.id;
              const viewId = getViewMoreId ? getViewMoreId(item) : rowId;

              const isSelected =
                selectable &&
                selectedItems &&
                selectedItems.some((i) => (getRowId ? getRowId(i) : i.id) === rowId);

              return (
                <DataTableRow
                  key={rowId}
                  item={item}
                  columns={columns}
                  viewMore={viewMore}
                  viewMoreLink={
                    viewMoreBaseLink
                      ? `${viewMoreBaseLink}/${viewId}${activeTab ? `?tab=${activeTab}` : ""}`
                      : undefined
                  }
                  renderActions={renderActions}
                  expandable={expandable}
                  renderExpandedContent={renderExpandedContent}
                  onExpand={onExpand}
                  selectable={selectable}
                  isSelected={isSelected}
                  onToggleSelect={() => {
                    if (!selectedItems || !onSelectChange) return;
                    const exists = selectedItems.some(
                      (i) => (getRowId ? getRowId(i) : i.id) === rowId
                    );
                    const newSelected = exists
                      ? selectedItems.filter((i) => (getRowId ? getRowId(i) : i.id) !== rowId)
                      : [...selectedItems, item];
                    onSelectChange(newSelected);
                  }}
                />
              );
            })}
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
  sortBy,
  sortDir,
  onSort,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100], // Default page size options
  expandable = false,
  renderExpandedContent,
  onExpand,
  getRowId,
  getViewMoreId,

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
              {expandable && <TableHead className="w-12"></TableHead>}
              {columns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className={`${column.className || ""} ${column.sortable ? "cursor-pointer select-none" : ""}`}
                  onClick={() =>
                    column.sortable && onSort && onSort(column.key.toString())
                  }
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortBy === column.key.toString() ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
              {hideActionsHeader ? null : (
                <TableHead className="pl-9">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const rowId = getRowId ? getRowId(item) : item.id;
              const viewId = getViewMoreId ? getViewMoreId(item) : rowId;

              return (
                <DataTableRow
                  key={rowId}
                  item={item}
                  columns={columns}
                  viewMore={viewMore}
                  viewMoreLink={
                    viewMoreBaseLink
                      ? `${viewMoreBaseLink}/${viewId}${activeTab ? `?tab=${activeTab}` : ""}`
                      : undefined
                  }
                  renderActions={renderActions}
                  expandable={expandable}
                  renderExpandedContent={renderExpandedContent}
                  onExpand={onExpand}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Information and Controls 
       start of page = pageNo (Offset) * pageSize + 1
       end of page = currentPage * pageSize or totalRecords whichever is smaller
      
      */}
      {data.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-6">
            <div className="text-xs text-muted-foreground">
              Showing{" "}
              <strong>
                {pageNo * pageSize + 1}-{pageNo * pageSize + data.length}
              </strong>{" "}
              of <strong>{totalRecords}</strong> records
            </div>
            {onPageSizeChange && (
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Items per page</p>
                <Select
                  value={pageSize >= totalRecords ? "All" : pageSize.toString()}
                  onValueChange={(value) => onPageSizeChange(value === "All" ? "All" : parseInt(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize >= totalRecords ? "All" : pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || pageSize >= totalRecords}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || pageSize >= totalRecords}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
