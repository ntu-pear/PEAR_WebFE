import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listActivityTemplates,
  createActivityTemplate,
  updateActivityTemplate,
  softDeleteActivityTemplate,
  applyActivityTemplate,
  type ActivityTemplate,
  type ActivityTemplateFormValues,
  type ApplyTemplateInput,
} from "@/api/activities/activityTemplates";

export const useActivityTemplates = (includeDeleted: boolean) => {
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await listActivityTemplates({ include_deleted: includeDeleted });
      setTemplates(
        [...data].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
      );
    } catch (err) {
      console.error("Error fetching activity templates:", err);
      setError(err instanceof Error ? err.message : "Failed to load activity templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeDeleted]);

  return { templates, loading, error, refreshTemplates: fetchTemplates };
};

export function useActivityTemplateMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["activityTemplates"] });

  return {
    create: useMutation({
      mutationFn: (input: ActivityTemplateFormValues) => createActivityTemplate(input),
      onSuccess: invalidate,
      onError: (error: Error) => {
        toast.error(`Failed to create template: ${error.message || "Unknown error"}`);
      },
    }),
    update: useMutation({
      mutationFn: (input: ActivityTemplateFormValues & { id: number }) => updateActivityTemplate(input),
      onSuccess: invalidate,
      onError: (error: Error) => {
        toast.error(`Failed to update template: ${error.message || "Unknown error"}`);
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => softDeleteActivityTemplate(id),
      onSuccess: invalidate,
      onError: (error: Error) => {
        toast.error(`Failed to delete template: ${error.message || "Unknown error"}`);
      },
    }),
    apply: useMutation({
      mutationFn: ({ templateId, input }: { templateId: number; input: ApplyTemplateInput }) =>
        applyActivityTemplate(templateId, input),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["activities"] });
        qc.invalidateQueries({ queryKey: ["centreActivities"] });
      },
      onError: (error: Error) => {
        toast.error(`Failed to apply template: ${error.message || "Unknown error"}`);
      },
    }),
  };
}
