import React, { useEffect, useMemo, useState } from "react";
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

const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) setCurrentPage(1);
    else if (newPage > totalPages) setCurrentPage(totalPages);
    else setCurrentPage(newPage);
  };

  useEffect(() => {
    if (data.length !== 0 && totalPages < currentPage) {
      setCurrentPage(totalPages);
    }
  }, [data.length, totalPages, currentPage]);

  const showActionsColumn = !hideActionsHeader && (
    viewMore || !!renderActions || (expandable && expandTogglePlacement === "actions")
  );

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

              {expandable && expandTogglePlacement === "leading" && (
                <TableHeadCell className="w-12" />
              )}

              {columns.map((column) => (
                <TableHeadCell
                  key={column.key.toString()}
                  className={column.className || ""}
                >
                  {column.header}
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
  fetchData: (
    pageNo: number,
    pageSize: number,
    sortColumn?: string,
    sortDirection?: "asc" | "desc"
  ) => void | Promise<void>;
  sortBy?: string | null;
  sortDir?: "asc" | "desc";
  pageSizeOptions?: (number | string)[];
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
  pageSizeOptions = [5, 10, 20, 50, 100, "All"],
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
    const nextPageSize =
      value === "All" ? totalRecords || pageSize : Number(value);

    await fetchData(0, nextPageSize, sortBy ?? undefined, sortDir);
  };

  const pageSizeValue =
    totalRecords > 0 && pageSize >= totalRecords ? "All" : String(pageSize);

  const showActionsColumn = !hideActionsHeader && (
    viewMore || !!renderActions || (expandable && expandTogglePlacement === "actions")
  );

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
            {pageNo * pageSize + 1}-{pageNo * pageSize + data.length}
          </strong>{" "}
          of <strong>{totalRecords}</strong> records
        </div>

        <div className="flex items-center gap-4">
          {showPageSizeSelector && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Rows per page</span>
              <Select value={pageSizeValue} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="h-8 w-[90px] text-xs">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={String(option)} value={String(option)}>
                      {String(option)}
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