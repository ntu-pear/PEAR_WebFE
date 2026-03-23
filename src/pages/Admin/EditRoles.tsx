import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DataTableServer, DataTableClient } from "@/components/Table/DataTable";
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
  CardContent,
} from "@/components/ui/card";
import { PlusCircle, Trash2, Edit2, ShieldAlert, ChevronRight } from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import { fetchRolesPaginated, RolesResponse, Role } from "@/api/role/roles";
import {
  AccessLevel,
  fetchAccessLevels,
} from "@/api/access_level/access_level";

const PAGE_SIZE = 10;

const EditRoles: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeModal, openModal } = useModal();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RolesResponse>({
    total: 0,
    page: 0,
    page_size: PAGE_SIZE,
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
          PAGE_SIZE,
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
      header: "Name",
      render: (val: string, role: Role) => (
        <div>
          <div className="text-sm font-medium text-foreground">{val}</div>
          <div className="text-sm text-muted-foreground">
            {role.description || "(no description)"}
          </div>
        </div>
      ),
    },
    {
      key: "id",
      header: "ID",
      render: (val: string) => (
        <span className="font-mono text-sm text-foreground">{val}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "font-sans w-[120px] px-4",
      render: (_: any, role: Role) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary hover:bg-accent group"
            onClick={() =>
              navigate(`/admin/edit-role/${role.id}`, {
                state: { role, mode: "edit" },
              })
            }
          >
            <Edit2 className="h-4 w-4 mr-1" />
            <span>Edit</span>
            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary hover:bg-accent"
            disabled={role.roleName === "ADMIN"}
            onClick={() =>
              openModal("deleteRole", {
                role,
                onSuccess: loadData,
              })
            }
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const accessLevelColumns = [
  {
    key: "levelName",
    header: "Name",
    render: (val: string, lvl: AccessLevel) => (
      <div>
        <div className="text-sm font-medium text-foreground">{val}</div>
        <div className="text-sm text-muted-foreground">
          {lvl.description || "(no description)"}
        </div>
      </div>
    ),
  },
  {
    key: "id",
    header: "ID",
    render: (val: string) => (
      <span className="font-mono text-sm text-foreground">{val}</span>
    ),
  },
  {
    key: "levelRank",
    header: "Rank",
    render: (val: number) => (
      <span className="font-mono text-sm text-foreground">{val}</span>
    ),
  },
  {
    key: "code",
    header: "Code",
    render: (val: string) => (
      <span className="font-mono text-sm text-foreground">{val}</span>
    ),
  },
  {
    key: "actions",
    header: "",
    className: "font-sans w-[120px] px-4",
    render: (_: any, lvl: AccessLevel) => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary hover:bg-accent"
          onClick={() =>
            openModal("editAccessLevel", {
              level: lvl,
              onSuccess: loadData,
            })
          }
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary hover:bg-accent"
          disabled={lvl.isSystem}
          onClick={() =>
            openModal("deleteAccessLevel", {
              level: lvl,
              onSuccess: loadData,
            })
          }
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    ),
  },
];

  return (
    <div className="flex min-h-screen w-full font-sans">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Tabs
              value={activeTab}
              onValueChange={(val) => updateQuery({ tab: val, page: 0, name: "" })}
              className="w-full"
            >
              <div className="flex items-center justify-between gap-4">
                <TabsList className="bg-muted/50 border border-border p-1 rounded-xl">
                  <TabsTrigger
                    value="roles"
                    className="px-5 py-2 rounded-lg text-sm"
                  >
                    Roles
                  </TabsTrigger>
                  <TabsTrigger
                    value="levels"
                    className="px-5 py-2 rounded-lg text-sm"
                  >
                    Access Levels
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-3 px-5 py-5 bg-pending/30 rounded-2xl border border-pending/50">
                  <ShieldAlert className="h-4 w-4 text-pending-foreground" />
                  <p className="text-[11px] text-pending-foreground font-semibold uppercase tracking-widest">
                    Administrative workspace
                  </p>
                </div>
              </div>

              <TabsContent value="roles" className="mt-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mb-0">
                  <Searchbar
                    searchItem={nameInput}
                    onSearchChange={(e) => setNameInput(e.target.value)}
                    placeholder="Filter by role title..."
                  />
                  <div className="flex items-center gap-5">
                    <Button
                      onClick={() => navigate("/admin/create-role")}
                      size="sm"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Role
                    </Button>
                  </div>
                </header>

                <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-2xl mt-6">
                  <CardHeader>
                    <CardTitle>Access Control</CardTitle>
                    <CardDescription>
                      Configure institutional roles and responsibility scopes.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
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
                        className="min-w-full"
                        viewMore={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="levels" className="mt-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mb-0">
                  <div />
                  <div className="flex items-center gap-5">
                    <Button
                      size="sm"
                      onClick={() =>
                        openModal("createAccessLevel", {
                          onSuccess: loadData,
                        })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Access Level
                    </Button>
                  </div>
                </header>

                <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-2xl mt-6">
                  <CardHeader>
                    <CardTitle>Access Level Definitions</CardTitle>
                    <CardDescription>
                      Seeded system levels can only have their descriptions updated. Custom
                      levels may be edited or deleted.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <DataTableClient<AccessLevel>
                        data={accessLevels}
                        columns={accessLevelColumns}
                        loading={loading}
                        className="min-w-full"
                        viewMore={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {activeModal.name === "deleteRole" && <DeleteRoleModal />}
      {activeModal.name === "editAccessLevel" && <EditAccessLevelModal />}
      {activeModal.name === "deleteAccessLevel" && <DeleteAccessLevelModal />}
      {activeModal.name === "createAccessLevel" && <AddAccessLevelModal />}
    </div>
  );
};

export default EditRoles;