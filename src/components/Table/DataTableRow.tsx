import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableRowData } from "./DataTable";
import { Link } from "react-router-dom";
import TruncatedCell from "./TruncatedCell";
import { ChevronDown, ChevronRight } from "lucide-react";

interface DataTableRowProps<T extends TableRowData> {
  item: T;
  columns: Array<{
    key: keyof T | string;
    header: string;
    width?: string;
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
  }>;
  viewMore: boolean;
  viewMoreLink?: string;
  renderActions?: (item: T) => React.ReactNode;
  expandable?: boolean;
  renderExpandedContent?: (item: T) => React.ReactNode;
  onExpand?: (item: T) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  expandTogglePlacement?: "leading" | "actions";
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
};

function DataTableRow<T extends TableRowData>({
  item,
  columns,
  viewMore,
  viewMoreLink,
  renderActions,
  expandable = false,
  renderExpandedContent,
  onExpand,
  selectable,
  isSelected,
  onToggleSelect,
  expandTogglePlacement = "leading",
}: DataTableRowProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (newExpandedState && onExpand) {
      onExpand(item);
    }
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
          <TableCell className="w-12" onClick={onToggleSelect}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
            />
          </TableCell>
        )}

        {showExpandInLeadingColumn && (
          <TableCell className="w-10" onClick={handleToggleExpand}>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            )}
          </TableCell>
        )}

        {columns.map((column) => {
          const cellValue = column.render
            ? column.render(getNestedValue(item, column.key.toString()), item)
            : getNestedValue(item, column.key.toString());

          const isTruncated = column.className?.includes("truncate-column");

          return (
            <TableCell
              key={column.key.toString()}
              className={column.className || ""}
              style={{ width: column.width ? column.width : "auto" }}
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

export default DataTableRow;