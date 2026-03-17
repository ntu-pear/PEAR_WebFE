import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { ListFilter, Plus } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CentreActivityForm from "@/components/Form/CentreActivityForm";
import CentreActivitiesTable from "@/components/Table/CentreActivitiesTable";
import { useCentreActivities, useCentreActivityMutations, type CentreActivityRow, toRows } from "@/hooks/activities/useCentreActivities";
import { CentreActivityFormValues } from "@/lib/validation/centreActivity";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";

function confirmAction(message: string) {
  return window.confirm(message);
}

export default function ManageCentreActivities() {
  const [deletedFilter, setDeletedFilter] = useState<"hidden" | "all" | "only">("hidden");
  const [search, setSearch] = useState("");
  const [creatingOpen, setCreatingOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<CentreActivityRow | null>(null);
  const [page, setPage] = useState(1);
  const [compulsory, setCompulsory] = useState<"all" | "true" | "false">("all");
  const [fixed, setFixed] = useState<"all" | "true" | "false">("all");
  const [group, setGroup] = useState<"all" | "true" | "false">("all");

  const { centreActivities, loading, error, refreshCentreActivities } = useCentreActivities(true);
  const { create, update, remove } = useCentreActivityMutations();
  const todayDate = dayjs(new Date().toDateString()).format("YYYY-MM-DD");

  useEffect(() => {
    if (error) toast.error(`Failed to load centre activities. ${error}`);
  }, [error]);

  // Reset to first page whenever list or filters change
  useEffect(() => setPage(1), [search, deletedFilter, fixed, compulsory, group, centreActivities]);

  const filteredData = useMemo(() => {
    let filtered = centreActivities ?? [];

    // Deleted filter
    if (deletedFilter === "hidden") filtered = filtered.filter(ca => !ca.is_deleted);
    else if (deletedFilter === "only") filtered = filtered.filter(ca => ca.is_deleted);
    else filtered = filtered; // "all"

    if (deletedFilter === "all") {
      filtered.sort((a, b) => (a.is_deleted === b.is_deleted ? 0 : a.is_deleted ? -1 : 1));
    }

    // Boolean filters
    if (compulsory !== "all") filtered = filtered.filter(ca => String(ca.is_compulsory) === compulsory);
    if (fixed !== "all") filtered = filtered.filter(ca => String(ca.is_fixed) === fixed);
    if (group !== "all") filtered = filtered.filter(ca => String(ca.is_group) === group);

    return toRows(filtered);
  }, [centreActivities, deletedFilter, fixed, compulsory, group]);

  const handleCreate = async (values: CentreActivityFormValues) => {
    try {
      await create.mutateAsync(values);
      setCreatingOpen(false);
      refreshCentreActivities();
      toast.success("Centre Activity created.");
    } catch (error: any) {
      console.error("Error creating centre activity:", error);
      toast.error(`Failed to create. ${error?.message ?? ""}`);
    }
  };

  const handleUpdate = async (values: CentreActivityFormValues) => {
    if (!editing) return;
    try {
      await update.mutateAsync({ id: editing.id, ...values, is_deleted: editing.is_deleted });
      refreshCentreActivities();
      setEditing(null);
      toast.success("Centre Activity updated.");
    } catch (error: any) {
      console.error("Error updating centre activity:", error);
      toast.error(`Failed to update. ${error?.message ?? ""}`);
    }
  };

  const booleanOptions = [
    { key: "All", value: "all" },
    { key: "Yes", value: "true" },
    { key: "No", value: "false" },
  ];

  const deletedOptions = [
    { key: "Hidden", value: "hidden" },
    { key: "All", value: "all" },
    { key: "Only Deleted", value: "only" },
  ];

  const clearAllFilters = () => {
    setCompulsory("all");
    setFixed("all");
    setGroup("all");
    setDeletedFilter("hidden");
    setSearch("");
  };

  const hasActiveFilters =
    compulsory !== "all" ||
    fixed !== "all" ||
    group !== "all" ||
    deletedFilter !== "hidden" ||
    search !== "";

  // Generic filter dropdown
  const renderFilter = <T extends string>(
  title: string,
  value: T,
  setValue: (value: T) => void,
  options: { key: string; value: T }[]
) => (
  <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <ListFilter className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{title}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuRadioGroup
        value={value}
        onValueChange={(v: string) => setValue(v as T)} // 🔑 cast string to T
      >
        {options.map(({ key, value }) => (
          <DropdownMenuRadioItem key={value} value={value}>
            {key}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <div className="flex justify-between items-center">
          <div className="w-full md:max-w-md">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="flex space-x-2">
            {renderFilter("Compulsory", compulsory, (v) => setCompulsory(v as typeof compulsory), booleanOptions)}
            {renderFilter("Fixed", fixed, (v) => setFixed(v as typeof fixed), booleanOptions)}
            {renderFilter("Group", group, (v) => setGroup(v as typeof group), booleanOptions)}
            {renderFilter("Deleted", deletedFilter, (v) => setDeletedFilter(v as typeof deletedFilter), deletedOptions)}
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="h-8" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <main className="flex-1 items-start gap-4 p-4 sm:px-0 sm:py-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-end">
                <div className="space-y-1.5">
                  <CardTitle>Manage Centre Activities</CardTitle>
                  <CardDescription>Manage centre activities for patients</CardDescription>
                </div>

                {/* Create sheet */}
                <Sheet open={creatingOpen} onOpenChange={setCreatingOpen}>
                  <SheetTrigger asChild>
                    <Button className="h-10">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Centre Activity
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[680px] sm:w-[540px]">
                    <SheetHeader><SheetTitle>Create Centre Activity</SheetTitle></SheetHeader>
                    <div className="h-[90vh] overflow-y-auto">
                      <CentreActivityForm
                        submitting={create.isPending}
                        onSubmit={handleCreate}
                        onCancel={() => setCreatingOpen(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading…</div>
              ) : (
                <CentreActivitiesTable
                  data={filteredData}
                  query={search}
                  page={page}
                  setPage={setPage}
                  onEdit={(row) => setEditing(row)}
                  onDelete={(row) => {
                    const msg = "Deleting this centre activity will remove its availabilities and patient schedules may be regenerated. Do you wish to continue?";
                    if (confirmAction(msg)) {
                      remove.mutate(row.id, {
                        onSuccess: () => {
                          refreshCentreActivities();
                          toast.success("Centre Activity Deleted.");
                        },
                        onError: (err: any) => toast.error(`Failed to delete. ${err.message ?? ""}`),
                      });
                    }
                  }}
                />
              )}

              {/* Edit sheet */}
              <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
                <SheetContent className="w-[480px] sm:w-[540px]">
                  <SheetHeader><SheetTitle>Edit Activity</SheetTitle></SheetHeader>
                  {editing && (
                    <div className="h-[90vh] overflow-y-auto">
                      <CentreActivityForm
                        initial={{
                          id: editing.id,
                          activity_id: editing.activity_id,
                          is_fixed: editing.is_fixed,
                          is_compulsory: editing.is_compulsory,
                          is_group: editing.is_group,
                          min_duration: editing.min_duration,
                          max_duration: editing.max_duration,
                          start_date: new Date(editing.start_date) < new Date() ? todayDate : editing.start_date,
                          end_date: editing.end_date,
                          min_people_req: editing.min_people_req,
                          fixed_time_slots: editing.fixed_time_slots,
                          is_deleted: editing.is_deleted
                        }}
                        onSubmit={handleUpdate}
                        submitting={update.isPending}
                        onCancel={() => setEditing(null)}
                      />
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}