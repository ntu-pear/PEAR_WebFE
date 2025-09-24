import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Filter, Plus } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import ActivityForm from "@/components/Form/ActivityForm";
import ActivitiesTable from "@/components/Table/ActivitiesTable";
import { useActivities, useActivityMutations, toRows, type ActivityRow } from "@/hooks/activities/useActivities";

function confirmAction(message: string) {
  return window.confirm(message);
}

export default function ManageActivities() {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRow | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useActivities(includeDeleted);
  const { create, update, remove } = useActivityMutations();

  useEffect(() => {
    if (isError) toast.error(`Failed to load activities. ${(error as Error)?.message ?? ""}`);
  }, [isError, error]);

  // reset to first page whenever list or search/toggle changes
  useEffect(() => setPage(1), [search, includeDeleted, data]);

  const rows = useMemo(() => toRows(data ?? []), [data]);

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="flex items-center gap-2">
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