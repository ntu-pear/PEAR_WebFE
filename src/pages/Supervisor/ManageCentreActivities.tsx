import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Filter, ListFilter, Plus } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CentreActivityForm from "@/components/Form/CentreActivityForm";
import CentreActivitiesTable from "@/components/Table/CentreActivitiesTable";
import { useCentreActivities, useCentreActivityMutations, toRows, type CentreActivityRow } from "@/hooks/activities/useCentreActivities";

function confirmAction(message: string) {
  return window.confirm(message);
}

export default function ManageCentreActivities() {
  const booleanOptions = [
    { key: "All", value: "all" },
    { key: "Yes", value: "true" },
    { key: "No", value: "false" },
  ];

  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [editing, setEditing] = useState<CentreActivityRow | null>(null);
  const [page, setPage] = useState(1);
  const [compulsory, setCompulsory] = useState("all");
  const [fixed, setFixed] = useState("all");
  const [group, setGroup] = useState("all");

  const {data, isLoading, isError, error} = useCentreActivities(includeDeleted);
  const {create, update, remove} = useCentreActivityMutations();

   useEffect(() => {
    if (isError) toast.error(`Failed to load centre activities. ${(error as Error)?.message ?? ""}`);
  }, [isError, error]);

  // reset to first page whenever list or search/toggle changes
  useEffect(() => setPage(1), [search, compulsory, fixed, group, includeDeleted, data]);

  const rows = useMemo(() => toRows(data ?? []), [data])

  const renderFilter = (
    title: string,
    value: string,
    setValue: (value: string) => void
  ) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ListFilter className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {title}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
          {booleanOptions.map(({ key, value }) => (
            <DropdownMenuRadioItem value={value}>{key}</DropdownMenuRadioItem>
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
            {renderFilter("Compulsory", compulsory, setCompulsory)}
            {renderFilter("Fixed", fixed, setFixed)}
            {renderFilter("Group", group, setGroup)}
            <Button
              type="button"
              variant="outline"
              className={`h-9 ${includeDeleted ? "border-primary" : ""}`}
              onClick={() => setIncludeDeleted(v => !v)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {includeDeleted ? "Showing Deleted" : "Deleted Hidden"}
            </Button>
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
                      <Plus className="mr-2 h-4 w-4"/>
                      Add Centre Activity
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[680px] sm:w-[540px]">
                    <SheetHeader><SheetTitle>Create Centre Activity</SheetTitle></SheetHeader>
                    <div className="h-[90vh] overflow-y-auto">
                      <CentreActivityForm
                        submitting={create.isPending}
                        onSubmit={async (values, setErrors, setSubmitting) => {
                          try {
                            await create.mutateAsync({ 
                              activity_id: values.activity_id,
                              is_fixed: values.is_fixed,
                              is_compulsory: values.is_compulsory,
                              is_group: values.is_group,
                              start_date: values.start_date,
                              end_date: values.end_date,
                              min_duration: values.min_duration,
                              max_duration: values.max_duration,
                              min_people_req: values.min_people_req
                            });
                            toast.success("Centre activity created.");
                            setCreatingOpen(false);
                          } catch (err: any) {
                            toast.error(`Failed to create. ${err?.message ?? ""}`);
                            setErrors({ _summary: [`Failed to create. ${err?.message ?? ""}`] });
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        onCancel={() => setCreatingOpen(false)}
                      />

                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {isLoading ? (<div className="p-4 text-sm text-muted-foreground">Loading…</div>) : (
                <CentreActivitiesTable
                  data={rows}
                  query={search}
                  page={page}
                  setPage={setPage}
                  onEdit={(row) => setEditing(row)}
                  onDelete={(row) => {
                    const msg = "Deleting this centre activity will remove its availabilities and patient schedules may be regenerated. Do you wish to continue?";
                    if (confirmAction(msg)) {
                      remove.mutate(row.id, {
                        onSuccess: () => toast.success("Centre Activity Deleted."),
                        onError: (err: any) => toast.error(`Failed to delete. ${err.message ?? ""}`),
                      })
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
                        onSubmit={async (values, setErrors, setSubmitting) => {
                          try {
                            await update.mutateAsync({
                              id: editing.id,
                              activity_id: values.activity_id,
                              is_fixed: values.is_fixed,
                              is_compulsory: values.is_compulsory,
                              is_group: values.is_group,
                              start_date: values.start_date,
                              end_date: values.end_date,
                              min_duration: values.min_duration,
                              max_duration: values.max_duration,
                              min_people_req: values.min_people_req,
                              is_deleted: values.is_deleted
                            });
                            toast.success("Centre activity updated.");
                            setEditing(null);
                          } catch (err: any) {
                            toast.error(`Failed to update. ${err?.message ?? ""}`);
                            setErrors({ _summary: [`Failed to update. ${err?.message ?? ""}`] });
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        submitting={update.isPending}
                        onCancel={() => setCreatingOpen(false)}
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
};