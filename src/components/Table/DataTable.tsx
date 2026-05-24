import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead as TableHeadCell,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TruncatedCell from "./TruncatedCell";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface TableRowData {
  id: string | number;
  [key: string]: any;
}

type DataTableColumn<T extends Record<string, any>> = {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
};

export type DataTableColumns<T extends Record<string, any>> = Array<
  DataTableColumn<T>
>;

type ExpandTogglePlacement = "leading" | "actions";

// Sentinel used to represent "All records" without mixing strings into a
// number array. Consumers that pass pageSizeOptions should use this value;
// DataTableServer maps it to the label "All" internally.
export const ALL_RECORDS_SENTINEL = -1;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getNestedValue = (obj: any, path: string): any =>
  path.split(".").reduce((acc, key) => acc && acc[key], obj);

// ---------------------------------------------------------------------------
// InternalDataTableRow
// ---------------------------------------------------------------------------

interface InternalDataTableRowProps<T extends TableRowData> {
  item: T;
  columns: DataTableColumns<T>;
  viewMore: boolean;
  viewMoreLink?: string;
  renderActions?: (item: T) => React.ReactNode;
  expandable?: boolean;
  renderExpandedContent?: (item: T) => React.ReactNode;
  onExpand?: (item: T) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  expandTogglePlacement?: ExpandTogglePlacement;
}

