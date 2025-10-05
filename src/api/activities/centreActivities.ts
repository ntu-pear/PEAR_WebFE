import { activitiesAPI, centreActivitiesAPI } from "@/api/apiConfig";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";

export interface Activity {
  id: number;
  title: string;
  description?: string | null;
  is_deleted: boolean;
  created_date: string;
  modified_date: string;
  created_by_id?: string | null;
  modified_by_id?: string | null;
}

export interface CentreActivity {
  id: number;
  activity_id: number;
  is_compulsory: boolean;
  is_fixed: boolean;
  is_group: boolean;
  start_date: string;
  end_date: string;
  min_duration: number;
  max_duration: number;
  min_people_req: number;
  fixed_time_slots?: string | null;
  is_deleted: boolean;
  created_date: string;
  modified_date?: string | null;
  created_by_id: string;
  modified_by_id?: string | null;
}

export interface CreateCentreActivityInput {
  activity_id: number;
  is_fixed: boolean;
  is_group: boolean;
  is_compulsory: boolean;
  start_date: string;
  end_date: string;
  min_duration: number;
  max_duration: number;
  min_people_req: number;
}

export interface UpdateCentreActivityInput {
  id: number;
  activity_id: number;
  is_fixed: boolean;
  is_group: boolean;
  is_compulsory: boolean;
  start_date: string;
  end_date: string;
  min_duration: number;
  max_duration: number;
  min_people_req: number;
  is_deleted: boolean;
}

export interface CentreActivityWithTitle extends CentreActivity {
  activity_title: string;
}

const authHeader = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
};

// CRUD
export async function listCentreActivities(params?: { include_deleted?: boolean; skip?: number; limit?: number; }) {
  const centreActivitiesData = await centreActivitiesAPI.get<CentreActivity[]>("/", {
    headers: authHeader(),
    params: {
      include_deleted: params?.include_deleted ?? false,
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 200,
    },
  });

  //Code to merge activity title to table.
  const activitiesData = await activitiesAPI.get<Activity[]>("/", {
    headers: authHeader(),
    params: {
      include_deleted: params?.include_deleted ?? false,
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 999,
    },
  });

  const activityMap = new Map<number, Activity>();
  activitiesData.data.forEach(activity => {
    if (!activity.is_deleted) {
      activityMap.set(activity.id, activity);
    }
  });

  const centreActivitiesWithTitle: CentreActivityWithTitle[] = 
    centreActivitiesData.data
      .filter(ca => !ca.is_deleted)
      .map(ca => ({
        ...ca,
        activity_title: activityMap.get(ca.activity_id)?.title || 'Unknown Activity'
      }))
      .sort((a, b) => (a.activity_title || '')
      .localeCompare(b.activity_title || ''));

  return centreActivitiesWithTitle.sort((a,b) => a.id - b.id);
};

export async function getActivityById(id: number) {
  const res = await centreActivitiesAPI.get<CentreActivity>(`/${id}`, { headers: authHeader() });
  return res.data;
};

export async function createCentreActivity(input: CreateCentreActivityInput) {
  const res = await centreActivitiesAPI.post<CentreActivity>("/", input, { headers: authHeader() });
  return res.data;
};

export async function updateCentreActivity(input: UpdateCentreActivityInput) {
  const headers = authHeader();
  const payload = {
    id: input.id,
    is_deleted: typeof input.is_deleted === "boolean" ? input.is_deleted : false,
    is_fixed: typeof input.is_fixed === "boolean" ? input.is_fixed : false,
    is_group: typeof input.is_group === "boolean" ? input.is_group : false,
    min_duration: input.min_duration,
    max_duration: input.max_duration,
    min_people_req: input.is_group == true ? input.min_people_req : 0
  };

  const res = await centreActivitiesAPI.put<CentreActivity>(`${input.id}`, payload, { headers });
  return res.data;
};

export async function softDeleteCentreActivity(id: number) {
  const res = await centreActivitiesAPI.delete<CentreActivity>(`/${id}`, { headers: authHeader() });
  return res.data;
};