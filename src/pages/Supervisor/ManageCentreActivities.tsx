import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Filter, Plus } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import CentreActivityForm from "@/components/Form/CentreActivityForm";
import CentreActivitiesTable from "@/components/Table/CentreActivitiesTable";
import { useCentreActivities, useCentreActivityMutations, toRows, type CentreActivityRow } from "@/hooks/activities/useCentreActivities";
import { CentreActivityFormValues } from "@/lib/validation/centreActivity";

function confirmAction(message: string) {
  return window.confirm(message);
}

export default function ManageCentreActivities() {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [editing, setEditing] = useState<CentreActivityRow | null>(null);
  const [page, setPage] = useState(1);
  // const [compulsory, setCompulsory] = useState("all");
  // const [fixed, setFixed] = useState("all");
  // const [group, setGroup] = useState("all");

  const {data, isLoading, isError, error} = useCentreActivities(includeDeleted);
  const {create, update, remove} = useCentreActivityMutations();

   useEffect(() => {
    if (isError) toast.error(`Failed to load centre activities. ${(error as Error)?.message ?? ""}`);
  }, [isError, error]);

  // reset to first page whenever list or search/toggle changes
  useEffect(() => setPage(1), [search, includeDeleted, data]);

  const rows = useMemo(() => toRows(data ?? []), [data])

  const handleCreate = async (values: CentreActivityFormValues) => {
    try {
      await create.mutateAsync({
        activity_id: values.activity_id,
        is_compulsory: values.is_compulsory,
        is_fixed: values.is_fixed,
        is_group: values.is_group,
        min_people_req: values.min_people_req,
        start_date: values.start_date,
        end_date: values.end_date,
        min_duration: values.min_duration,
        max_duration: values.max_duration,
        fixed_time_slots: values.fixed_time_slots
      });
      setCreatingOpen(false);
      toast.success("Centre Activity created.");
    }
    catch (error: any) {
      console.error("Error creating centre activity:", error)
      toast.error(`Failed to create. ${error?.message ?? ""}`);
    }
  };
  
  const handleUpdate = async (values: CentreActivityFormValues) => {
    if (!editing) return;

    try {
      await update.mutateAsync({
        id: editing.id,
        activity_id: values.activity_id,
        is_compulsory: values.is_compulsory,
        is_fixed: values.is_fixed,
        is_group: values.is_group,
        min_people_req: values.min_people_req,
        start_date: values.start_date,
        end_date: values.end_date,
        min_duration: values.min_duration,
        max_duration: values.max_duration,
        is_deleted: values.is_deleted,
        fixed_time_slots: values.fixed_time_slots
      });
      toast.success("Centre Activity updated.");
    }
    catch (error: any) {
      console.error("Error creating centre activity:", error)
      toast.error(`Failed to create. ${error?.message ?? ""}`);
    }
  };

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
                        onSubmit={handleCreate}
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
                        initial={{
                          id: editing.id,
                          activity_id: editing.activity_id,
                          is_fixed: editing.is_fixed,
                          is_compulsory: editing.is_compulsory,
                          is_group: editing.is_group,
                          min_duration: editing.min_duration,
                          max_duration: editing.max_duration,
                          start_date: editing.start_date,
                          end_date: editing.end_date,
                          min_people_req: editing.min_people_req,
                          fixed_time_slots: editing.fixed_time_slots,
                          is_deleted: editing.is_deleted
                        }}
                        onSubmit={handleUpdate}
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