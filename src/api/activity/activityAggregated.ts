import { activityAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { Activity, CentreActivity, CentreActivityPreference } from "./activityPreference";
import { CentreActivityRecommendation } from "./activityRecommendation";
import { CentreActivityExclusion } from "./activityExclusion";

export interface RefPatient {
  id: number;
  name: string;
  preferred_name?: string | null;
  update_bit: string;
  start_date: string;
  end_date?: string | null;
  is_active: string;
  is_deleted: string;
  created_date: string;
  modified_date: string;
  created_by_id: string;
  modified_by_id: string;
}

export interface ActivityPreferenceTableData {
  activities: Activity[];
  centre_activities: CentreActivity[];
  preferences: CentreActivityPreference[];
  recommendations: CentreActivityRecommendation[];
  exclusions: CentreActivityExclusion[];
  patients: RefPatient[];
}

export interface ActivityExclusionTableData {
  activities: Activity[];
  centre_activities: CentreActivity[];
  exclusions: CentreActivityExclusion[];
  patients: RefPatient[];
}

export const getActivityPreferenceTable = async (
  includeDeleted = false
): Promise<ActivityPreferenceTableData> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No authentication token found");

  const response = await activityAPI.get("/aggregated/activity-preference-table", {
    headers: { Authorization: `Bearer ${token}` },
    params: { include_deleted: includeDeleted },
  });
  return response.data;
};

export const getActivityPreferenceTableByPatient = async (
  patientId: string | number,
  includeDeleted = false
): Promise<ActivityPreferenceTableData> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No authentication token found");

  const response = await activityAPI.get(
    `/aggregated/activity-preference-table/patient/${patientId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { include_deleted: includeDeleted },
    }
  );
  return response.data;
};

export const getActivityExclusionTable = async (
  includeDeleted = false
): Promise<ActivityExclusionTableData> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No authentication token found");

  const response = await activityAPI.get("/aggregated/activity-exclusion-table", {
    headers: { Authorization: `Bearer ${token}` },
    params: { include_deleted: includeDeleted },
  });
  return response.data;
};

export const getActivityExclusionTableByPatient = async (
  patientId: string | number,
  includeDeleted = false
): Promise<ActivityExclusionTableData> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No authentication token found");

  const response = await activityAPI.get(
    `/aggregated/activity-exclusion-table/patient/${patientId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { include_deleted: includeDeleted },
    }
  );
  return response.data;
};
