import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableRowData } from "./DataTable";
import { Link } from "react-router-dom";

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
}

// Utility function to access nested properties
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
      {columns.map((column) => (
        <TableCell
          key={column.key.toString()}
          className={column.className || ""}
          style={{ width: column.width ? column.width : "auto" }}
        >
          {column.render
            ? column.render(getNestedValue(item, column.key.toString()), item) // Use nested value if present
            : getNestedValue(item, column.key.toString())}{" "}
          {/* Fallback to the direct value */}
        </TableCell>
      ))}
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
