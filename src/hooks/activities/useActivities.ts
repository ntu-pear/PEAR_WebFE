import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listActivities,
  createActivity,
  updateActivity,
  softDeleteActivity,
  type Activity,
  type CreateActivityInput,
  type UpdateActivityInput,
} from "@/api/activities/activities";

export function useActivities(includeDeleted: boolean) {
  return useQuery({
    queryKey: ["activities", { includeDeleted }],
    queryFn: () => listActivities({ include_deleted: includeDeleted, limit: 200 }),
  });
}

export function useActivityMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["activities"] });

  return {
    create: useMutation({
      mutationFn: (input: CreateActivityInput) => createActivity(input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (input: UpdateActivityInput) => updateActivity(input),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => softDeleteActivity(id),
      onSuccess: invalidate,
    }),
  };
}

export type ActivityRow = {
  id: number;
  title: string;
  description?: string | null;
  created_date: string;
  modified_date: string;
  is_deleted: boolean;
};

export function toRows(list: Activity[]): ActivityRow[] {
  return list.map(a => ({
    id: a.id,
    title: a.title,
    description: a.description ?? "",
    created_date: a.created_date,
    modified_date: a.modified_date,
    is_deleted: a.is_deleted,
  }));
}