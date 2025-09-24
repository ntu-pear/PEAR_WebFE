import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  createActivity,
  listActivities,
  softDeleteActivity,
  updateActivity,
  isActivityTitleUnique,
} from "@/api/activities/activities";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Filter, Plus } from "lucide-react";

/** Error texts from your standard popup template */
const ERRORS = {
  SHORT_TITLE_16: "Use 16 characters or fewer.",
  DUPLICATE_NAME: "Already used by another activity.",
};

type FormErrors = {
  title?: string;
  description?: string;
  _summary?: string[];
};

function validateLocal(
  values: { title: string; description: string },
  opts?: { enforceShortTitle?: boolean }
): FormErrors {
  const errors: FormErrors = { _summary: [] };

  const title = values.title?.trim();
  if (!title) {
    errors.title = "Title is required.";
    errors._summary!.push("Title is required.");
  }

  if (opts?.enforceShortTitle) {
    if (title && title.length > 16) {
      errors.title = ERRORS.SHORT_TITLE_16;
      errors._summary!.push(ERRORS.SHORT_TITLE_16);
    }
  }

  return errors;
}

async function validateAsync(
  values: { id?: number; title: string },
  opts?: { checkDuplicateName?: boolean }
): Promise<FormErrors> {
  const errors: FormErrors = { _summary: [] };
  if (opts?.checkDuplicateName) {
    const unique = await isActivityTitleUnique(values.title, values.id);
    if (!unique) {
      errors.title = ERRORS.DUPLICATE_NAME;
      errors._summary!.push(ERRORS.DUPLICATE_NAME);
    }
  }
  return errors;
}

function confirmAction(message: string) {
  return window.confirm(message);
}

const PAGE_SIZE = 5;

