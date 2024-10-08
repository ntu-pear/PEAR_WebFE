import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableRowData } from './DataTable';

interface DataTableRowProps<T extends TableRowData> {
  item: T;
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
}

function DataTableRow<T extends TableRowData>({ item, columns }: DataTableRowProps<T>) {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell key={column.key.toString()}>
          {column.render ? column.render(item[column.key], item) : item[column.key]}
        </TableCell>
      ))}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Open menu" variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log('Edit', item)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Delete', item)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default DataTableRow;