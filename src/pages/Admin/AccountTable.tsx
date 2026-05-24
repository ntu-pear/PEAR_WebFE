import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DataTableServer } from "@/components/Table/DataTable";
import {
  AccountTableDataServer,
  fetchUsersByFields,
  User,
  exportUsers,
} from "@/api/admin/user";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/formatDate";

import FilterSidebar from "@/components/Filters/FilterSidebar";
import TextFilterField from "@/components/Filters/TextFilterField";
import SelectFilterField from "@/components/Filters/SelectFilterField";
import FilterExportButtons from "@/components/Filters/FilterExportButtons";

import { User as UserIcon, Activity } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "locked-out", label: "Locked Out" },
];

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "nric_FullName";
const DEFAULT_SORT_DIR: "asc" | "desc" = "asc";

const VALID_PAGE_SIZES = [5, 10, 50, 100];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFilterPayload(name: string, status: string): Record<string, string> {
  const filters: Record<string, string> = {
    nric_FullName: name.trim(),
  };

  if (status === "active") {
    filters.isDeleted = "false";
    filters.lockOutEnabled = "false";
  } else if (status === "inactive") {
    filters.isDeleted = "true";
  } else if (status === "locked-out") {
    filters.lockOutEnabled = "true";
  }

  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "")
  );
}

function parsePageSize(raw: string | null): number {
  const n = Number(raw ?? DEFAULT_PAGE_SIZE);
  return Number.isNaN(n) || n <= 0 ? DEFAULT_PAGE_SIZE : n;
}

const AccountTable: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const latestLocationRef = useRef(location);

  useEffect(() => {
    latestLocationRef.current = location;
  }, [location]);

  const [tabValue, setTabValue] = useState("all");
  const [loading, setLoading] = useState(false);

  const [accountTDServer, setAccountTDServer] = useState<AccountTableDataServer>({
    page: 0,
    page_size: DEFAULT_PAGE_SIZE,
    total: 0,
    users: [],
  });

  // ---------------------------------------------------------------------------
  // Parse URL params
  // ---------------------------------------------------------------------------

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const urlName = queryParams.get("name") ?? "";
  const urlStatus = queryParams.get("status") ?? "all";
  const urlSortBy = queryParams.get("sortBy") ?? DEFAULT_SORT_BY;
  const urlSortDir =
    (queryParams.get("sortDir") === "desc" ? "desc" : DEFAULT_SORT_DIR) as
      | "asc"
      | "desc";

  const rawPage = Number(queryParams.get("page") ?? "0");
  const page = Number.isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;

  const pageSize = parsePageSize(queryParams.get("pageSize"));

  // ---------------------------------------------------------------------------
  // URL update helper
  // ---------------------------------------------------------------------------

  const updateQuery = useCallback(
  (updates: {
    name?: string;
    status?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  }) => {
    // Use the ref so we always read the latest URL, not a stale closure
    const currentSearch = latestLocationRef.current.search;
    const next = new URLSearchParams(currentSearch);

    const nextName = updates.name ?? (next.get("name") ?? "");
    const nextStatus = updates.status ?? (next.get("status") ?? "all");
    const nextSortBy = updates.sortBy ?? (next.get("sortBy") ?? DEFAULT_SORT_BY);
    const nextSortDir =
      updates.sortDir ??
      ((next.get("sortDir") === "desc" ? "desc" : DEFAULT_SORT_DIR) as "asc" | "desc");
    const nextPage = updates.page ?? Number(next.get("page") ?? "0");
    const nextPageSize = updates.pageSize ?? parsePageSize(next.get("pageSize"));

    nextName.trim() ? next.set("name", nextName.trim()) : next.delete("name");
    nextStatus !== "all" ? next.set("status", nextStatus) : next.delete("status");
    nextSortBy !== DEFAULT_SORT_BY ? next.set("sortBy", nextSortBy) : next.delete("sortBy");
    nextSortDir !== DEFAULT_SORT_DIR ? next.set("sortDir", nextSortDir) : next.delete("sortDir");
    nextPage > 0 ? next.set("page", String(nextPage)) : next.delete("page");
    nextPageSize !== DEFAULT_PAGE_SIZE
      ? next.set("pageSize", String(nextPageSize))
      : next.delete("pageSize");

    const nextSearch = next.toString();
    const normalizedCurrent = currentSearch.startsWith("?")
      ? currentSearch.slice(1)
      : currentSearch;

    if (nextSearch !== normalizedCurrent) {
      navigate(
        {
          pathname: latestLocationRef.current.pathname,
          search: nextSearch ? `?${nextSearch}` : "",
        },
        { replace: true }
      );
    }
  },
  [navigate] // removed location.search and location.pathname from deps
);

  // ---------------------------------------------------------------------------
  // Name input with debounce
  // ---------------------------------------------------------------------------

  const [nameInput, setNameInput] = useState(urlName);
  const debouncedNameInput = useDebounce(nameInput, 300);
  const isExternalSync = useRef(false);

  useEffect(() => {
    isExternalSync.current = true;
    setNameInput(urlName);
  }, [urlName]);

  useEffect(() => {
  if (isExternalSync.current) {
    isExternalSync.current = false;
    // Only skip if the debounced value matches what's already in the URL
    if (debouncedNameInput === urlName) return;
  }

  updateQuery({ name: debouncedNameInput, page: 0 });
}, [debouncedNameInput, updateQuery, urlName]);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    const filters = buildFilterPayload(urlName, urlStatus);

    fetchUsersByFields(page, pageSize, filters, urlSortBy, urlSortDir)
      .then((response: AccountTableDataServer) => {
        if (!cancelled) {
          setAccountTDServer({
            ...response,
            page,
            page_size: pageSize,
          });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(
            "Error fetching accounts: " +
              (error instanceof Error ? error.message : "Unknown error")
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urlName, urlStatus, page, pageSize, urlSortBy, urlSortDir]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleStatusChange = (value: string) => {
    updateQuery({ status: value, page: 0 });
  };

  const handleFilterReset = () => {
    setNameInput("");
    navigate({ pathname: location.pathname, search: "" }, { replace: true });
  };

 const handleTableFetch = (
  pageNo: number,
  nextPageSize: number,
  nextSortBy?: string,
  nextSortDir?: "asc" | "desc"
) => {
  const pageSizeChanged = nextPageSize !== pageSize;
  const sortChanged =
    nextSortBy !== urlSortBy || nextSortDir !== urlSortDir;

  updateQuery({
    page: pageSizeChanged || sortChanged ? 0 : pageNo,
    pageSize: nextPageSize,
    sortBy: nextSortBy ?? urlSortBy,
    sortDir: nextSortDir ?? urlSortDir,
  });
};

  const handleExport = async (type: "internal" | "external") => {
    let loadingToast;
    try {
      const filters = buildFilterPayload(urlName, urlStatus);
      loadingToast = toast.loading(
        `Exporting users (${type === "internal" ? "internal" : "external"})...`
      );
      await exportUsers(filters);
      toast.dismiss(loadingToast);
      toast.success("Users exported successfully.");
    } catch (error) {
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error("Failed to export users.");
      console.error("Export error:", error);
    }
  };

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------

  const columns: {
    key: keyof User;
    header: string;
    sortable?: boolean;
    render?: (value: any, user: User) => React.ReactNode;
  }[] = [
    {
      key: "profilePicture",
      header: "",
      sortable: false,
      render: (value: string | null, user: User) => {
        const imageUrl = value?.trim();
        const fullName = user.nric_FullName?.trim() || "User";
        const initials = fullName
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("");

        return imageUrl ? (
          <img
            src={imageUrl}
            alt={fullName}
            className="h-10 w-10 rounded-full object-cover border"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="h-10 w-10 rounded-full border bg-muted flex items-center justify-center text-xs font-medium">
            {initials || "U"}
          </div>
        );
      },
    },
    { key: "id", header: "ID", sortable: true },
    { key: "nric_FullName", header: "Name", sortable: true },
    {
      key: "isDeleted",
      header: "Status",
      sortable: false,
      render: (value: boolean | undefined, user: User) => {
        const isLockedOut = user.lockOutEnabled;
       const status = isLockedOut
        ? "Locked Out"
        : value === false
          ? "Active"
          : value === true
            ? "Inactive"
            : "";
        const variant =
      status === "Active"
        ? "default"
        : status === "Locked Out"
          ? "destructive"
          : status === "Inactive"
            ? "secondary"
            : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    { key: "email", header: "Email", sortable: true },
    {
      key: "loginTimeStamp",
      header: "Last Login",
      sortable: true,
      render: (v: string | null) => formatDateTime(v),
    },
    {
      key: "createdDate",
      header: "Created Date",
      sortable: true,
      render: (v: string | null) => formatDateTime(v),
    },
    { key: "roleName", header: "Role", sortable: true },
  ];

  const pageSizeOptions =
    accountTDServer.total > 0
      ? [
          ...VALID_PAGE_SIZES.map((size) => ({
            label: String(size),
            value: size,
          })),
          ...(!VALID_PAGE_SIZES.includes(accountTDServer.total)
            ? [
                {
                  label: "All",
                  value: accountTDServer.total,
                },
              ]
            : []),
        ]
      : VALID_PAGE_SIZES.map((size) => ({
          label: String(size),
          value: size,
        }));

  const effectivePageSize = Math.max(accountTDServer.page_size, 1);

  const effectiveTotalPages =
    accountTDServer.total === 0
      ? 0
      : Math.ceil(accountTDServer.total / effectivePageSize);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen w-full">
      <FilterSidebar
      >
        <TextFilterField
          label="Full Name"
          icon={UserIcon}
          value={nameInput}
          onChange={setNameInput}
          placeholder="Search full name..."
        />

        <SelectFilterField
          label="Status"
          icon={Activity}
          value={urlStatus}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          placeholder="Select status"
        />
        <FilterExportButtons
          onInternalExport={() => handleExport("internal")}
          onExternalExport={() => handleExport("external")}
          internalLabel="Internal (Full)"
          externalLabel="External (Anon)"
        />

        <div className="pt-2">
          <button
            type="button"
            onClick={handleFilterReset}
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            Reset Filters
          </button>
        </div>
      </FilterSidebar>

      <div className="flex-1 p-6 overflow-auto">
        <Tabs value={tabValue} onValueChange={setTabValue}>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Manage Account</CardTitle>
                <CardDescription>
                  Manage all accounts and view their details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTableServer
                  data={accountTDServer.users}
                  pagination={{
                    pageNo: accountTDServer.page,
                    pageSize: accountTDServer.page_size,
                    totalRecords: accountTDServer.total,
                    totalPages: effectiveTotalPages,
                  }}
                  columns={columns}
                  viewMore={true}
                  viewMoreBaseLink="/admin/view-account"
                  activeTab=""
                  fetchData={handleTableFetch}
                  sortBy={urlSortBy}
                  sortDir={urlSortDir}
                  pageSizeOptions={pageSizeOptions}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountTable;