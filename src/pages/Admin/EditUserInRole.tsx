import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableServer } from "@/components/Table/DataTable";
import Searchbar from "@/components/Searchbar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Icons
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
  Search,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ChevronRight,
  Lock,
} from "lucide-react";

// Hooks & API
import useDebounce from "@/hooks/useDebounce";
import { Role, fetchRolesPaginated } from "@/api/role/roles";
import useGetUsersFromRole from "@/hooks/role/useGetUsersFromRole";

// ✅ NEW HOOKS
import { useUsers } from "@/hooks/admin/useUsers";
import { useUserRoleManagement } from "@/hooks/admin/useUserRoleManagement";

const EditUserInRole: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role;

  if (!role) {
    return <div className="p-10">Invalid access. Please go back.</div>;
  }

  const [orphanUser, setOrphanUser] = useState<{ id: string; name: string } | null>(null);
  const [allSystemRoles, setAllSystemRoles] = useState<Role[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(0);

  const [sortBy, setSortBy] = useState<string>("nric_FullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const isAdminWorkbench = role.roleName === "ADMIN";

  // IMPORTANT:
  // This assumes your useUsers hook supports sortBy + sortDir.
  // If it currently only accepts (page, search), update that hook/API call too.
  const { data, isLoading } = useUsers(page, debouncedSearch, sortBy, sortDir);
  const availableUsers = data?.users || [];
  const total = data?.total || 0;

  const { data: currentRoster } = useGetUsersFromRole(role.roleName);

  const rosterIds = useMemo(
    () => new Set(currentRoster?.map((u) => u.id)),
    [currentRoster]
  );

  const { safeAssign, safeRemove, isProcessing } =
    useUserRoleManagement(role.roleName);

  useEffect(() => {
    fetchRolesPaginated(0, 50, "", "roleName", "asc").then((res) =>
      setAllSystemRoles(res.roles)
    );
  }, []);

  const handleRescueUser = (targetRoleName: string) => {
    if (!orphanUser) return;

    if (targetRoleName === "ADMIN") {
      toast.error("Illegal Operation: Admin role is restricted.");
      return;
    }

    safeAssign({ id: orphanUser.id, roleName: "" }, targetRoleName, false);

    toast.success(`${orphanUser.name} reassigned to ${targetRoleName}`);
    setOrphanUser(null);
  };

  const handleTableFetch = (
    nextPage: number,
    _pageSize: number,
    nextSortBy?: string,
    nextSortDir?: "asc" | "desc"
  ) => {
    setPage(nextPage);

    if (nextSortBy) {
      setSortBy(nextSortBy);
    }

    if (nextSortDir) {
      setSortDir(nextSortDir);
    }
  };

  const directoryColumns = [
    {
      key: "nric_FullName",
      header: "Staff member",
      sortable: true,
      render: (val: string, user: any) => (
        <div>
          <div className="text-sm font-medium text-foreground">{val}</div>
          <div className="text-sm text-muted-foreground">
            {user.roleName || "(unassigned)"}
          </div>
        </div>
      ),
    },

    {
      key: "actions",
      header: "Status",
      render: (_: any, user: any) => {
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
            onClick={() => safeAssign(user, role.roleName, false)}
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
              <h1 className="text-3xl font-semibold">{role.roleName}</h1>
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
                    onSearchChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(0);
                    }}
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
                    pageSize: 10,
                    totalRecords: total,
                    totalPages: Math.ceil(total / 10),
                  }}
                  fetchData={handleTableFetch}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  loading={isLoading}
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
                  {currentRoster?.map((user: any) => {
                    const isUserAdmin = user.roleName === "ADMIN";

                    return (
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

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary hover:bg-accent"
                          disabled={
                            isProcessing || isAdminWorkbench || isUserAdmin
                          }
                          onClick={() =>
                            safeRemove(user, isAdminWorkbench, () => {
                              setOrphanUser({
                                id: user.id,
                                name: user.FullName || user.nric_FullName,
                              });
                            })
                          }
                        >
                          {isUserAdmin ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <UserMinus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="flex items-center gap-3 px-5 py-5 mt-8 bg-pending/30 rounded-2xl border border-pending/50">
          <ShieldAlert className="h-4 w-4 text-pending-foreground" />
          <p className="text-[11px] text-pending-foreground font-semibold tracking-wide">
            Role assignment changes impact system access and should be reviewed carefully.
          </p>
        </footer>
      </div>

      <Dialog open={!!orphanUser}>
        <DialogContent className="rounded-2xl">
          <DialogTitle className="text-xl font-semibold">Assign role</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {orphanUser?.name} needs a new role.
          </DialogDescription>

          <div className="space-y-2 mt-4">
            {allSystemRoles.map((r) => (
              <Button
                key={r.id}
                disabled={r.roleName === "ADMIN"}
                onClick={() => handleRescueUser(r.roleName)}
                className="w-full justify-between"
                variant="outline"
              >
                <span>{r.roleName}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditUserInRole;