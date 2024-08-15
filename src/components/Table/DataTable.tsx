import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DataTableRow from './DataTableRow';

export interface TableRowData {
  id: string | number;
  [key: string]: any;
}

interface DataTableProps<T extends TableRowData> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
}

function DataTable<T extends TableRowData>({ data, columns }: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key.toString()}>{column.header}</TableHead>
          ))}
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <DataTableRow key={item.id} item={item} columns={columns} />
        ))}
      </TableBody>
    </Table>
  );
}

export default DataTable;