function InternalDataTableRow<T extends TableRowData>({
  item,
  columns,
  viewMore,
  viewMoreLink,
  renderActions,
  expandable = false,
  renderExpandedContent,
  onExpand,
  selectable = false,
  isSelected = false,
  onToggleSelect,
  expandTogglePlacement = "leading",
}: InternalDataTableRowProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && onExpand) onExpand(item);
  };

  const showExpandInLeadingColumn =
    expandable && expandTogglePlacement === "leading";

  const showActionsCell = Boolean(
    (viewMore && viewMoreLink) ||
      renderActions ||
      (expandable && expandTogglePlacement === "actions")
  );

  const expandedColSpan =
    columns.length +
    (selectable ? 1 : 0) +
    (showExpandInLeadingColumn ? 1 : 0) +
    (showActionsCell ? 1 : 0);

  return (
    <>
      <TableRow>
        {selectable && (
          <TableCell className="w-12 text-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
            />
          </TableCell>
        )}

        {showExpandInLeadingColumn && (
          <TableCell className="w-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpand}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </TableCell>
        )}

        {columns.map((column) => {
          const rawValue = getNestedValue(item, column.key.toString());
          const cellValue = column.render
            ? column.render(rawValue, item)
            : rawValue;

          const isTruncated = column.className?.includes("truncate-column");

          return (
            <TableCell
              key={column.key.toString()}
              className={column.className || ""}
              style={{ width: column.width || "auto" }}
            >
              {isTruncated ? (
                <TruncatedCell value={cellValue} className={column.className} />
              ) : (
                cellValue
              )}
            </TableCell>
          );
        })}

        {showActionsCell && (
          <TableCell className="align-middle">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              {expandable && expandTogglePlacement === "actions" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleExpand}
                >
                  {isExpanded ? "Collapse" : "Expand"}
                </Button>
              )}

              {viewMore && viewMoreLink ? (
                <Link to={viewMoreLink}>
                  <Button aria-label="View more" variant="default" size="sm">
                    View More
                  </Button>
                </Link>
              ) : null}

              {renderActions && <div>{renderActions(item)}</div>}
            </div>
          </TableCell>
        )}
      </TableRow>

      {expandable && isExpanded && renderExpandedContent && (
        <TableRow>
          <TableCell
            colSpan={expandedColSpan}
            className="bg-muted/20 px-6 shadow-inner"
          >
            {renderExpandedContent(item)}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

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
  loading?: boolean;
  expandTogglePlacement?: ExpandTogglePlacement;
  actionsHeaderLabel?: string;
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
  expandTogglePlacement = "leading",
  actionsHeaderLabel = "Actions",
}: DataTableClientProps<T>) {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(itemsPerPage);

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortedData = React.useMemo(() => {
    if (!sortBy) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortBy);
      const bValue = getNestedValue(b, sortBy);
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        const aNum = aValue ? 1 : 0;
        const bNum = bValue ? 1 : 0;
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }

      return sortDir === "asc"
        ? String(aValue).localeCompare(String(bValue), undefined, {
            numeric: true,
            sensitivity: "base",
          })
        : String(bValue).localeCompare(String(aValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });
    });

    return sorted;
  }, [data, sortBy, sortDir]);

  const total = sortedData.length;
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage));

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(1, Math.ceil(total / rowsPerPage))));
  }, [total, rowsPerPage]);

  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + paginatedData.length, total);

  const goToPage = (p: number) => {
    if (p >= 1 && p <= pageCount) setPage(p);
  };

  const showActionsColumn =
    !hideActionsHeader &&
    (viewMore ||
      !!renderActions ||
      (expandable && expandTogglePlacement === "actions"));

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
                    checked={
                      selectedItems.length === data.length && data.length > 0
                    }
                    onChange={() =>
                      onSelectChange(
                        selectedItems.length === data.length ? [] : data
                      )
                    }
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
                  />
                </TableHeadCell>
              )}

              {expandable && expandTogglePlacement === "leading" && (
                <TableHeadCell className="w-12" />
              )}

              {columns.map((column) => (
                <TableHeadCell
                  key={column.key.toString()}
                  className={`${column.className || ""} ${
                    column.sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() =>
                    column.sortable && handleSort(column.key.toString())
                  }
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable &&
                      (sortBy === column.key.toString() ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      ))}
                  </div>
                </TableHeadCell>
              ))}

              {showActionsColumn && (
                <TableHeadCell className="pl-9">
                  {actionsHeaderLabel}
                </TableHeadCell>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((item) => (
              <InternalDataTableRow
                key={item.id}
                item={item}
                columns={columns}
                viewMore={viewMore}
                viewMoreLink={`${viewMoreBaseLink}/${item.id}${
                  activeTab ? `?tab=${activeTab}` : ""
                }`}
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
                expandTogglePlacement={expandTogglePlacement}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <strong>
              {showingFrom}–{showingTo}
            </strong>{" "}
            of <strong>{total}</strong> records
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}
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

type PageSizeOption = {
  label: string;
  value: number;
};

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
  fetchData: (
    pageNo: number,
    pageSize: number,
    sortColumn?: string,
    sortDirection?: "asc" | "desc"
  ) => void | Promise<void>;
  sortBy?: string | null;
  sortDir?: "asc" | "desc";
  pageSizeOptions?: PageSizeOption[];
  expandable?: boolean;
  renderExpandedContent?: (item: T) => React.ReactNode;
  onExpand?: (item: T) => void;
  loading?: boolean;
  showPageSizeSelector?: boolean;
  showPaginationControls?: boolean;
  expandTogglePlacement?: ExpandTogglePlacement;
  actionsHeaderLabel?: string;
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
  sortDir = "asc",
  pageSizeOptions = [
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "50", value: 50 },
    { label: "100", value: 100 },
  ],
  expandable = false,
  renderExpandedContent,
  onExpand,
  loading = false,
  showPageSizeSelector = true,
  showPaginationControls = true,
  expandTogglePlacement = "leading",
  actionsHeaderLabel = "Actions",
}: DataTableServerProps<T>) {
  const { pageNo, pageSize, totalRecords, totalPages } = pagination;
  const currentPage = pageNo + 1;

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    await fetchData(newPage - 1, pageSize, sortBy ?? undefined, sortDir);
  };

  const handleSort = async (column: string) => {
    const newSortDir: "asc" | "desc" =
      sortBy === column && sortDir === "asc" ? "desc" : "asc";
    await fetchData(0, pageSize, column, newSortDir);
  };

  const handlePageSizeChange = async (value: string) => {
    const nextPageSize = Number(value);
    await fetchData(0, nextPageSize, sortBy ?? undefined, sortDir);
  };

  const showActionsColumn =
    !hideActionsHeader &&
    (viewMore ||
      !!renderActions ||
      (expandable && expandTogglePlacement === "actions"));

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

  const showingFrom = totalRecords === 0 ? 0 : pageNo * pageSize + 1;
  const showingTo = pageNo * pageSize + data.length;

  return (
    <div>
      <div className="rounded-md border">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {expandable && expandTogglePlacement === "leading" && (
                <TableHeadCell className="w-12" />
              )}

              {columns.map((column) => (
                <TableHeadCell
                  key={column.key.toString()}
                  className={`${column.className || ""} ${
                    column.sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() =>
                    column.sortable && handleSort(column.key.toString())
                  }
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable &&
                      (sortBy === column.key.toString() ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      ))}
                  </div>
                </TableHeadCell>
              ))}

              {showActionsColumn && (
                <TableHeadCell className="pl-9">
                  {actionsHeaderLabel}
                </TableHeadCell>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item) => (
              <InternalDataTableRow
                key={item.id}
                item={item}
                columns={columns}
                viewMore={viewMore}
                viewMoreLink={`${viewMoreBaseLink}/${item.id}${
                  activeTab ? `?tab=${activeTab}` : ""
                }`}
                renderActions={renderActions}
                expandable={expandable}
                renderExpandedContent={renderExpandedContent}
                onExpand={onExpand}
                expandTogglePlacement={expandTogglePlacement}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-xs text-muted-foreground">
          Showing{" "}
          <strong>
            {showingFrom}–{showingTo}
          </strong>{" "}
          of <strong>{totalRecords}</strong> records
        </div>

        <div className="flex items-center gap-4">
          {showPageSizeSelector && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="h-8 w-[90px] text-xs">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={String(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showPaginationControls && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || totalPages <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages <= 1}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}