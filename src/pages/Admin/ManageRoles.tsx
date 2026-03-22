import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DataTableServer } from "@/components/Table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Searchbar from "@/components/Searchbar";
import {
  Edit2,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import { fetchRolesPaginated, RolesResponse, Role } from "@/api/role/roles";

const DEFAULT_PAGE_SIZE = 10;

const ManageRoles: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RolesResponse>({
    total: 0,
    page: 0,
    page_size: DEFAULT_PAGE_SIZE,
    roles: [],
  });

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlName = queryParams.get("name") ?? "";
  const urlSortBy = queryParams.get("sortBy") ?? "roleName";
  const urlSortDir = (queryParams.get("sortDir") === "desc" ? "desc" : "asc") as "asc" | "desc";
  const page = Number(queryParams.get("page") ?? "0");

  const [nameInput, setNameInput] = useState(urlName);
  const debouncedName = useDebounce(nameInput, 300);

  const updateQuery = useCallback(
    (updates: Record<string, any>) => {
      const next = new URLSearchParams(location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value && value !== 0) next.delete(key);
        else next.set(key, String(value));
      });
      navigate({ pathname: location.pathname, search: next.toString() }, { replace: true });
    },
    [location.pathname, location.search, navigate]
  );

  useEffect(() => {
    updateQuery({ name: debouncedName, page: 0 });
  }, [debouncedName, updateQuery]);

  useEffect(() => {
    setLoading(true);
    fetchRolesPaginated(page, DEFAULT_PAGE_SIZE, urlName, urlSortBy, urlSortDir)
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, urlName, urlSortBy, urlSortDir]);

  const columns = [
    { key: "id", header: "ID", sortable: true },
    { key: "roleName", header: "Name", sortable: true },
    {
      key: "accessLevel.levelName",
      header: "Access Level",
      render: (_: any, role: Role) => <Badge>{role.accessLevel?.levelName || "UNSET"}</Badge>,
    },
    { key: "description", header: "Description" },
    {
      key: "isDeleted",
      header: "Status",
      render: (isDeleted: boolean) => (
        <Badge variant={!isDeleted ? "default" : "secondary"}>
          {!isDeleted ? "Active" : "Archived"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "font-sans w-[80px] px-4",
      render: (_: any, role: Role) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary hover:bg-accent group"
          onClick={() =>
            navigate(`/admin/edit-role/${role.id}`, {
              state: { role, mode: "view" },
            })
          }
        >
          <Edit2 className="h-4 w-4 mr-1" />
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen w-full font-sans">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="-ml-6">
                      <Searchbar
                searchItem={nameInput}
                onSearchChange={(e) => setNameInput(e.target.value)}
                placeholder="Filter by role title..."
              />
              </div>
            <div className="flex items-center gap-5">

              <div className="space-y-1"></div>
            </div>
          </header>


          <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-2xl">
            <CardHeader>
              <CardTitle>Manage Roles</CardTitle>
              <CardDescription>
                View Role Information and Edit Role Assignments. Click on a role to see details and manage user assignments.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <DataTableServer
                  data={data.roles}
                  columns={columns}
                  pagination={{
                    pageNo: data.page,
                    pageSize: data.page_size,
                    totalRecords: data.total,
                    totalPages: Math.ceil(data.total / data.page_size) || 1,
                  }}
                  fetchData={(p, ps, sb, sd) =>
                    updateQuery({ page: p, pageSize: ps, sortBy: sb, sortDir: sd })
                  }
                  sortBy={urlSortBy}
                  sortDir={urlSortDir}
                  loading={loading}
                  className="min-w-full"
                />
              </div>
            </CardContent>
          </Card>

          <footer className="flex items-center gap-3 px-5 py-5 bg-pending/30 rounded-2xl border border-pending/50">
            <ShieldAlert className="h-4 w-4 text-pending-foreground" />
            <p className="text-[11px] text-pending-foreground font-semibold uppercase tracking-widest">
              Audit Notice: Role changes impact system-wide visibility and are logged for security
              compliance.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ManageRoles;