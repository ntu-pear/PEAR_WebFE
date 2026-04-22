import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useDebounce from "@/hooks/useDebounce";
import { DataTableClient } from "@/components/Table/DataTable";
import {
  ACTION_OPTIONS,
  LIST_TYPES,
  MOCK_LISTS_LOG,
  ListsLogRow,
  ListAction,
} from "@/mocks/mockListsLog";
import FilterSidebar from "@/components/Filters/FilterSidebar";
import SelectFilterField from "@/components/Filters/SelectFilterField";
import FilterActionButtons from "@/components/Filters/FilterActionButtons";
import { ListFilter } from "lucide-react";

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

  const [draftListType, setDraftListType] = useState("all");
  const [draftAction, setDraftAction] = useState("all");

  const debouncedListType = useDebounce(listType, 300);
  const debouncedAction = useDebounce(action, 300);

  const handleApplyFilters = () => {
    setListType(draftListType);
    setAction(draftAction);
  };

  const handleResetFilters = () => {
    setDraftListType("all");
    setDraftAction("all");
    setListType("all");
    setAction("all");
  };

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

  const activeListLabel = listType === "all" ? "All Lists" : listType;

  const columns = [
    {
      key: "listType" as const,
      header: "List Type",
      render: (value: string) => (
        <span className="text-sm font-medium text-foreground">{value}</span>
      ),
    },
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
      sortable:true,
      render: (v: string) => fmtEU(v),
    },
    { key: "userName" as const, header: "Action by" },
  ];

  return (
    <div className="flex min-h-screen w-full">
      <FilterSidebar title="Filters">
        <SelectFilterField
          label="List Type"
          icon={ListFilter}
          value={draftListType}
          onChange={setDraftListType}
          options={[
            { value: "all", label: "All Lists" },
            ...LIST_TYPES.map((t) => ({ value: t, label: t })),
          ]}
          placeholder="Select list type"
        />

        <SelectFilterField
          label="Action"
          icon={ListFilter}
          value={draftAction}
          onChange={setDraftAction}
          options={[
            { value: "all", label: "All Actions" },
            ...ACTION_OPTIONS.map((a) => ({ value: a, label: a })),
          ]}
          placeholder="Select action"
        />

        <FilterActionButtons
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </FilterSidebar>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-2xl">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>Lists Log</CardTitle>
                    <Badge
                      variant="secondary"
                      className="h-8 px-4 !text-base font-semibold leading-none rounded-md"
                    >
                      {activeListLabel}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold tracking-tight">
                      {activeListLabel} Log Entries
                    </p>
                    <CardDescription>
                      {listType === "all"
                        ? "Viewing all list changes across the system. Filter by list type or action to narrow the log."
                        : `Viewing change history for the ${listType} list. Review add, update, and delete actions below.`}
                    </CardDescription>
                  </div>
                </div>
              </div>
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
        </div>
      </div>
    </div>
  );
};

export default ListsLog;