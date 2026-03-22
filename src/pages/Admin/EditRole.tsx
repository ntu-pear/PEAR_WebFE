import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
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
  ArrowLeft,
  ShieldCheck,
  Users,
  Info,
  Fingerprint,
  UserPlus,
  Save,
} from "lucide-react";

import useGetUsersFromRole from "@/hooks/role/useGetUsersFromRole";
import { Role, updateRole } from "@/api/role/roles";
import {
  AccessLevel,
  fetchAccessLevels,
} from "@/api/access_level/access_level";

const EditRole: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role as Role | undefined;
  const mode = (location.state?.mode as "view" | "edit" | undefined) ?? "view";

  const canEditRoleFields = mode === "edit";
  const canManageAssignments = true;

  const { data: users, isLoading } = useGetUsersFromRole(role?.roleName || "");

  const [description, setDescription] = useState(role?.description || "");
  const [accessLevelId, setAccessLevelId] = useState(
    role?.accessLevel?.id || ""
  );
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadAccessLevels = async () => {
      try {
        const res = await fetchAccessLevels();
        setAccessLevels([...res].sort((a, b) => a.levelRank - b.levelRank));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load access levels.");
      }
    };

    if (canEditRoleFields) {
      loadAccessLevels();
    }
  }, [canEditRoleFields]);

  const selectedAccessLevel = useMemo(() => {
    return (
      accessLevels.find((lvl) => lvl.id === accessLevelId) ||
      role?.accessLevel ||
      null
    );
  }, [accessLevels, accessLevelId, role?.accessLevel]);

  if (!role) {
    return (
      <div className="p-8 text-center font-sans">
        <p className="text-muted-foreground">No role data found.</p>
        <Button
          onClick={() => navigate("/admin/manage-roles")}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateRole(role.id, {
        description,
        accessLevelId,
      });

      toast.success("Role updated successfully.");

      navigate(`/admin/edit-role/${role.id}`, {
        replace: true,
        state: {
          role: {
            ...role,
            description,
            accessLevel: selectedAccessLevel,
          },
          mode: "edit",
        },
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || "Failed to update role."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      <div className="max-w-7xl mx-auto">
       <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
  <ArrowLeft className="h-4 w-4 mr-2" />
  Back
</Button>

<div className="flex items-start justify-between gap-4 mb-8">
  <div className="flex-1 min-w-0 px-7">
    <h1 className="text-3xl font-semibold">{role.roleName}</h1>
    <p className="text-sm text-muted-foreground">
      Access Level: {role.accessLevel?.levelName || "Role configuration"}
    </p>
  </div>

  <div className="shrink-0 pt-1">
    <Badge
      variant={role.isDeleted ? "secondary" : "default"}
      className="h-12 px-10 text-lg font-semibold rounded-full"
    >
      {!role.isDeleted ? "Active" : "Deleted"}
    </Badge>


            {canEditRoleFields && (
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <CardTitle>Role specifications</CardTitle>
                </div>
                <CardDescription>
                  Review the role description, assigned access level, and access description.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Responsibilities and scope
                  </label>

                  {canEditRoleFields ? (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full min-h-[140px] rounded-xl border border-border bg-background p-5 text-sm text-foreground leading-relaxed resize-none"
                      placeholder="Enter role responsibilities and scope..."
                    />
                  ) : (
                    <div className="p-5 bg-muted/20 rounded-xl border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {role.description ||
                        "No specific responsibilities defined for this role."}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Assigned access level
                    </label>

                    {canEditRoleFields ? (
                      <select
                        value={accessLevelId}
                        onChange={(e) => setAccessLevelId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
                      >
                        {accessLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.levelName} • Rank {level.levelRank} • {level.code}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl border border-border">
                        <Fingerprint className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {role.accessLevel?.levelName || "Standard"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Rank {role.accessLevel?.levelRank || "0"} •{" "}
                            {role.accessLevel?.code || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Access Description
                    </label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedAccessLevel?.description ||
                        "Generic access rights apply to this level."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border border-border shadow-sm h-full flex flex-col rounded-2xl overflow-hidden bg-card">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <CardTitle>Assigned staff</CardTitle>
                  </div>

                  <Badge variant="secondary" className="text-sm px-3">
                    {users?.length || 0}
                  </Badge>
                </div>
                <CardDescription>
                  Users currently assigned to this role.
                </CardDescription>
              </CardHeader >

              <CardContent className="flex-1 p-0">
                <div className="max-h-[450px] overflow-y-auto divide-y divide-border">
                  {isLoading ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">
                      Loading...
                    </p>
                  ) : users?.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">
                      No users assigned
                    </p>
                  ) : (
                    users?.map((user) => (
                      <div
                        key={user.id}
                        className="px-6 py-3 hover:bg-muted/50"
                      >
                        <div className="text-sm font-medium text-foreground">
                          {user.FullName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.id}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>

              <div className="p-6 border-t">
                <Button
                  disabled={!canManageAssignments}
                  className="w-full"
                  onClick={() =>
                    navigate(`/admin/edit-user-in-role/${role.id}`, {
                      state: { role },
                    })
                  }
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Assignments
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRole;