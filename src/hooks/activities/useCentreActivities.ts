import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import {
  listCentreActivities,
  getActivities,
  createCentreActivity,
  updateCentreActivity,
  softDeleteCentreActivity,
  type CreateCentreActivityInput,
  type UpdateCentreActivityInput,
  Activity,
  CentreActivityWithTitle
} from "@/api/activities/centreActivities";
import { listActivities } from "@/api/activities/activities";
import { useEffect, useState } from "react";


// export async function useCentreActivities(includeDeleted: boolean) {
//   const ca = useQuery({
//     queryKey: ["centre_activities", { includeDeleted }],
//     queryFn: () => listCentreActivities({ include_deleted: includeDeleted, limit: 200 }),
//   });
//   return ca; 
// }

export const useCentreActivities = (includeDeleted: boolean) => {
  const [centreActivities, setCentreActivities] = useState<CentreActivityWithTitle[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCentreActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const [activitiesData, centreActivitiesData] = await Promise.all([
        getActivities(),
        listCentreActivities({ include_deleted: includeDeleted })
      ]);
      
      const activityMap = new Map<number, Activity>();
      activitiesData.forEach(activity => {
        if (!activity.is_deleted) {
          activityMap.set(activity.id, activity);
        }
      });

      const centreActivitiesWithTitle: CentreActivityWithTitle[] = 
        centreActivitiesData
        .map(ca => ({
          ...ca,
          activity_title: activityMap.get(ca.activity_id)?.title || 'Unknown Activity'
        }))
        .sort((a, b) => (a.activity_title || '')
        .localeCompare(b.activity_title || ''))
        .sort((a,b) => a.id - b.id);
      
      setCentreActivities(centreActivitiesWithTitle.sort((a,b) => a.id - b.id));
    }
    catch(error) {
      console.error("Error fetching centre activities:", error);
      setError("Failed to fetch centre activity and related data");
    }
    finally {
      setLoading(false);
    }
  };

  const refreshCentreActivities = () => {
    fetchCentreActivities();
  };

  useEffect(() => {
    fetchCentreActivities();
  }, []);

  return { 
    centreActivities,
    loading, 
    error,
    refreshCentreActivities
  };
};


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
  fixed_time_slots: string;
  created_by_id: string;
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
    fixed_time_slots: a.fixed_time_slots,
    created_by_id: a.created_by_id,
    created_date: a.created_date,
    modified_by_id: a.modified_by_id ?? "",
    modified_date: a.modified_date ?? "",
    is_deleted: a.is_deleted,
  }));
}