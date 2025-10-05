import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import {
  listCentreActivities,
  createCentreActivity,
  updateCentreActivity,
  softDeleteCentreActivity,
  // type CentreActivity,
  type CreateCentreActivityInput,
  type UpdateCentreActivityInput,
  type CentreActivityWithTitle,
} from "@/api/activities/centreActivities";

export function useCentreActivities(includeDeleted: boolean) {
  return useQuery({
    queryKey: ["centreActivities", { includeDeleted }],
    queryFn: () => listCentreActivities({ include_deleted: includeDeleted, limit: 200 }),
  });
}

export function useCentreActivityMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["centreActivities"] });

  return {
    create: useMutation({
      mutationFn: (input: CreateCentreActivityInput) => createCentreActivity(input),
      onSuccess: invalidate,
      onError: (error: any) => {
        toast.error(`Failed to create centre activity: ${error.message || 'Unknown error'}`);
      },
    }),
    update: useMutation({
      mutationFn: (input: UpdateCentreActivityInput) => updateCentreActivity(input),
      onSuccess: invalidate,
      onError: (error: any) => {
        toast.error(`Failed to update centre activity: ${error.message || 'Unknown error'}`);
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => softDeleteCentreActivity(id),
      onSuccess: invalidate,
      onError: (error: any) => {
        toast.error(`Failed to delete centre activity: ${error.message || 'Unknown error'}`);
      },
    }),
  };
}

export type CentreActivityRow = {
  id: number;
  activity_id: number;
  activity_title: string;
  is_fixed: boolean;
  is_group: boolean;
  is_compulsory: boolean;
  min_people_req: number;
  min_duration: number;
  max_duration: number;
  start_date: string;
  end_date: string;
  created_date: string;
  modified_date: string;
  is_deleted: boolean;
};

export function toRows(list: CentreActivityWithTitle[]): CentreActivityRow[] {
  return list.map(a => ({
    id: a.id,
    activity_id: a.activity_id,
    activity_title: a.activity_title,
    is_fixed: a.is_fixed,
    is_group: a.is_group,
    is_compulsory: a.is_compulsory,
    min_people_req: a.min_people_req,
    min_duration: a.min_duration,
    max_duration: a.max_duration,
    start_date: a.start_date,
    end_date: a.end_date,
    created_by_id: a.created_by_id,
    created_date: a.created_date,
    modified_by_id: a.modified_by_id ?? "",
    modified_date: a.modified_date ?? "",
    is_deleted: a.is_deleted,
  }));
}