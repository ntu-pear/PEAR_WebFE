import { activityTemplatesAPI } from "@/api/apiConfig";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";
import { getCurrentUser } from "@/api/activities/centreActivities";

export interface ActivityTemplate {
  id: number;
  name: string;
  title: string;
  description?: string | null;
  care_centre_id?: number | null;
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

export type ActivityTemplateFormValues = {
  name: string;
  title: string;
  description?: string | null;
  care_centre_id?: number | null;
  is_compulsory: boolean;
  is_fixed: boolean;
  is_group: boolean;
  start_date: string;
  end_date: string;
  min_duration: number;
  max_duration: number;
  min_people_req: number;
  fixed_time_slots?: string | null;
};

// name here is the Centre Activity name, not the template's own name
export type ApplyTemplateInput = ActivityTemplateFormValues;

export interface ApplyTemplateResult {
  activity_id: number;
  activity_title: string;
  activity_was_created: boolean;
  centre_activity_id: number;
  centre_activity_name: string;
}

const authHeader = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
};

export async function listActivityTemplates(params?: { include_deleted?: boolean; skip?: number; limit?: number; }) {
  const res = await activityTemplatesAPI.get<ActivityTemplate[]>("/", {
    headers: authHeader(),
    params: {
      include_deleted: params?.include_deleted ?? false,
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 100,
    },
  });
  return res.data;
}

export async function getActivityTemplate(id: number) {
  const res = await activityTemplatesAPI.get<ActivityTemplate>(`/${id}`, { headers: authHeader() });
  return res.data;
}

export async function createActivityTemplate(input: ActivityTemplateFormValues) {
  const currentUser = await getCurrentUser();
  const res = await activityTemplatesAPI.post<ActivityTemplate>(
    "/",
    { ...input, created_by_id: currentUser.userId.toString() },
    { headers: authHeader() }
  );
  return res.data;
}

// the id goes in the body, not the path
export async function updateActivityTemplate(input: ActivityTemplateFormValues & { id: number; is_deleted?: boolean }) {
  const currentUser = await getCurrentUser();
  const res = await activityTemplatesAPI.put<ActivityTemplate>(
    "/",
    { ...input, modified_by_id: currentUser.userId.toString() },
    { headers: authHeader() }
  );
  return res.data;
}

export async function softDeleteActivityTemplate(id: number) {
  const res = await activityTemplatesAPI.delete<ActivityTemplate>(`/${id}`, { headers: authHeader() });
  return res.data;
}

export async function applyActivityTemplate(templateId: number, input: ApplyTemplateInput) {
  const res = await activityTemplatesAPI.post<ApplyTemplateResult>(
    `/${templateId}/apply`,
    input,
    { headers: authHeader() }
  );
  return res.data;
}
