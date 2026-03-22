import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
    <div className="min-h-screen bg-background p-4 sm:p-8 font-sans">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between max-w-7xl mx-auto">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-3 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            BACK
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/10">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground lowercase first-letter:uppercase">
                {role.roleName}
              </h1>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em] mt-1">
                INTERNAL ID: {role.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Badge
            className={`font-bold text-[10px] uppercase tracking-wider px-3 py-1 ${
              !role.isDeleted
                ? "bg-approve text-approve-foreground"
                : "bg-reject text-reject-foreground"
            }`}
          >
            {!role.isDeleted ? "Live" : "Archived"}
          </Badge>

          {canEditRoleFields && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="font-bold"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Role Specifications
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.15em]">
                  Responsibilities & Scope
                </label>

                {canEditRoleFields ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[140px] rounded-xl border border-border bg-background p-5 text-[13px] text-foreground leading-relaxed font-medium resize-none"
                    placeholder="Enter role responsibilities and scope..."
                  />
                ) : (
                  <div className="p-5 bg-muted/20 rounded-xl border border-border text-[13px] text-foreground leading-relaxed font-medium whitespace-pre-wrap">
                    {role.description ||
                      "No specific responsibilities defined for this role."}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.15em]">
                    Assigned Access Level
                  </label>

                  {canEditRoleFields ? (
                    <select
                      value={accessLevelId}
                      onChange={(e) => setAccessLevelId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground"
                    >
                      {accessLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.levelName} • Rank {level.levelRank} •{" "}
                          {level.code}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <Fingerprint className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-bold text-foreground text-sm uppercase tracking-tight">
                          {role.accessLevel?.levelName || "Standard"}
                        </p>
                        <p className="text-[9px] text-primary font-bold uppercase tracking-[0.1em]">
                          RANK {role.accessLevel?.levelRank || "0"} •{" "}
                          {role.accessLevel?.code || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.15em]">
                    Security Definition
                  </label>
                  <p className="text-[12px] text-muted-foreground font-medium leading-normal italic">
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
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">
                    Assigned Staff
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px] px-2">
                  {users?.length || 0}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
              <div className="max-h-[450px] overflow-y-auto">
                {isLoading ? (
                  <p className="p-8 text-center text-[12px] text-muted-foreground animate-pulse font-medium">
                    RETRIEVING RECORDS...
                  </p>
                ) : users?.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="h-8 w-8 text-muted/50 mx-auto mb-3" />
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      No users assigned
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {users?.map((user) => (
                      <div
                        key={user.id}
                        className="px-6 py-4 hover:bg-muted/50 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-[13px] font-semibold text-foreground tracking-tight">
                          {user.FullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                          {user.id}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>

            <div className="p-5 bg-muted/30 border-t">
              <Button
                disabled={!canManageAssignments}
                className="w-full bg-background text-primary border-border hover:bg-primary hover:text-primary-foreground font-bold text-[11px] uppercase tracking-widest py-6 shadow-sm transition-all rounded-xl"
                variant="outline"
                onClick={() =>
                  navigate(`/admin/edit-user-in-role/${role.id}`, {
                    state: { role },
                  })
                }
              >
                <UserPlus className="h-4 w-4 mr-2" />
                MANAGE ASSIGNMENTS
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditRole;