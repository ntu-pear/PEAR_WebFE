import useGetSocialHistorySensitiveMapping from "@/hooks/socialHistorySensitiveMapping/useGetSocialHistorySensitiveMapping";
import useUpdateSocialHistorySensitiveMapping from "@/hooks/socialHistorySensitiveMapping/useUpdateSocialHistorySensitiveMapping";
import { convertCamelCaseToLabel } from "@/utils/convertCamelCasetoLabel";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { SaveIcon, InfoIcon } from "lucide-react";
import RadioGroup from "../Form/RadioGroup";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "@/components/Table/DataTable";
import Searchbar from "@/components/Searchbar";

type PrivacySettingsForm = {
  [socialHistory: string]: "0" | "1";
};

type SortKey = "socialHistory" | "privacy";
type SortDir = "asc" | "desc";

type PrivacyRow = {
  id: string;
  name: string;
  label: string;
  privacySetting: "0" | "1";
};

const DEFAULT_PAGE_SIZE = 10;

const ManagePrivacySettingsCard = () => {
  const { data } = useGetSocialHistorySensitiveMapping();
  const { mutate } = useUpdateSocialHistorySensitiveMapping();

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<SortKey>("socialHistory");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const baseRows = useMemo<PrivacyRow[]>(
    () =>
      data?.map((item) => ({
        id: item.socialHistoryItem,
        name: item.socialHistoryItem,
        label: convertCamelCaseToLabel(item.socialHistoryItem),
        privacySetting: item.isSensitive ? "1" : "0",
      })) ?? [],
    [data]
  );

  const formValues = useMemo(
    () =>
      (data?.reduce((acc, item) => {
        acc[item.socialHistoryItem] = item.isSensitive ? "1" : "0";
        return acc;
      }, {} as { [item: string]: "0" | "1" })) ?? {},
    [data]
  );

  const form = useForm<PrivacySettingsForm>({
    values: formValues as PrivacySettingsForm,
  });

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    if (!q) return baseRows;

    return baseRows.filter((row) => {
      const privacyLabel =
        row.privacySetting === "1" ? "sensitive" : "non-sensitive";

      return (
        row.label.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        privacyLabel.includes(q)
      );
    });
  }, [baseRows, searchTerm]);

  const sortedRows = useMemo(() => {
    const copied = [...filteredRows];

    copied.sort((a, b) => {
      let cmp = 0;

      if (sortBy === "socialHistory") {
        cmp = a.label.localeCompare(b.label) || a.name.localeCompare(b.name);
      } else {
        const av = Number(a.privacySetting);
        const bv = Number(b.privacySetting);
        cmp = av - bv;
        if (cmp === 0) cmp = a.label.localeCompare(b.label);
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return copied;
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

    if (nextSortBy === "socialHistory" || nextSortBy === "privacy") {
      setSortBy(nextSortBy);
    }

    if (nextSortDir === "asc" || nextSortDir === "desc") {
      setSortDir(nextSortDir);
    }
  };

  const onSubmitPrivacySettings: SubmitHandler<PrivacySettingsForm> = (vals) => {
    if (!sortedRows) return;

    let isChanged = false;

    for (const row of sortedRows) {
      const newSetting = vals[row.name];
      if (newSetting !== row.privacySetting) {
        isChanged = true;
      }
    }

    if (!isChanged) {
      toast.info("No changes made to privacy settings");
      return;
    }

    const changedMappings = sortedRows
      .filter((row) => vals[row.name] !== row.privacySetting)
      .map((row) => ({
        socialHistoryItem: row.name,
        isSensitive: vals[row.name] === "1",
      }));

    mutate(changedMappings);
  };

  const columns = [
    {
      key: "label",
      header: "Social history",
      sortable: true,
      render: (_: string, row: PrivacyRow) => (
        <span className="text-sm font-medium text-foreground">
          {row.label}
        </span>
      ),
    },
    {
      key: "privacy",
      header: "Privacy setting",
      sortable: true,
      render: (_: any, row: PrivacyRow) => (
        <RadioGroup
          form={form}
          name={row.name}
          options={[
            { label: "Sensitive", value: "1" },
            { label: "Non-Sensitive", value: "0" },
          ]}
        />
      ),
    },
  ];

  return (
    <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Privacy settings</CardTitle>

          <div className="relative flex items-center">
            <div
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              <InfoIcon className="h-4 w-4" />
            </div>

            {tooltipVisible && (
              <div className="absolute left-0 top-full z-20 mt-2 w-96 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
                <p>Configure sensitivity of each social history information.</p>
                <p className="mt-1">
                  Non-sensitive social history information can be viewed by
                  Caregivers, Doctors and Supervisors regardless of privacy level.
                </p>
              </div>
            )}
          </div>
        </div>

        <CardDescription>
          Configure the sensitivity of each social history item.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={form.handleSubmit(onSubmitPrivacySettings)}>
          <div className="flex flex-col md:flex-row md:items-center justify-end gap-6 mb-6">
            <Searchbar
              searchItem={searchTerm}
              onSearchChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Filter social history items..."
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
              sortBy={sortBy === "socialHistory" ? "label" : "privacy"}
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

export default ManagePrivacySettingsCard;