export default function ManageActivities() {
  const queryClient = useQueryClient();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Activity | null>(null);
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["activities", includeDeleted],
    queryFn: () => listActivities({ include_deleted: includeDeleted, limit: 200 }),
  });

  useEffect(() => {
    if (isError) {
      toast.error(`Failed to load activities. ${(error as Error)?.message ?? ""}`);
    }
  }, [isError, error]);

  // Reset to page 1 whenever the source list changes (search or includeDeleted)
  useEffect(() => {
    setPage(1);
  }, [search, includeDeleted, data]);

  const filtered = useMemo<Activity[]>(() => {
    if (!data) return [];
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((a: Activity) =>
      a.title.toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  // Pagination
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const startIndex = (current - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageItems.length, total);

  const createMut = useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      toast.success("Activity created.");
      setCreatingOpen(false);
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err: any) => {
      toast.error(`Failed to create. ${err?.message ?? ""}`);
    },
  });

  const updateMut = useMutation({
    mutationFn: updateActivity,
    onSuccess: () => {
      toast.success("Activity updated.");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err: any) => {
      toast.error(`Failed to update. ${err?.message ?? ""}`);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => softDeleteActivity(id),
    onSuccess: () => {
      toast.success("Activity deleted.");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err: any) => {
      toast.error(`Failed to delete. ${err?.message ?? ""}`);
    },
  });

  return (
    <PageContainer className="py-6 space-y-5">
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
            onClick={() => setIncludeDeleted((v) => !v)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {includeDeleted ? "Showing Deleted" : "Deleted Hidden"}
          </Button>
        </div>
      </div>

      {/* Card container */}
      <div className="rounded-2xl border">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-2xl font-semibold">Manage Activities</h2>
            <p className="text-sm text-muted-foreground">Manage all activities for patients</p>
          </div>

          <Sheet open={creatingOpen} onOpenChange={setCreatingOpen}>
            <SheetTrigger asChild>
              <Button className="h-10">
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[480px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Create Activity</SheetTitle>
              </SheetHeader>
              <CreateOrEditForm
                onSubmit={async (values, setErrors, setSubmitting) => {
                  const local = validateLocal(values);
                  if (local._summary!.length) {
                    setErrors(local);
                    setSubmitting(false);
                    return;
                  }
                  const asyncErrs = await validateAsync({ title: values.title }, { checkDuplicateName: true });
                  if (asyncErrs._summary!.length) {
                    setErrors(asyncErrs);
                    setSubmitting(false);
                    return;
                  }
                  createMut.mutate(values);
                }}
                submitting={createMut.isPending}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Table */}
        <div className="px-2 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-40">Created Date</TableHead>
                <TableHead className="w-40">Modified Date</TableHead>
                <TableHead className="w-28">Deleted?</TableHead>
                <TableHead className="w-56">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
              )}
              {!isLoading && pageItems.length === 0 && (
                <TableRow><TableCell colSpan={6}>No activities found.</TableCell></TableRow>
              )}
              {pageItems.map((a: Activity) => (
                <TableRow key={a.id} className={a.is_deleted ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell className="max-w-[420px] truncate">{a.description}</TableCell>
                  <TableCell>{dayjs(a.created_date).format("YYYY-MM-DD")}</TableCell>
                  <TableCell>{dayjs(a.modified_date).format("YYYY-MM-DD")}</TableCell>
                  <TableCell>{a.is_deleted ? "Yes" : "No"}</TableCell>
                  <TableCell className="space-x-2">
                    <Sheet open={!!editing && editing.id === a.id} onOpenChange={(open)=>!open && setEditing(null)}>
                      <SheetTrigger asChild>
                        <Button size="sm" variant="secondary" onClick={()=>setEditing(a)} disabled={a.is_deleted}>Edit</Button>
                      </SheetTrigger>
                      <SheetContent className="w-[480px] sm:w-[540px]">
                        <SheetHeader>
                          <SheetTitle>Edit Activity</SheetTitle>
                        </SheetHeader>
                        <CreateOrEditForm
                          initialValues={{ title: a.title, description: a.description ?? "" }}
                          onSubmit={async (values, setErrors, setSubmitting) => {
                            const local = validateLocal(values);
                            if (local._summary!.length) {
                              setErrors(local);
                              setSubmitting(false);
                              return;
                            }
                            const asyncErrs = await validateAsync({ id: a.id, title: values.title }, { checkDuplicateName: true });
                            if (asyncErrs._summary!.length) {
                              setErrors(asyncErrs);
                              setSubmitting(false);
                              return;
                            }
                            updateMut.mutate({ id: a.id, ...values, is_deleted: a.is_deleted });
                          }}
                          submitting={updateMut.isPending}
                        />
                      </SheetContent>
                    </Sheet>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={()=>{
                        const msg = "Deleting this activity will also remove its centre availabilities and patient schedules may be regenerated. Continue?";
                        if (confirmAction(msg)) {
                          deleteMut.mutate(a.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-6 py-3 text-sm text-muted-foreground">
          <div>
            {total === 0
              ? "Showing 0 of 0 records"
              : `Showing ${showingFrom}-${showingTo} of ${total} records`}
          </div>
          <div className="space-x-2">
            <Button
              size="sm"
              variant="outline"
              disabled={current <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={current >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function CreateOrEditForm({
  initialValues,
  onSubmit,
  submitting,
}: {
  initialValues?: { title: string; description: string };
  onSubmit: (
    values: { title: string; description: string },
    setErrors: (e: { title?: string; description?: string; _summary?: string[] }) => void,
    setSubmitting: (b: boolean) => void
  ) => void | Promise<void>;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [errors, setErrors] = useState<FormErrors>({ _summary: [] });

  const runSyncChecks = (next: { title: string; description: string }) => {
    const e = validateLocal(next);
    setErrors(e);
  };

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={async (e)=>{
        e.preventDefault();
        setErrors({ _summary: [] });
        await onSubmit({ title, description }, setErrors, ()=>{});
      }}
    >
      {errors?._summary && errors._summary.length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {errors._summary.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Activity Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e)=>{
            setTitle(e.target.value);
            runSyncChecks({ title: e.target.value, description });
          }}
          onBlur={async ()=>{
            const asyncErrs = await validateAsync({ title }, { checkDuplicateName: true });
            if (asyncErrs._summary!.length) {
              setErrors(prev => ({
                ...prev,
                title: asyncErrs.title,
                _summary: Array.from(new Set([...(prev._summary ?? []), ...(asyncErrs._summary ?? [])])),
              }));
            }
          }}
          required
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Activity Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e)=>{
            setDescription(e.target.value);
            runSyncChecks({ title, description: e.target.value });
          }}
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting} className="min-w-24">
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}