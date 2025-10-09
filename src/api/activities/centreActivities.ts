import { activitiesAPI, 
        centreActivitiesAPI,
        getCurrentUserAPI
} from "@/api/apiConfig";
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
  min_people_req: number | 1;
  fixed_time_slots: string;
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
  fixed_time_slots: string;
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
  fixed_time_slots: string;
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

export const getCurrentUser = async () => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await getCurrentUserAPI.get("/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("GET current user", response.data);
    return response.data;
  } catch (error) {
    console.error("GET current user", error);
    throw error;
  }
};

// CRUD
export async function listCentreActivities(params?: {include_deleted?: boolean;}) {
  const res = await centreActivitiesAPI.get<CentreActivity[]>("/", {
    headers: authHeader(),
    params: {
      include_deleted: params?.include_deleted
    },
  });
  return res.data;
};

export async function getActivities() {
  const res = await activitiesAPI.get<Activity[]>("/", {
    headers: authHeader(),
  });
  return res.data;
};

export async function getCentreActivityById(id: number) {
  const res = await centreActivitiesAPI.get<CentreActivity>(`/${id}`, { headers: authHeader() });
  return res.data;
};

export async function createCentreActivity(input: CreateCentreActivityInput) {
  // Get current user to set modified_by_id
  const currentUser = await getCurrentUser();
  const payload = {
    ...input,
    created_by_id: currentUser.userId.toString(),
  }
  const res = await centreActivitiesAPI.post<CentreActivity>("/", payload, { headers: authHeader() });
  return res.data;
};

export async function updateCentreActivity(input: UpdateCentreActivityInput) {
  // Get current user to set modified_by_id
  const currentUser = await getCurrentUser();
  const payload = {
    ...input,
    modified_by_id: currentUser.userId.toString(),
  }
  const res = await centreActivitiesAPI.put<CentreActivity>("/", payload, { headers: authHeader() });
  return res.data;
};

export async function softDeleteCentreActivity(id: number) {
  const res = await centreActivitiesAPI.delete<CentreActivity>(`/${id}`, { headers: authHeader() });
  return res.data;
};

