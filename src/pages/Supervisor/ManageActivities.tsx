import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, ListFilter } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import ActivityForm from "@/components/Form/ActivityForm";
import ActivitiesTable from "@/components/Table/ActivitiesTable";
import { useActivities, useActivityMutations, toRows, type ActivityRow } from "@/hooks/activities/useActivities";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function confirmAction(message: string) {
  return window.confirm(message);
}

export default function ManageActivities() {
  const [includeDeleted] = useState(false);
  const [deletedFilter, setDeletedFilter] = useState<"hidden" | "all" | "only">("hidden");
  const hasActiveFilters = deletedFilter !== "hidden";
  const [search, setSearch] = useState("");
  const [searchFields, setSearchFields] = useState({
    title: true,
    description: false,
  });
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRow | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useActivities(includeDeleted);
  const { create, update, remove } = useActivityMutations();

  useEffect(() => {
    if (isError) toast.error(`Failed to load activities. ${(error as Error)?.message ?? ""}`);
  }, [isError, error]);

  // reset to first page whenever list or search/toggle changes
  useEffect(() => setPage(1), [search, deletedFilter, data, searchFields]);

  const rows = useMemo(() => {
    let mapped = toRows(data ?? []);

    // Deleted filter
    if (deletedFilter === "hidden") mapped = mapped.filter(r => !r.is_deleted);
    else if (deletedFilter === "only") mapped = mapped.filter(r => r.is_deleted);

    const q = search.trim().toLowerCase();

    if (q) {
      mapped = mapped.filter((r) => {
        const matchTitle =
          searchFields.title &&
          r.title.toLowerCase().includes(q);

        const matchDesc =
          searchFields.description &&
          (r.description ?? "").toLowerCase().includes(q);

        return matchTitle || matchDesc;
      });
    }

    // Sort
    if (deletedFilter === "all") {
      mapped.sort((a, b) => (a.is_deleted === b.is_deleted ? 0 : a.is_deleted ? -1 : 1));
    }

    const sorted = [...mapped].sort((a, b) => a.title.localeCompare(b.title));

    return sorted.map((row) => ({
      ...row,
      title: row.title.toUpperCase(),
    }));
  }, [data, deletedFilter, search, searchFields]);

  const deletedOptions = [
    { key: "Hidden", value: "hidden" },
    { key: "All", value: "all" },
    { key: "Only Deleted", value: "only" },
  ];

  const getFilterLabel = <T extends string>(
    currentValue: T,
    options: { key: string; value: T }[]
  ): string => {
    const found = options.find(o => o.value === currentValue);
    return found ? found.key : "";
  };

  const renderFilter = <T extends string>(
    title: string,
    value: T,
    setValue: (value: T) => void,
    options: { key: string; value: T }[]
  ) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-1 ${value !== "all" && value !== "hidden" ? "border-primary text-primary" : ""}`}
        >
          <ListFilter className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {title}: {getFilterLabel(value, options)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v: string) => setValue(v as T)}
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
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">

        {/* Toolbar */}
        <div className="flex items-center gap-3 w-full">
          {/* Search bar */}
          <div className="w-full md:max-w-md">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Search field buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={searchFields.title ? "default" : "outline"}
              className={`h-8 ${
                searchFields.title ? "bg-primary text-white shadow-md" : ""
              }`}
              onClick={() =>
                setSearchFields((prev) => ({ ...prev, title: !prev.title }))
              }
            >
              Title
            </Button>

            <Button
              size="sm"
              variant={searchFields.description ? "default" : "outline"}
              className="h-8"
              onClick={() =>
                setSearchFields((prev) => ({
                  ...prev,
                  description: !prev.description,
                }))
              }
            >
              Description
            </Button>
          </div>

          {/* Your existing filters */}
          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setDeletedFilter("hidden")}
              >
                Clear Filters
              </Button>
            )}

            {renderFilter(
              "Deleted",
              deletedFilter,
              (v) => setDeletedFilter(v as typeof deletedFilter),
              deletedOptions
            )}
          </div>
        </div>

        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Manage Activities</CardTitle>
                  <CardDescription>Manage all listed activities</CardDescription>
                </div>

                <Sheet open={creatingOpen} onOpenChange={setCreatingOpen}>
                  <SheetTrigger asChild>
                    <Button className="h-10">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Activity
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[480px] sm:w-[540px]">
                    <SheetHeader><SheetTitle>Create Activity</SheetTitle></SheetHeader>

                    <ActivityForm
                      onSubmit={async (values, setErrors, setSubmitting) => {
                        try {
                          await create.mutateAsync({ title: values.title, description: values.description || undefined });
                          toast.success("Activity created.");
                          setCreatingOpen(false);
                        } catch (err: any) {
                          toast.error(`Failed to create. ${err?.message ?? ""}`);
                          setErrors({ _summary: [`Failed to create. ${err?.message ?? ""}`] });
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      submitting={create.isPending}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading…</div>
              ) : (
                <ActivitiesTable
                  data={rows}
                  query={search}
                  page={page}
                  setPage={setPage}
                  onEdit={(row) => setEditing(row)}
                  onDelete={(row) => {
                    const msg =
                      "Deleting this activity will also remove its centre availabilities and patient schedules may be regenerated. Continue?";
                    if (confirmAction(msg)) {
                      remove.mutate(row.id, {
                        onSuccess: () => toast.success("Activity deleted."),
                        onError: (err: any) => toast.error(`Failed to delete. ${err?.message ?? ""}`),
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
                    <ActivityForm
                      initial={{ id: editing.id, title: editing.title, description: editing.description ?? "" }}
                      onSubmit={async (values, setErrors, setSubmitting) => {
                        try {
                          await update.mutateAsync({
                            id: editing.id,
                            title: values.title,
                            description: values.description || undefined,
                            is_deleted: editing.is_deleted,
                          });
                          toast.success("Activity updated.");
                          setEditing(null);
                        } catch (err: any) {
                          toast.error(`Failed to update. ${err?.message ?? ""}`);
                          setErrors({ _summary: [`Failed to update. ${err?.message ?? ""}`] });
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      submitting={update.isPending}
                    />
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