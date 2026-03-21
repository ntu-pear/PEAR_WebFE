import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DataTableServer } from "@/components/Table/DataTable";
import { Button } from "@/components/ui/button";
import Searchbar from "@/components/Searchbar";
import { useModal } from "@/hooks/useModal";
import DeleteRoleModal from "@/components/Modal/Delete/DeleteRoleModal";
import DeleteAccessLevelModal from "@/components/Modal/Delete/DeleteAccessLevelModal";
import EditAccessLevelModal from "@/components/Modal/Edit/EditAccessLevelModal";
import AddAccessLevelModal from "@/components/Modal/Add/AddAccessLevelModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Wrench,
  PlusCircle,
  Trash2,
  Edit,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
  Lock,
} from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import { fetchRolesPaginated, RolesResponse, Role } from "@/api/role/roles";
import {
  AccessLevel,
  fetchAccessLevels,
} from "@/api/access_level/access_level";

const EditRoles: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeModal, openModal } = useModal();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RolesResponse>({
    total: 0,
    page: 0,
    page_size: 10,
    roles: [],
  });
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const activeTab = queryParams.get("tab") ?? "roles";
  const urlName = queryParams.get("name") ?? "";
  const page = Number(queryParams.get("page") ?? "0");

  const [nameInput, setNameInput] = useState(urlName);
  const debouncedName = useDebounce(nameInput, 300);

  const updateQuery = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(location.search);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      });

      navigate(
        { pathname: location.pathname, search: next.toString() },
        { replace: true }
      );
    },
    [location.pathname, location.search, navigate]
  );

  useEffect(() => {
    if (activeTab === "roles") {
      updateQuery({ name: debouncedName, page: 0 });
    }
  }, [debouncedName, activeTab, updateQuery]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "roles") {
        const res = await fetchRolesPaginated(
          page,
          10,
          urlName,
          "roleName",
          "asc"
        );
        setData(res);
      } else {
        const res = await fetchAccessLevels();
        const normalized = [...res].sort((a, b) => a.levelRank - b.levelRank);
        setAccessLevels(normalized);
      }
    } catch (error) {
      toast.error("Failed to load workbench data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, urlName, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const roleColumns = [
    {
      key: "roleName",
      header: "Role Title",
      className:
        "w-[220px] font-sans font-bold text-foreground text-[15px] tracking-tight px-6",
      render: (val: string, role: Role) => (
        <div className="flex flex-col py-3">
          <span className="font-bold">{val}</span>
          <p className="text-[12px] text-muted-foreground font-medium italic mt-0.5">
            {role.description || "No description set..."}
          </p>
        </div>
      ),
    },
    {
      key: "id",
      header: "System ID",
      className:
        "w-[160px] font-mono text-[12px] text-muted-foreground font-medium px-6",
      render: (val: string) => (
        <span className="truncate-column block">{val}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "px-6 w-[180px]",
      render: (_: any, role: Role) => (
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/10 font-semibold text-[13px] px-4"
            onClick={() =>
              navigate(`/admin/edit-role/${role.id}`, { state: { role, mode:"edit" } })
            }
          >
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-reject hover:bg-reject/10 font-semibold text-[13px] px-4"
            disabled={role.roleName === "ADMIN"}
            onClick={() =>
              openModal("deleteRole", {
                role,
                onSuccess: loadData,
              })
            }
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <div className="bg-card border-b border-border px-8 py-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-8 w-[1px] bg-border" />

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-md shadow-primary/20">
              <Wrench className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Role Workbench
            </h1>
          </div>
        </div>

        {activeTab === "roles" && (
          <Button
            onClick={() => navigate("/admin/create-role")}
            className="bg-primary text-primary-foreground font-bold text-[14px] px-6 py-6 rounded-xl shadow-lg shadow-primary/10"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Role
          </Button>
        )}
      </div>

      <main className="p-10 max-w-7xl mx-auto w-full flex-1">
        <Tabs
          value={activeTab}
          onValueChange={(val) => updateQuery({ tab: val, page: 0, name: "" })}
        >
          <div className="flex items-center justify-between mb-10">
            <TabsList className="bg-muted/50 border border-border p-1.5 rounded-2xl">
              <TabsTrigger
                value="roles"
                className="text-[14px] font-semibold px-8 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md"
              >
                Roles
              </TabsTrigger>
              <TabsTrigger
                value="levels"
                className="text-[14px] font-semibold px-8 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md"
              >
                Access Levels
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4 text-pending-foreground bg-pending/30 px-6 py-3 rounded-2xl border border-pending/50">
              <AlertCircle className="h-5 w-5" />
              <span className="text-[13px] font-bold">
                Administrative Workspace
              </span>
            </div>
          </div>

          <TabsContent value="roles">
            <Card className="border border-border shadow-md rounded-2xl overflow-hidden bg-card">
              <div className="p-6 border-b border-border bg-muted/30">
                <Searchbar
                  searchItem={nameInput}
                  onSearchChange={(e) => setNameInput(e.target.value)}
                  placeholder="Search for a role..."
                />
              </div>

              <div className="overflow-x-auto">
                <DataTableServer
                  data={data.roles}
                  columns={roleColumns}
                  pagination={{
                    pageNo: data.page,
                    pageSize: data.page_size,
                    totalRecords: data.total,
                    totalPages: Math.ceil(data.total / data.page_size) || 1,
                  }}
                  fetchData={(p) => updateQuery({ page: p })}
                  loading={loading}
                  className="table-fixed min-w-full"
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="levels">
            <Card className="border border-border shadow-md rounded-2xl overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 border-b p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <ShieldAlert className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg font-bold">
                        Access Level Definitions
                      </CardTitle>
                      <CardDescription className="text-[14px] font-medium text-muted-foreground mt-1.5 italic">
                        Seeded system levels can only have their descriptions
                        updated. Custom levels may be edited or deleted.
                      </CardDescription>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      openModal("createAccessLevel", {
                        onSuccess: loadData,
                      })
                    }
                    className="bg-primary text-primary-foreground font-bold text-[14px] px-5 py-2.5 rounded-xl"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Access Level
                  </Button>
                </div>
              </CardHeader>

              <div className="p-0">
                <table className="w-full text-sm border-collapse table-fixed">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground text-[13px] font-bold text-left">
                      <th className="p-8 w-36">Rank</th>
                      <th className="p-8 w-44">Code</th>
                      <th className="p-8 w-52">Name</th>
                      <th className="p-8">Description</th>
                      <th className="p-8 w-40">Type</th>
                      <th className="p-8 w-56 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {accessLevels.map((lvl) => (
                      <tr
                        key={lvl.id}
                        className="hover:bg-muted/20 transition-colors group"
                      >
                        <td className="p-8 font-mono text-primary font-bold text-[14px]">
                          {lvl.levelRank}
                        </td>

                        <td className="p-8">
                          <span className="font-mono text-[13px] font-semibold text-foreground">
                            {lvl.code}
                          </span>
                        </td>

                        <td className="p-8 font-bold text-foreground text-[15px] tracking-tight">
                          {lvl.levelName}
                        </td>

                        <td className="p-8 text-muted-foreground text-[14px] font-medium leading-relaxed whitespace-pre-wrap">
                          {lvl.description || "No description set."}
                        </td>

                        <td className="p-8">
                          {lvl.isSystem ? (
                            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-[12px] font-bold text-muted-foreground">
                              <Lock className="h-3.5 w-3.5" />
                              System
                            </div>
                          ) : (
                            <div className="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-[12px] font-bold text-primary">
                              Custom
                            </div>
                          )}
                        </td>

                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10 font-bold text-[13px] px-4"
                              onClick={() =>
                                openModal("editAccessLevel", {
                                  level: lvl,
                                  onSuccess: loadData,
                                })
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={lvl.isSystem}
                              className="text-reject hover:bg-reject/10 font-bold text-[13px] px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() =>
                                openModal("deleteAccessLevel", {
                                  level: lvl,
                                  onSuccess: loadData,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!loading && accessLevels.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-10 text-center text-muted-foreground font-medium"
                        >
                          No access levels found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {activeModal.name === "deleteRole" && <DeleteRoleModal />}
      {activeModal.name === "editAccessLevel" && <EditAccessLevelModal />}
      {activeModal.name === "deleteAccessLevel" && <DeleteAccessLevelModal />}
      {activeModal.name === "createAccessLevel" && <AddAccessLevelModal />}
    </div>
  );
};

export default EditRoles;