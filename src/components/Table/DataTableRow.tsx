import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableRowData } from "./DataTable";

interface DataTableRowProps<T extends TableRowData> {
  item: T;
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  viewMore: boolean;
  renderActions?: (item: T) => React.ReactNode; 
}

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
            ? column.render(item[column.key], item)
            : item[column.key]}
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
