import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DataTableServer } from "@/components/Table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Searchbar from "@/components/Searchbar";
import { 
  ShieldCheck, 
  RefreshCcw, 
  Edit2, 
  ShieldAlert,
  ChevronRight 
} from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import { fetchRolesPaginated, RolesResponse, Role } from "@/api/role/roles";

const DEFAULT_PAGE_SIZE = 10;

const ManageRoles: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RolesResponse>({
    total: 0, page: 0, page_size: DEFAULT_PAGE_SIZE, roles: [],
  });

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlName = queryParams.get("name") ?? "";
  const urlSortBy = queryParams.get("sortBy") ?? "roleName";
  const urlSortDir = (queryParams.get("sortDir") === "desc" ? "desc" : "asc") as "asc" | "desc";
  const page = Number(queryParams.get("page") ?? "0");

  const [nameInput, setNameInput] = useState(urlName);
  const debouncedName = useDebounce(nameInput, 300);

  const updateQuery = useCallback((updates: Record<string, any>) => {
    const next = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key); else next.set(key, String(value));
    });
    navigate({ pathname: location.pathname, search: next.toString() }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => { updateQuery({ name: debouncedName, page: 0 }); }, [debouncedName, updateQuery]);

  useEffect(() => {
    setLoading(true);
    fetchRolesPaginated(page, DEFAULT_PAGE_SIZE, urlName, urlSortBy, urlSortDir)
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, urlName, urlSortBy, urlSortDir]);

  const columns = [
    {
      key: "id",
      header: "ROLE ID",
      // Using your .truncate-column logic but allowing it slightly more room for IDs
      className: "w-[140px] font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4",
      sortable: true,
      render: (val: string) => <span className="truncate-column block">{val}</span>
    },
    {
      key: "roleName",
      header: "TITLE",
      className: "w-[200px] font-sans font-bold text-foreground tracking-tight px-4",
      sortable: true,
    },
    {
      key: "accessLevel.levelName",
      header: "SECURITY",
      className: "w-[160px] px-4",
      render: (_: any, role: Role) => (
        <div className="flex flex-col gap-0.5">
          <Badge variant="outline" className="w-fit border-primary/10 bg-secondary text-primary uppercase text-[9px] font-bold tracking-widest px-2 py-0">
            {role.accessLevel?.levelName || "UNSET"}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter pl-1">
            RANK {role.accessLevel?.levelRank ?? '0'}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      header: "RESPONSIBILITIES",
      // Removed fixed width to let table-auto expand this column
      className: "py-5 px-4", 
      render: (val?: string) => (
        <div className="font-sans text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap font-medium max-w-[500px]">
          {val || <span className="text-hint italic font-normal">No responsibilities defined.</span>}
        </div>
      ),
    },
    {
      key: "isDeleted",
      header: "STATUS",
      className: "w-[120px] px-4",
      render: (isDeleted: boolean) => (
        <Badge 
          className={`font-bold text-[10px] uppercase tracking-wider ${!isDeleted ? 'bg-approve text-approve-foreground' : 'bg-reject text-reject-foreground'}`}
        >
          {!isDeleted ? "Active" : "Archived"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[80px] px-4",
      render: (_: any, role: Role) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-primary hover:bg-accent group"
          onClick={() => navigate(`/admin/edit-role/${role.id}`, { state: { role, mode:"view" } })}
        >
          <Edit2 className="h-4 w-4 mr-1" />
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-sans selection:bg-primary/10">
      {/* max-w-7xl ensures it doesn't span full width on huge screens */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/10">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Access Control</h1>
              <p className="text-muted-foreground text-sm font-medium tracking-wide">Configure institutional roles and responsibility scopes.</p>
            </div>
          </div>
        </header>

        {/* Using your table-fixed class for container stability */}
        <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-2xl">
          <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-4">
            <div className="flex-1">
              <Searchbar
                searchItem={nameInput}
                onSearchChange={(e) => setNameInput(e.target.value)}
                placeholder="Filter by role title..."
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setNameInput("")} 
              className="shrink-0 bg-background border-border text-muted-foreground hover:text-foreground"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

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
              fetchData={(p, ps, sb, sd) => updateQuery({ page: p, pageSize: ps, sortBy: sb, sortDir: sd })}
              sortBy={urlSortBy}
              sortDir={urlSortDir}
              loading={loading}
              // Applying your .table-fixed class
              className="table-fixed min-w-[1000px]" 
              viewMore={false}
            />
          </div>
        </Card>

        <footer className="flex items-center gap-3 px-5 py-5 bg-pending/30 rounded-2xl border border-pending/50">
           <ShieldAlert className="h-4 w-4 text-pending-foreground" />
           <p className="text-[11px] text-pending-foreground font-semibold uppercase tracking-widest">
             Audit Notice: Role changes impact system-wide visibility and are logged for security compliance.
           </p>
        </footer>
      </div>
    </div>
  );
};

export default ManageRoles;