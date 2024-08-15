import React from 'react';
import { render, screen } from '@testing-library/react';
import DataTable, { TableRowData } from './DataTable';

interface MockData extends TableRowData {
  name: string;
  age: number;
}

const mockData: MockData[] = [
  { id: 1, name: 'John Doe', age: 30 },
  { id: 2, name: 'Jane Smith', age: 25 },
];

const mockColumns: Array<{
  key: keyof MockData;
  header: string;
  render?: (value: any, item: MockData) => React.ReactNode;
}> = [
  { key: 'name', header: 'Name' },
  { key: 'age', header: 'Age' },
];

describe('DataTable Component', () => {
  test('renders table with correct headers', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    mockColumns.forEach(column => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });
  });

  test('renders correct number of rows', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    const rows = screen.getAllByRole('row');
    // Add 1 to mockData.length to account for the header row
    expect(rows).toHaveLength(mockData.length + 1);
  });

  test('renders "Actions" column', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('Actions', { exact: false })).toBeInTheDocument();
  });
});