// src/components/Table/DataTable.tsx
import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead as TableHeadCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DataTableRow from "./DataTableRow";

export interface TableRowData {
  id: string | number;
  [key: string]: any;
}

type DataTableColumn<T extends Record<string, any>> = {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean; // for server-side
};

export type DataTableColumns<T extends Record<string, any>> = Array<
  DataTableColumn<T>
>;

/* =========================
   CLIENT-SIDE TABLE
========================= */
interface DataTableClientProps<T extends TableRowData> {
  data: T[];
  columns: DataTableColumns<T>;
  itemsPerPage?: number;
  viewMore: boolean;
  viewMoreBaseLink?: string;
  activeTab?: string;
  hideActionsHeader?: boolean;
  className?: string;
  renderActions?: (item: T) => React.ReactNode;
  expandable?: boolean;
  renderExpandedContent?: (item: T) => React.ReactNode;
  onExpand?: (item: T) => void;
  selectable?: boolean;
  selectedItems?: T[];
  onSelectChange?: (selected: T[]) => void;
  loading?: boolean; // ✅ Add loading prop
}

export function DataTableClient<T extends TableRowData>({
  data,
  columns,
  itemsPerPage = 10,
  viewMore,
  viewMoreBaseLink,
  activeTab,
  hideActionsHeader = false,
  className = "",
  renderActions,
  expandable = false,
  renderExpandedContent,
  onExpand,
  selectable = false,
  selectedItems,
  onSelectChange,
  loading = false,
}: DataTableClientProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const [rowsInput, setRowsInput] = useState(itemsPerPage);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const [jumpPage, setJumpPage] = useState(1);

  const total = data.length;
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage));

  const current = Math.min(jumpPage, pageCount);

  const startIndex = (current - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + paginatedData.length, total);

  const goToPage = (p: number) => {
    if (p >= 1 && p <= pageCount) {
      setJumpPage(p);
    }
  };

  const handleJump = () => {
    const p = Math.max(1, Math.min(jumpPage, pageCount));
    goToPage(p);
  };

  const handleRowsChange = () => {
    const newSize = Math.max(1, rowsInput || 1);
    setRowsPerPage(newSize);
    setJumpPage(1);
  };

  useEffect(() => {
    if (data.length !== 0 && totalPages < currentPage) setCurrentPage(totalPages);
  }, [data.length, totalPages, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
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
                <TableHeadCell className="w-12 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === data.length && data.length > 0}
                    onChange={() =>
                      onSelectChange(
                        selectedItems.length === data.length ? [] : data
                      )
                    }
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
                  />
                </TableHeadCell>
              )}
              {expandable && <TableHeadCell className="w-12"></TableHeadCell>}
              {columns.map((column) => (
                <TableHeadCell
                  key={column.key.toString()}
                  className={`cursor-pointer ${column.className || ""}`}
                >
                  {column.header}
                </TableHeadCell>
              ))}
              {!hideActionsHeader && <TableHeadCell className="pl-9">Actions</TableHeadCell>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <DataTableRow
                key={item.id}
                item={item}
                columns={columns}
                viewMore={viewMore}
                viewMoreLink={`${viewMoreBaseLink}/${item.id}${activeTab ? `?tab=${activeTab}` : ""}`}
                renderActions={renderActions}
                expandable={expandable}
                renderExpandedContent={renderExpandedContent}
                onExpand={onExpand}
                selectable={selectable}
                isSelected={selectable && selectedItems?.includes(item)}
                onToggleSelect={() => {
                  if (!selectedItems || !onSelectChange) return;
                  const newSelected = selectedItems.includes(item)
                    ? selectedItems.filter((i) => i.id !== item.id)
                    : [...selectedItems, item];
                  onSelectChange(newSelected);
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-6 py-3 text-sm text-muted-foreground">
  
        <div>
          {total === 0
            ? "Showing 0 of 0 records"
            : `Showing ${showingFrom}-${showingTo} of ${total} records`}
        </div>

        <div className="flex items-center gap-2">

          {/* Rows per page */}
          <span>Rows</span>
          <input
            type="number"
            min={1}
            value={rowsInput}
            onChange={(e) => setRowsInput(Number(e.target.value))}
            className="w-16 text-center border rounded-md px-2 py-1 text-sm"
          />
          <Button size="sm" variant="outline" onClick={handleRowsChange}>
            Change
          </Button>

          {/* Jump page */}
          <span>Page</span>
          <input
            type="number"
            min={1}
            max={pageCount}
            value={jumpPage}
            onChange={(e) => setJumpPage(Number(e.target.value))}
            className="w-16 text-center border rounded-md px-2 py-1 text-sm"
          />
          <span>of {pageCount}</span>

          <Button size="sm" variant="outline" onClick={handleJump}>
            Go
          </Button>

          {/* Prev / Next */}
          <Button
            size="sm"
            variant="outline"
            disabled={current <= 1}
            onClick={() => goToPage(current - 1)}
          >
            Prev
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={current >= pageCount}
            onClick={() => goToPage(current + 1)}
          >
            Next
          </Button>

        </div>
      </div>
    </div>
  );
}

/* =========================
   SERVER-SIDE TABLE
========================= */
export interface ServerPagination {
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface DataTableServerProps<T extends TableRowData> {
  data: T[];
  columns: DataTableColumns<T>;
  pagination: ServerPagination;
  viewMore: boolean;
  viewMoreBaseLink?: string;
  activeTab?: string;
  hideActionsHeader?: boolean;
  className?: string;
  renderActions?: (item: T) => React.ReactNode;
  fetchData: (pageNo: number, pageSize: number, sortColumn?: string, sortDirection?: "asc" | "desc") => void;
  sortBy?: string | null;
  sortDir?: "asc" | "desc";
  onSort?: (column: string) => void;
  onPageSizeChange?: (pageSize: number | string) => void;
  pageSizeOptions?: (number | string)[];
  expandable?: boolean;
  renderExpandedContent?: (item: T) => React.ReactNode;
  onExpand?: (item: T) => void;
  loading?: boolean;
}

export function DataTableServer<T extends TableRowData>({
  data,
  columns,
  pagination,
  viewMore,
  viewMoreBaseLink,
  activeTab,
  hideActionsHeader = false,
  className = "",
  renderActions,
  fetchData,
  sortBy,
  sortDir,
  onSort,
  expandable = false,
  renderExpandedContent,
  onExpand,
  loading = false,
}: DataTableServerProps<T>) {
  const { pageNo, pageSize, totalRecords, totalPages } = pagination;
  const currentPage = pageNo + 1;

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    await fetchData(newPage - 1, pageSize);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
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
              {expandable && <TableHeadCell className="w-12"></TableHeadCell>}
              {columns.map((column) => (
                <TableHeadCell
                  key={column.key.toString()}
                  className={`${column.className || ""} ${column.sortable ? "cursor-pointer" : ""}`}
                  onClick={() => column.sortable && onSort?.(column.key.toString())}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      sortBy === column.key.toString() ? (
                        sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableHeadCell>
              ))}
              {!hideActionsHeader && <TableHeadCell className="pl-9">Actions</TableHeadCell>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <DataTableRow
                key={item.id}
                item={item}
                columns={columns}
                viewMore={viewMore}
                viewMoreLink={`${viewMoreBaseLink}/${item.id}${activeTab ? `?tab=${activeTab}` : ""}`}
                renderActions={renderActions}
                expandable={expandable}
                renderExpandedContent={renderExpandedContent}
                onExpand={onExpand}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{pageNo * pageSize + 1}-{pageNo * pageSize + data.length}</strong> of <strong>{totalRecords}</strong> records
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