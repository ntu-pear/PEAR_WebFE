import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ShieldCheck,
  Search,
  CheckCircle2,
  Loader2,
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

  // ✅ FIX: prevent crash on refresh
  if (!role) {
    return <div className="p-10">Invalid access. Please go back.</div>;
  }

  // Local State
  const [orphanUser, setOrphanUser] = useState<{ id: string; name: string } | null>(null);
  const [allSystemRoles, setAllSystemRoles] = useState<Role[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(0);

  const isAdminWorkbench = role.roleName === "ADMIN";

  // ✅ React Query (replaces manual fetching)
  const { data, isLoading } = useUsers(page, debouncedSearch);
  const availableUsers = data?.users || [];
  const total = data?.total || 0;

  // Existing hook
  const { data: currentRoster} =
    useGetUsersFromRole(role.roleName);

  // ✅ Optimized lookup
  const rosterIds = useMemo(
    () => new Set(currentRoster?.map((u) => u.id)),
    [currentRoster]
  );

  // ✅ Role mutation hook
  const { safeAssign, safeRemove, isProcessing } =
    useUserRoleManagement(role.roleName);

  useEffect(() => {
    fetchRolesPaginated(0, 50, "", "roleName", "asc").then((res) =>
      setAllSystemRoles(res.roles)
    );
  }, []);

  // Rescue logic (unchanged)
const handleRescueUser = (targetRoleName: string) => {
  if (!orphanUser) return;

  if (targetRoleName === "ADMIN") {
    toast.error("Illegal Operation: Admin role is restricted.");
    return;
  }

  safeAssign(
    { id: orphanUser.id, roleName: "" },
    targetRoleName,   // 🔥 THIS IS THE FIX
    false
  );

  toast.success(`${orphanUser.name} reassigned to ${targetRoleName}`);
  setOrphanUser(null);
};

  const directoryColumns = [
    {
      key: "nric_FullName",
      header: "Staff Member",
      render: (val: string, user: any) => (
        <div className="flex flex-col py-2">
          <span className="font-bold">{val}</span>
          <span className="text-[12px] text-muted-foreground font-mono uppercase">
            {user.roleName || (
              <span className="text-red-500 italic">No Role</span>
            )}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      render: (_: any, user: any) => {
        const isAlreadyInRole = rosterIds.has(user.id);
        const isUserAdmin = user.roleName === "ADMIN";

        if (isAlreadyInRole) {
          return (
            <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" /> Assigned
            </div>
          );
        }

        return (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isProcessing || isAdminWorkbench || isUserAdmin}
            onClick={() => safeAssign(user, role.roleName, isAdminWorkbench ? true : false)}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAdminWorkbench || isUserAdmin ? (
              <Lock className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {(isAdminWorkbench || isUserAdmin) ? "Locked" : "Add"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <Button onClick={() => navigate(-1)} variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-4 mt-4">
          <div className="p-3 bg-primary text-white rounded-xl">
            {isAdminWorkbench ? <Lock /> : <ShieldCheck />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{role.roleName}</h1>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Staff Directory
              </CardTitle>
            </CardHeader>

            <div className="p-4">
              <Searchbar
                searchItem={searchTerm}
                onSearchChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0); // ✅ reset page
                }}
              />
            </div>

            <CardContent>
              <DataTableServer
                data={availableUsers}
                columns={directoryColumns}
                pagination={{
                  pageNo: page,
                  pageSize: 10,
                  totalRecords: total,
                  totalPages: Math.ceil(total / 10),
                }}
                fetchData={(p) => setPage(p)}
                loading={isLoading}
                viewMore={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex justify-between">
              <CardTitle>Current Roster</CardTitle>
              <Badge>{currentRoster?.length || 0}</Badge>
            </CardHeader>

            <CardContent>
              {currentRoster?.map((user: any) => {
                const isUserAdmin = user.roleName === "ADMIN";

                return (
                  <div key={user.id} className="flex justify-between py-3">
                    <div>
                      <div className="font-bold">{user.FullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.id}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
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
                      {isUserAdmin ? <Lock /> : <UserMinus />}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Rescue Modal */}
      <Dialog open={!!orphanUser}>
        <DialogContent>
          <DialogTitle>Assign Role</DialogTitle>
          <DialogDescription>
            {orphanUser?.name} needs a new role
          </DialogDescription>

          <div className="space-y-2 mt-4">
            {allSystemRoles.map((r) => (
              <Button
                key={r.id}
                disabled={r.roleName === "ADMIN"}
                onClick={() => handleRescueUser(r.roleName)}
                className="w-full"
              >
                {r.roleName}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditUserInRole;