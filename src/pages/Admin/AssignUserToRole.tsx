import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { DataTableServer } from "@/components/Table/DataTable";
import Searchbar from "@/components/Searchbar";

import {
  ArrowLeft,
  UserPlus,
  Search,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldAlert,
} from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import useGetUsersFromRole from "@/hooks/role/useGetUsersFromRole";
import { useUserRoleManagement } from "@/hooks/admin/useUserRoleManagement";
import { useUsers } from "@/hooks/admin/useUsers";

import { Role, fetchRolesPaginated } from "@/api/role/roles";
import { User } from "@/api/admin/user";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "nric_FullName";
const DEFAULT_SORT_DIR: "asc" | "desc" = "asc";

const VALID_PAGE_SIZES = [5, 10, 50, 100];

function parsePageSize(raw: string | null): number {
  const n = Number(raw ?? DEFAULT_PAGE_SIZE);

  if (Number.isNaN(n) || n <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return n;
}

const AssignUserToRole: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const latestLocationRef = useRef(location);

  useEffect(() => {
    latestLocationRef.current = location;
  }, [location]);

  const roleFromState = location.state?.role as Role | undefined;
  const roleRef = useRef<Role | undefined>(roleFromState);

  useEffect(() => {
    if (roleFromState) {
      roleRef.current = roleFromState;
    }
  }, [roleFromState]);

  const role = roleFromState ?? roleRef.current;
  const roleName = role?.roleName ?? "";
  const isValidRole = !!role;

  const [orphanUser, setOrphanUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [allSystemRoles, setAllSystemRoles] = useState<Role[]>([]);

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const urlName = queryParams.get("name") ?? "";

  const rawPage = Number(queryParams.get("page") ?? "0");
  const page = Number.isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;

  const pageSize = parsePageSize(queryParams.get("pageSize"));

  const urlSortBy = queryParams.get("sortBy") ?? DEFAULT_SORT_BY;

  const urlSortDir = (
    queryParams.get("sortDir") === "desc" ? "desc" : DEFAULT_SORT_DIR
  ) as "asc" | "desc";

  const updateQuery = useCallback(
    (updates: {
      name?: string;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortDir?: "asc" | "desc";
    }) => {
      const currentSearch = latestLocationRef.current.search;
      const next = new URLSearchParams(currentSearch);

      const nextName = updates.name ?? next.get("name") ?? "";
      const nextPage = updates.page ?? Number(next.get("page") ?? "0");
      const nextPageSize =
        updates.pageSize ?? parsePageSize(next.get("pageSize"));
      const nextSortBy =
        updates.sortBy ?? next.get("sortBy") ?? DEFAULT_SORT_BY;
      const nextSortDir =
        updates.sortDir ??
        ((next.get("sortDir") === "desc"
          ? "desc"
          : DEFAULT_SORT_DIR) as "asc" | "desc");

      if (nextName.trim()) {
        next.set("name", nextName.trim());
      } else {
        next.delete("name");
      }

      if (nextPage > 0) {
        next.set("page", String(nextPage));
      } else {
        next.delete("page");
      }

      if (nextPageSize !== DEFAULT_PAGE_SIZE) {
        next.set("pageSize", String(nextPageSize));
      } else {
        next.delete("pageSize");
      }

      if (nextSortBy !== DEFAULT_SORT_BY) {
        next.set("sortBy", nextSortBy);
      } else {
        next.delete("sortBy");
      }

      if (nextSortDir !== DEFAULT_SORT_DIR) {
        next.set("sortDir", nextSortDir);
      } else {
        next.delete("sortDir");
      }

      const nextSearch = next.toString();
      const normalizedCurrentSearch = currentSearch.startsWith("?")
        ? currentSearch.slice(1)
        : currentSearch;

      if (nextSearch !== normalizedCurrentSearch) {
        navigate(
          {
            pathname: latestLocationRef.current.pathname,
            search: nextSearch ? `?${nextSearch}` : "",
          },
          {
            replace: true,
            state: latestLocationRef.current.state,
          }
        );
      }
    },
    [navigate]
  );

  const [searchTerm, setSearchTerm] = useState(urlName);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const isExternalSync = useRef(false);

  useEffect(() => {
    isExternalSync.current = true;
    setSearchTerm(urlName);
  }, [urlName]);

  useEffect(() => {
    if (isExternalSync.current) {
      isExternalSync.current = false;

      if (debouncedSearchTerm === urlName) {
        return;
      }
    }

    updateQuery({
      name: debouncedSearchTerm,
      page: 0,
    });
  }, [debouncedSearchTerm, updateQuery, urlName]);

  const { data, isLoading } = useUsers(
    page,
    pageSize,
    urlName,
    urlSortBy,
    urlSortDir
  );

  const availableUsers = data?.users ?? [];
  const total = data?.total ?? 0;

  const isAdminWorkbench = roleName === "ADMIN";

  const { data: currentRoster } = useGetUsersFromRole(roleName);

  const rosterIds = useMemo(() => {
    return new Set(currentRoster?.map((user: any) => user.id));
  }, [currentRoster]);

  const { safeAssign, isProcessing } = useUserRoleManagement();

  useEffect(() => {
    fetchRolesPaginated(0, 50)
      .then((res) => {
        setAllSystemRoles(res.roles ?? []);
      })
      .catch((error) => {
        toast.error(
          "Error fetching roles: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      });
  }, []);

  const handleAssignUser = (user: User) => {
    safeAssign(user, roleName, isAdminWorkbench);
  };

  const handleRescueUser = (targetRoleName: string) => {
    if (!orphanUser) return;

    if (targetRoleName === "ADMIN") {
      toast.error("Illegal Operation: Admin role is restricted.");
      return;
    }

    safeAssign(
      {
        id: orphanUser.id,
        roleName: "",
      },
      targetRoleName,
      false
    );

    toast.success(`${orphanUser.name} reassigned to ${targetRoleName}`);
    setOrphanUser(null);
  };

  const handleTableFetch = (
    nextPage: number,
    nextPageSize: number,
    nextSortBy?: string,
    nextSortDir?: "asc" | "desc"
  ) => {
    const pageSizeChanged = nextPageSize !== pageSize;
    const sortChanged =
      nextSortBy !== urlSortBy || nextSortDir !== urlSortDir;

    updateQuery({
      page: pageSizeChanged || sortChanged ? 0 : nextPage,
      pageSize: nextPageSize,
      sortBy: nextSortBy ?? urlSortBy,
      sortDir: nextSortDir ?? urlSortDir,
    });
  };

  const directoryColumns: {
    key: keyof User | "actions";
    header: string;
    sortable?: boolean;
    render?: (value: any, user: User) => React.ReactNode;
    className?: string;
  }[] = [
    {
      key: "nric_FullName",
      header: "Staff member",
      sortable: true,
      render: (value: string, user: User) => (
        <div>
          <div className="text-sm font-medium text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground">
            {user.roleName || "(unassigned)"}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "roleName",
      header: "Current Role",
      sortable: true,
      render: (value: string | null) => value || "(unassigned)",
    },
    {
      key: "actions",
      header: "Status",
      sortable: false,
      render: (_: any, user: User) => {
        const isAlreadyInRole = rosterIds.has(user.id);
        const isUserAdmin = user.roleName === "ADMIN";

        if (isAlreadyInRole) {
          return (
            <Badge
              variant="default"
              className="h-8 px-3 text-sm font-medium rounded-md"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Assigned
            </Badge>
          );
        }

        if (isAdminWorkbench || isUserAdmin) {
          return (
            <Badge
              variant="secondary"
              className="h-8 px-3 text-sm font-medium rounded-md"
            >
              <Lock className="h-4 w-4 mr-1" />
              Locked
            </Badge>
          );
        }

        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isProcessing}
            onClick={() => handleAssignUser(user)}
            className="h-8"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <UserPlus className="h-4 w-4 mr-1" />
            )}
            Add
          </Button>
        );
      },
    },
  ];

  const pageSizeOptions =
    total > 0
      ? [
          ...VALID_PAGE_SIZES.map((size) => ({
            label: String(size),
            value: size,
          })),
          ...(!VALID_PAGE_SIZES.includes(total)
            ? [
                {
                  label: "All",
                  value: total,
                },
              ]
            : []),
        ]
      : VALID_PAGE_SIZES.map((size) => ({
          label: String(size),
          value: size,
        }));

  const effectivePageSize = Math.max(pageSize, 1);
  const totalPages = total === 0 ? 0 : Math.ceil(total / effectivePageSize);

  if (!isValidRole) {
    return <div className="p-10">Invalid access. Please go back.</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0 px-7">
              <h1 className="text-3xl font-semibold">
                Assign Users to Role: {roleName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage staff assignments for this role.
              </p>
            </div>
          </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
              <CardHeader className="border-b border-border flex flex-row items-center justify-between gap-8 p-8">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <CardTitle>Staff directory</CardTitle>
                  </div>
                  <CardDescription className="whitespace-nowrap">
                    Search system users and assign them to this role.
                  </CardDescription>
                </div>

                <div className="w-[340px] shrink-0">
                  <Searchbar
                    searchItem={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for staff..."
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-4 mt-4">
                <DataTableServer
                  data={availableUsers}
                  columns={directoryColumns}
                  pagination={{
                    pageNo: page,
                    pageSize,
                    totalRecords: total,
                    totalPages,
                  }}
                  fetchData={handleTableFetch}
                  sortBy={urlSortBy}
                  sortDir={urlSortDir}
                  pageSizeOptions={pageSizeOptions}
                  loading={isLoading}
                  viewMore={false}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border border-border shadow-sm h-full flex flex-col rounded-2xl overflow-hidden bg-card">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle>Current roster</CardTitle>
                  <Badge
                    variant="secondary"
                    className="h-8 px-3 text-sm font-medium rounded-md"
                  >
                    {currentRoster?.length || 0}
                  </Badge>
                </div>
                <CardDescription>
                  Users currently assigned to this role.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 p-0">
                <div className="max-h-[450px] overflow-y-auto divide-y divide-border">
                  {currentRoster?.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between px-6 py-3 hover:bg-muted/50"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {user.FullName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.id}
                        </div>
                      </div>
                    </div>
                  ))}

                  {!currentRoster?.length && (
                    <div className="px-6 py-8 text-sm text-muted-foreground">
                      No users are currently assigned to this role.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="flex items-center gap-3 px-5 py-5 mt-8 bg-pending/30 rounded-2xl border border-pending/50">
          <ShieldAlert className="h-4 w-4 text-pending-foreground" />
          <p className="text-[11px] text-pending-foreground font-semibold tracking-wide">
            Role assignment changes impact system access and should be reviewed
            carefully.
          </p>
        </footer>
      </div>

      <Dialog open={!!orphanUser}>
        <DialogContent className="rounded-2xl [&>button]:hidden">
          <DialogTitle className="text-xl font-semibold">
            Assign role
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {orphanUser?.name} needs a new role.
          </DialogDescription>

          <div className="space-y-2 mt-4">
            {allSystemRoles.map((systemRole) => (
              <Button
                key={systemRole.id}
                disabled={systemRole.roleName === "ADMIN"}
                onClick={() => handleRescueUser(systemRole.roleName)}
                className="w-full justify-between"
                variant="outline"
              >
                <span>{systemRole.roleName}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignUserToRole;