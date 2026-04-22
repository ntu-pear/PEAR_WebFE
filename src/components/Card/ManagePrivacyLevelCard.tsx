import useGetRoles from "@/hooks/role/useGetRoles";
import useUpdateRoleAccessLevel from "@/hooks/role/useUpdateRolesAccessLevel";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTableServer } from "@/components/Table/DataTable";
import Searchbar from "@/components/Searchbar";
import { InfoIcon, SaveIcon } from "lucide-react";
import RadioGroup from "../Form/RadioGroup";
import { Button } from "../ui/button";
import { toast } from "sonner";

type AccessLevelCode = "NONE" | "LOW" | "MEDIUM" | "HIGH";

type AccessLevelForm = {
  [roleName: string]: AccessLevelCode;
};

type Row = {
  id: string;
  name: string;
  label: string;
  privacyLevel: AccessLevelCode;
};

const DEFAULT_PAGE_SIZE = 10;

// map seeded system codes to seeded IDs
const ACCESS_LEVEL_CODE_TO_ID: Record<AccessLevelCode, string> = {
  NONE: "ACL00001",
  LOW: "ACL00002",
  MEDIUM: "ACL00003",
  HIGH: "ACL00004",
};

const ManageAccessLevelCard = () => {
  const { data, refetch } = useGetRoles();
  const updateRoleAccessLevel = useUpdateRoleAccessLevel();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<"role" | "access">("role");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const rows = useMemo<Row[]>(
    () =>
      data
        ?.filter(
          (role) =>
            role.roleName !== "ADMIN" && role.roleName !== "GUARDIAN"
        )
        .map((role) => ({
          id: role.id,
          name: role.roleName,
          label: role.roleName,
          privacyLevel: role.accessLevel?.code as AccessLevelCode,
        })) ?? [],
    [data]
  );

  const formValues = useMemo(
    () =>
      data?.reduce((acc, role) => {
        acc[role.roleName] = role.accessLevel?.code as AccessLevelCode;
        return acc;
      }, {} as AccessLevelForm),
    [data]
  );

  const form = useForm<AccessLevelForm>({ values: formValues });

  const filteredRows = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return rows;

    return rows.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.privacyLevel.toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const copy = [...filteredRows];

    copy.sort((a, b) => {
      let cmp = 0;

      if (sortBy === "role") {
        cmp = a.label.localeCompare(b.label);
      } else {
        cmp = a.privacyLevel.localeCompare(b.privacyLevel);
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return copy;
  }, [filteredRows, sortBy, sortDir]);

  const paginatedRows = useMemo(() => {
    const start = page * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  const handleTableFetch = (
    nextPage: number,
    nextPageSize: number,
    nextSortBy?: string,
    nextSortDir?: "asc" | "desc"
  ) => {
    setPage(nextPage);
    setPageSize(nextPageSize);

    if (nextSortBy === "label") setSortBy("role");
    if (nextSortBy === "access") setSortBy("access");

    if (nextSortDir) setSortDir(nextSortDir);
  };

  const onSubmitPrivacyLevel: SubmitHandler<AccessLevelForm> = (formData) => {
    let isChanged = false;

    for (const row of rows) {
      const newCode = formData[row.name];

      if (newCode !== row.privacyLevel) {
        isChanged = true;

        updateRoleAccessLevel.mutate(
          {
            roleId: row.id,
            roleName: row.name,
            accessLevelId: ACCESS_LEVEL_CODE_TO_ID[newCode],
          },
          {
            onSuccess: () => refetch(),
          }
        );
      }
    }

    if (!isChanged) {
      toast.info("No changes made to access levels");
    } else {
      console.log("Security configuration updated");
    }
  };

  const columns = [
    {
      key: "label",
      header: "Role",
      sortable: true,
      render: (_: any, row: Row) => (
        <span className="text-sm font-medium text-foreground">
          {row.label}
        </span>
      ),
    },
    {
      key: "access",
      header: "Access level",
      sortable: true,
      render: (_: any, row: Row) => (
        <RadioGroup
          form={form}
          name={row.name}
          options={[
            { label: "None", value: "NONE" },
            { label: "Low", value: "LOW" },
            { label: "Medium", value: "MEDIUM" },
            { label: "High", value: "HIGH" },
          ]}
        />
      ),
    },
  ];

  return (
    <Card className="border border-border shadow-sm bg-card overflow-visible rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Access levels</CardTitle>

          <div className="relative flex items-center">
            <div
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              <InfoIcon className="h-4 w-4" />
            </div>

            {tooltipVisible && (
              <div className="absolute left-0 top-full z-20 mt-2 w-80 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
                Select the access level for each role.
              </div>
            )}
        </div>
        </div>

        <CardDescription>
          Configure access levels for each role.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={form.handleSubmit(onSubmitPrivacyLevel)}>
          <div className="flex flex-col md:flex-row md:items-center justify-end gap-6 mb-6">
            <Searchbar
              searchItem={searchTerm}
              onSearchChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Filter roles..."
            />
          </div>

          <div className="overflow-x-auto">
            <DataTableServer
              data={paginatedRows}
              columns={columns}
              pagination={{
                pageNo: page,
                pageSize,
                totalRecords: sortedRows.length,
                totalPages: Math.ceil(sortedRows.length / pageSize) || 1,
              }}
              fetchData={handleTableFetch}
              sortBy={sortBy === "role" ? "label" : "access"}
              sortDir={sortDir}
              className="min-w-full"
              viewMore={false}
            />
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" size="sm" className="gap-2">
              <SaveIcon className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManageAccessLevelCard;