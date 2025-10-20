import React, { useMemo, useState } from "react";
import { ListFilter, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useDebounce from "@/hooks/useDebounce";
import { DataTableClient } from "@/components/Table/DataTable";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import {
  ACTION_OPTIONS,
  STATUS_OPTIONS,
  LIST_TYPES,
  MOCK_USERS,
  MOCK_LISTS_LOG,
  ListsLogRow,
  ListAction,
  LogStatus,
} from "@/mocks/mockListsLog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---------- helpers ----------
const fmtEU = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const StatusPill: React.FC<{ status: LogStatus }> = ({ status }) => {
  const cls =
    status === "Committed"
      ? "text-green-700 bg-green-100"
      : status === "Rejected"
        ? "text-red-700 bg-red-100"
        : status === "Pending approval"
          ? "text-blue-700 bg-blue-100"
          : "text-muted-foreground bg-muted/40";
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
};

// ---------- details modal ----------
const LogDetailsModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { row } = activeModal.props as { row: ListsLogRow };

  const body = (() => {
    const a = row.actionType;
    const f1 = row.formattedData1 ?? [];
    const f2 = row.formattedData2 ?? [];

    if (a === "Add") {
      return (
        <>
          <h5 className="font-semibold mb-2">To be Added</h5>
          <table className="w-full text-sm border">
            <tbody>
              {f1.map((line, i) => {
                const [k, v] = line.split(":");
                return (
                  <tr className="border-t" key={i}>
                    <th className="text-left w-1/3 p-2">{k}</th>
                    <td className="p-2">{v}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      );
    }
    if (a === "Update") {
      return (
        <>
          <h5 className="font-semibold mb-2">Before / After Update</h5>
          <table className="w-full text-sm border">
            <thead>
              <tr className="border-b">
                <th className="text-left w-1/3 p-2" />
                <th className="text-left w-1/3 p-2">Before</th>
                <th className="text-left w-1/3 p-2">After</th>
              </tr>
            </thead>
            <tbody>
              {f1.map((line, i) => {
                const [k1, v1] = line.split(":");
                const [, v2] = (f2[i] ?? ":").split(":");
                return (
                  <tr className="border-t" key={i}>
                    <th className="text-left p-2">{k1}</th>
                    <td className="p-2">{v1}</td>
                    <td className="p-2">{v2}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      );
    }
    // Delete
    return (
      <>
        <h5 className="font-semibold mb-2">To be Deleted</h5>
        <table className="w-full text-sm border">
          <tbody>
            {f1.map((line, i) => {
              const [k, v] = line.split(":");
              return (
                <tr className="border-t" key={i}>
                  <th className="text-left w-1/3 p-2">{k}</th>
                  <td className="p-2">{v}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="bg-background p-6 rounded-md w-[680px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Log details</h3>
          <button
            onClick={closeModal}
            aria-label="Close"
            className="text-muted-foreground"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div className="text-sm grid grid-cols-2 gap-2">
            <div>
              <b>List Type:</b> {row.listType}
            </div>
            <div>
              <b>Action:</b> {row.actionType}
            </div>
            <div className="flex items-center gap-2">
              <b>Status:</b> <StatusPill status={row.status} />
            </div>
            <div>
              <b>Date:</b> {fmtEU(row.createdDateTime)}
            </div>
            <div className="col-span-2">
              <b>Action by:</b> {row.userName}
            </div>
          </div>
          {body}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListsLog: React.FC = () => {
  const { activeModal, openModal } = useModal();

  const [listType, setListType] = useState("all");
  const [action, setAction] = useState("all");
  const [status, setStatus] = useState("all");
  const [user, setUser] = useState("all");

  const debouncedListType = useDebounce(listType, 300);
  const debouncedAction = useDebounce(action, 300);
  const debouncedStatus = useDebounce(status, 300);
  const debouncedUser = useDebounce(user, 300);

  const data = useMemo(() => {
    return MOCK_LISTS_LOG.filter((r) =>
      debouncedListType === "all" ? true : r.listType === debouncedListType
    )
      .filter((r) =>
        debouncedAction === "all"
          ? true
          : r.actionType === (debouncedAction as ListAction)
      )
      .filter((r) =>
        debouncedStatus === "all"
          ? true
          : r.status === (debouncedStatus as LogStatus)
      )
      .filter((r) =>
        debouncedUser === "all" ? true : r.userId === debouncedUser
      )
      .sort(
        (a, b) => +new Date(b.createdDateTime) - +new Date(a.createdDateTime)
      );
  }, [debouncedListType, debouncedAction, debouncedStatus, debouncedUser]);

  const columns = [
    { key: "listType" as const, header: "List Type" },
    { key: "actionType" as const, header: "Action" },
    {
      key: "status" as const,
      header: "Status",
      render: (v: LogStatus) => <StatusPill status={v} />,
    },
    {
      key: "createdDateTime" as const,
      header: "Date",
      render: (v: string) => fmtEU(v),
    },
    { key: "userName" as const, header: "Action by" },
  ];

  // small helper to render a standard filter button
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
            <FilterBtn
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All" },
                ...STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
              ]}
            />
            <FilterBtn
              label="User"
              value={user}
              onChange={setUser}
              options={[
                { value: "all", label: "All" },
                ...MOCK_USERS.map((u) => ({
                  value: u.id,
                  label: u.name,
                })),
              ]}
            />
          </div>
          <Card className="ml-4 sm:ml-6">
            <CardHeader>
              <CardTitle>Lists Log</CardTitle>
              <CardDescription>
                Filter and inspect list-related audit entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTableClient<ListsLogRow>
                data={data}
                columns={columns}
                viewMore={false}
                renderActions={(row) => (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal("viewLogDetails", { row })}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
              />
            </CardContent>
          </Card>
        </main>
      </div>

      {activeModal.name === "viewLogDetails" && <LogDetailsModal />}
    </div>
  );
};

export default ListsLog;
