import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DataTableClient } from "@/components/Table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Searchbar from "@/components/Searchbar";

import { Edit2, ShieldAlert, ChevronRight } from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import { fetchRolesPaginated, Role } from "@/api/role/roles";

const CLIENT_PAGE_SIZE = 10;
const FETCH_ALL_PAGE_SIZE = 1000;

const ManageRoles: React.FC = () => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const debouncedName = useDebounce(nameInput, 300);

  useEffect(() => {
    setLoading(true);

    fetchRolesPaginated(0, FETCH_ALL_PAGE_SIZE)
      .then((res) => {
        setRoles(res.roles ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredRoles = useMemo(() => {
    const search = debouncedName.trim().toLowerCase();

    if (!search) return roles;

    return roles.filter((role) => {
      const roleName = role.roleName ?? "";
      const description = role.description ?? "";
      const accessLevelName = role.accessLevel?.levelName ?? "";

      return (
        roleName.toLowerCase().includes(search) ||
        description.toLowerCase().includes(search) ||
        accessLevelName.toLowerCase().includes(search)
      );
    });
  }, [roles, debouncedName]);

  const columns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
    },
    {
      key: "roleName",
      header: "Name",
      sortable: true,
    },
    {
      key: "accessLevel.levelRank",
      header: "Access Level",
      sortable: true,
      render: (_: any, role: Role) => (
        <Badge>{role.accessLevel?.levelName || "UNSET"}</Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
    },
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
              <div className="space-y-1" />
            </div>
          </header>

          <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-2xl">
            <CardHeader>
              <CardTitle>Manage Roles</CardTitle>
              <CardDescription>
                View Role Information and Edit Role Assignments. Click on a
                role to see details and manage user assignments.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <DataTableClient
                  data={filteredRoles}
                  columns={columns}
                  itemsPerPage={CLIENT_PAGE_SIZE}
                  loading={loading}
                  className="min-w-full"
                  viewMore={false}
                />
              </div>
            </CardContent>
          </Card>

          <footer className="flex items-center gap-3 px-5 py-5 bg-pending/30 rounded-2xl border border-pending/50">
            <ShieldAlert className="h-4 w-4 text-pending-foreground" />
            <p className="text-[11px] text-pending-foreground font-semibold uppercase tracking-widest">
              Audit Notice: Role changes impact system-wide visibility and are
              logged for security compliance.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ManageRoles;