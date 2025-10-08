import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ERRORS, validateLocal, type FormErrors, type ActivityFormValues } from "@/lib/validation/activity";
import { isActivityTitleUnique } from "@/api/activities/activities";

type Props = {
  initial?: ActivityFormValues;
  submitting?: boolean;
  onSubmit: (
    values: { title: string; description: string },
    setErrors: (e: FormErrors) => void,
    setSubmitting: (b: boolean) => void
  ) => void | Promise<void>;
};

export default function ActivityForm({ initial, onSubmit, submitting }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [errors, setErrors] = useState<FormErrors>({ _summary: [] });

  const runSync = (v: { title: string; description: string }) => {
    const e = validateLocal(v);
    setErrors(e);
    return e;
  };

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrors({ _summary: [] });

        const local = runSync({ title, description });
        if (local._summary && local._summary.length) return;

        await onSubmit({ title, description }, setErrors, () => {});
      }}
    >
      {errors?._summary && errors._summary.length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {errors._summary.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Activity Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            runSync({ title: e.target.value, description });
          }}
          onBlur={async () => {
            const t = title?.trim();
            if (!t) return;
            const unique = await isActivityTitleUnique(t, initial?.id);
            if (!unique) {
              setErrors(prev => ({
                ...prev,
                title: ERRORS.DUPLICATE_NAME,
                _summary: Array.from(new Set([...(prev._summary ?? []), ERRORS.DUPLICATE_NAME])),
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
          value={description ?? ""}
          onChange={(e) => {
            setDescription(e.target.value);
            runSync({ title, description: e.target.value });
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