import React, { useMemo, useState } from "react";
import { ListFilter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useDebounce from "@/hooks/useDebounce";
import { DataTableClient } from "@/components/Table/DataTable";
import { Button } from "@/components/ui/button";
import {
  ACTION_OPTIONS,
  LIST_TYPES,
  MOCK_LISTS_LOG,
  ListsLogRow,
  ListAction,
} from "@/mocks/mockListsLog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fmtEU = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const parseFormatted = (lines?: string[]) =>
  (lines ?? []).reduce<Record<string, string>>((acc, line) => {
    const [key, ...rest] = line.split(":");
    acc[key.trim()] = rest.join(":").trim();
    return acc;
  }, {});

const getValue = (row: ListsLogRow) => {
  const before = parseFormatted(row.formattedData1);
  const after = parseFormatted(row.formattedData2);

  if (row.actionType === "Add") {
    return before["Value"] ?? "-";
  }

  if (row.actionType === "Update") {
    return `${before["Value"] ?? "-"} → ${after["Value"] ?? "-"}`;
  }

  return before["Value"] ?? "-";
};

const ListsLog: React.FC = () => {
  const [listType, setListType] = useState("all");
  const [action, setAction] = useState("all");

  const debouncedListType = useDebounce(listType, 300);
  const debouncedAction = useDebounce(action, 300);

  const data = useMemo(() => {
    return MOCK_LISTS_LOG.filter((r) =>
      debouncedListType === "all" ? true : r.listType === debouncedListType
    )
      .filter((r) =>
        debouncedAction === "all"
          ? true
          : r.actionType === (debouncedAction as ListAction)
      )
      .sort(
        (a, b) => +new Date(b.createdDateTime) - +new Date(a.createdDateTime)
      );
  }, [debouncedListType, debouncedAction]);

  const columns = [
    { key: "listType" as const, header: "List Type" },
    { key: "actionType" as const, header: "Action" },
    {
      key: "value",
      header: "Value",
      className: "max-w-[10rem] truncate",
      render: (_: unknown, row: ListsLogRow) => getValue(row),
    },
    {
      key: "createdDateTime" as const,
      header: "Date",
      render: (v: string) => fmtEU(v),
    },
    { key: "userName" as const, header: "Action by" },
  ];

  const FilterBtn: React.FC<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
  }> = ({ label, value, options, onChange }) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ListFilter className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <div className="flex items-center gap-2 justify-end mb-4">
            <FilterBtn
              label="List Type"
              value={listType}
              onChange={setListType}
              options={[
                { value: "all", label: "All" },
                ...LIST_TYPES.map((t) => ({ value: t, label: t })),
              ]}
            />
            <FilterBtn
              label="Action"
              value={action}
              onChange={setAction}
              options={[
                { value: "all", label: "All" },
                ...ACTION_OPTIONS.map((a) => ({ value: a, label: a })),
              ]}
            />
          </div>
          <Card className="ml-4 sm:ml-6">
            <CardHeader>
              <CardTitle>Lists Log</CardTitle>
              <CardDescription>
                View list changes with before/after values at a glance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTableClient<ListsLogRow>
                data={data}
                columns={columns}
                viewMore={false}
                hideActionsHeader
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ListsLog;
