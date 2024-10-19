import React from "react";
import { render, screen } from "@testing-library/react";
import DataTableRow from "@/components/Table/DataTableRow";
import { TableRowData } from "@/components/Table/DataTable";

interface MockItem extends TableRowData {
  name: string;
  age: number;
}

const mockItem: MockItem = { id: 1, name: "John Doe", age: 30 };

const mockColumns: Array<{
  key: keyof MockItem;
  header: string;
  render?: (value: any, item: MockItem) => React.ReactNode;
}> = [
  { key: "name", header: "Name" },
  { key: "age", header: "Age" },
];

describe("DataTableRow Component", () => {
  test("renders correct cell content", () => {
    render(
      <DataTableRow item={mockItem} columns={mockColumns} viewMore={true} />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  test("renders custom cell content when render function is provided", () => {
    const customColumns: Array<{
      key: keyof MockItem;
      header: string;
      render?: (value: any, item: MockItem) => React.ReactNode;
    }> = [
      ...mockColumns,
      {
        key: "name",
        header: "Custom",
        render: (_value: any, item: MockItem) => `Custom: ${item.name}`,
      },
    ];

    render(
      <DataTableRow item={mockItem} columns={customColumns} viewMore={true} />
    );

    expect(screen.getByText("Custom: John Doe")).toBeInTheDocument();
  });
});
