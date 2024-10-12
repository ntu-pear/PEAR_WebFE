import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableRowData } from "./DataTable";

interface DataTableRowProps<T extends TableRowData> {
  item: T;
  columns: Array<{
    key: keyof T | string;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  viewMore: boolean;
  renderActions?: (item: T) => React.ReactNode; 
}

// Utility function to access nested properties
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
};


function DataTableRow<T extends TableRowData>({
  item,
  columns,
  viewMore,
  renderActions,
}: DataTableRowProps<T>) {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell key={column.key.toString()}>
          {column.render
            ? column.render(getNestedValue(item, column.key.toString()), item)  // Use nested value if present
            : getNestedValue(item, column.key.toString())} {/* Fallback to the direct value */}
        </TableCell>
      ))}
      <TableCell className="flex justify-around">
        {viewMore ? (
          <Button aria-label="View more" variant="default" size="sm">
            View More
          </Button>
        ) : null}

        {renderActions ? renderActions(item) : null} {/* Render custom actions */}  
      </TableCell>
    </TableRow>
  );
}

export default DataTableRow;
