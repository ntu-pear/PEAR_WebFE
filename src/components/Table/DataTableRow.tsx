import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableRowData } from "./DataTable";
import { Link } from "react-router-dom";
import TruncatedCell from "./TruncatedCell";

interface DataTableRowProps<T extends TableRowData> {
  item: T;
  columns: Array<{
    key: keyof T | string;
    header: string;
    width?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
  }>;
  viewMore: boolean;
  viewMoreLink?: string;
  renderActions?: (item: T) => React.ReactNode;
}

// Utility function to access nested properties
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
};

function DataTableRow<T extends TableRowData>({
  item,
  columns,
  viewMore,
  viewMoreLink,
  renderActions,
}: DataTableRowProps<T>) {
  return (
    <TableRow>
      {columns.map((column) => {
        const cellValue = column.render
          ? column.render(getNestedValue(item, column.key.toString()), item) // Use nested value if present
          : getNestedValue(item, column.key.toString()); // Fallback to the direct value

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
      <TableCell className="flex flex-col sm:flex-row gap-1 sm:items-center sm:justify-start sm:ml-4">
        {viewMore && viewMoreLink ? (
          <Link to={viewMoreLink}>
            <Button aria-label="View more" variant="default" size="sm">
              View More
            </Button>
          </Link>
        ) : null}
        {renderActions && <div>{renderActions(item)}</div>}
        {/* Render custom actions */}
      </TableCell>
    </TableRow>
  );
}

export default DataTableRow;
