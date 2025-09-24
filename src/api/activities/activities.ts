import { activitiesAPI } from "@/api/apiConfig";
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

export interface CreateActivityInput {
  title: string;
  description?: string;
}

export interface UpdateActivityInput {
  id: number;
  title: string;
  description?: string;
  is_deleted?: boolean;
  modified_by_id?: string;
}

const authHeader = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
};

// CRUD
export async function listActivities(params?: { include_deleted?: boolean; skip?: number; limit?: number; }) {
  const res = await activitiesAPI.get<Activity[]>("/", {
    headers: authHeader(),
    params: {
      include_deleted: params?.include_deleted ?? false,
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 200,
    },
  });
  return res.data;
}

export async function getActivityById(id: number) {
  const res = await activitiesAPI.get<Activity>(`/${id}`, { headers: authHeader() });
  return res.data;
}

export async function createActivity(input: CreateActivityInput) {
  const res = await activitiesAPI.post<Activity>("/", input, { headers: authHeader() });
  return res.data;
}

export async function updateActivity(input: UpdateActivityInput) {
  const headers = authHeader();
  const payload = {
    id: input.id,
    title: input.title,
    description: input.description ?? null,
    is_deleted: typeof input.is_deleted === "boolean" ? input.is_deleted : false,
  };

  const res = await activitiesAPI.put<Activity>(`${input.id}`, payload, { headers });
  return res.data;
}

export async function softDeleteActivity(id: number) {
  const res = await activitiesAPI.delete<Activity>(`/${id}`, { headers: authHeader() });
  return res.data;
}

export async function isActivityTitleUnique(title: string, excludeId?: number) {
  const all = await listActivities({ include_deleted: true, limit: 1000 });
  const t = title.trim().toLowerCase();
  return !all.some(a => a.title.trim().toLowerCase() === t && a.id !== excludeId);
}