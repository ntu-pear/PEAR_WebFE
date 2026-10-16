import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActivityTemplateForm from "@/components/Form/ActivityTemplateForm";
import { useActivityTemplates, useActivityTemplateMutations } from "@/hooks/activities/useActivityTemplates";
import { listActivities } from "@/api/activities/activities";
import type { ActivityTemplate, ActivityTemplateFormValues } from "@/api/activities/activityTemplates";

const groupTimeSlots = (slots: string, duration: number) => {
  if (!slots) return [];

  const grouped: Record<string, string[]> = {};

  slots.split(",").forEach((slot) => {
    const [day, time] = slot.trim().split(" ");

    const start = dayjs(`01-01-2001 ${time}`);
    const end = start.add(duration, "minute");

    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(`${start.format("HH:mm")} - ${end.format("HH:mm")}`);
  });

  return Object.entries(grouped);
};

export default function ManageActivityTemplates() {
  const { templates, loading, error, refreshTemplates } = useActivityTemplates(false);
  const { create, update, remove, apply } = useActivityTemplateMutations();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ActivityTemplate | null>(null);
  const [applying, setApplying] = useState<ActivityTemplate | null>(null);
  const [existingActivityTitle, setExistingActivityTitle] = useState<string | null>(null);

  // rule 3: a title that an active activity already uses means that activity is
  // reused and left untouched, so title and description must not be editable
  useEffect(() => {
    if (!applying) {
      setExistingActivityTitle(null);
      return;
    }

    let cancelled = false;
    listActivities({ include_deleted: false, limit: 1000 })
      .then((all) => {
        const match = all.find(
          (a) => a.title.trim().toLowerCase() === applying.title.trim().toLowerCase()
        );
        if (!cancelled) setExistingActivityTitle(match ? match.title : null);
      })
      .catch(() => {
        if (!cancelled) setExistingActivityTitle(null);
      });

    return () => {
      cancelled = true;
    };
  }, [applying]);

  const handleCreate = async (values: ActivityTemplateFormValues) => {
    try {
      await create.mutateAsync(values);
      setCreating(false);
      refreshTemplates();
      toast.success("Template created.");
    } catch {
      // the mutation surfaces the error
    }
  };

  const handleUpdate = async (values: ActivityTemplateFormValues) => {
    if (!editing) return;
    try {
      await update.mutateAsync({ ...values, id: editing.id });
      setEditing(null);
      refreshTemplates();
      toast.success("Template updated.");
    } catch {
      // the mutation surfaces the error
    }
  };

  const handleDelete = async (template: ActivityTemplate) => {
    try {
      await remove.mutateAsync(template.id);
      refreshTemplates();
      toast.success("Template deleted.");
    } catch {
      // the mutation surfaces the error
    }
  };

  const handleApply = async (values: ActivityTemplateFormValues) => {
    if (!applying) return;
    try {
      const result = await apply.mutateAsync({ templateId: applying.id, input: values });
      setApplying(null);
      toast.success(
        result.activity_was_created
          ? `Created activity "${result.activity_title}" and centre activity "${result.centre_activity_name}".`
          : `Added centre activity "${result.centre_activity_name}" to the existing activity "${result.activity_title}".`
      );
    } catch {
      // the mutation surfaces the error
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col gap-4 sm:py-4 sm:pl-14">
      <main className="flex-1 items-start gap-4 p-4 sm:px-0 sm:py-0">
      <Card>
      <CardHeader>
      <div className="flex justify-between items-end">
        <div className="space-y-1.5">
          <CardTitle>Activity Templates</CardTitle>
          <CardDescription>
            A template stores default settings for an activity. Use a template to create the
            activity and a named centre activity from it, and use the same template again to add
            another named variant under that activity.
          </CardDescription>
        </div>
        <Sheet open={creating} onOpenChange={setCreating}>
          <SheetTrigger asChild>
            <Button className="shrink-0">Add Template</Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader><SheetTitle>Add Template</SheetTitle></SheetHeader>
            <ActivityTemplateForm
              submitting={create.isPending}
              submitLabel="Save Template"
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
      </CardHeader>

      <CardContent>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Creates Activity</TableHead>
              <TableHead>Compulsory</TableHead>
              <TableHead>Fixed</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Fixed Time Slots</TableHead>
              <TableHead className="w-80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={8}>Loading…</TableCell></TableRow>
            )}
            {!loading && templates.length === 0 && (
              <TableRow><TableCell colSpan={8}>No templates found.</TableCell></TableRow>
            )}
            {!loading && templates.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-muted-foreground">{t.title}</TableCell>
                <TableCell>{t.is_compulsory ? "Yes" : "No"}</TableCell>
                <TableCell>{t.is_fixed ? "Yes" : "No"}</TableCell>
                <TableCell>{t.is_group ? "Yes" : "No"}</TableCell>
                <TableCell>{t.min_duration} mins</TableCell>
                <TableCell>
                  {t.fixed_time_slots ? (
                    <div className="flex flex-col gap-1 text-sm">
                      {groupTimeSlots(t.fixed_time_slots, t.max_duration).map(([day, times]) => (
                        <div key={day} className="flex gap-2 whitespace-nowrap">
                          <span className="font-medium w-17">{day}</span>
                          <span className="text-muted-foreground">{times.join(" ")}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" onClick={() => setApplying(t)}>Use Template</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(t)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(t)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      </CardContent>
      </Card>
      </main>

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Edit Template</SheetTitle></SheetHeader>
          {editing && (
            <ActivityTemplateForm
              initial={editing}
              submitting={update.isPending}
              submitLabel="Save"
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!applying} onOpenChange={(open) => !open && setApplying(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Use Template</SheetTitle></SheetHeader>
          {applying && (
            <ActivityTemplateForm
              // the template's own name is deliberately not carried over, and a
              // stored start date is allowed to be stale while applying is not
              initial={{
                ...applying,
                name: "",
                start_date: dayjs().format("YYYY-MM-DD"),
              }}
              submitting={apply.isPending}
              submitLabel="Create Activity"
              nameLabel="Centre Activity Name"
              lockTitle={!!existingActivityTitle}
              lockedNote={
                existingActivityTitle
                  ? `This will be added to the existing activity "${existingActivityTitle}". Its title and description cannot be changed here.`
                  : undefined
              }
              onSubmit={handleApply}
              onCancel={() => setApplying(null)}
            />
          )}
        </SheetContent>
      </Sheet>
      </div>
    </div>
  );
}
