import { useQuery } from "@tanstack/react-query";
import {
  getAllActivities,
  getAllCentreActivities,
  CentreActivityPreference,
  getCentreActivityPreferences,
} from "@/api/activity/activityPreference";
import {
  CentreActivityRecommendation,
  getCentreActivityRecommendations,
} from "@/api/activity/activityRecommendation";
import {
  intToPreference,
  intToRecommendation,
} from "@/utils/activityConversions";

export interface PatientActivity {
  id: number; // Centre Activity ID
  activityId: number;
  name: string;
  description?: string;
  preferenceId?: number;
  patientPreference?: "LIKE" | "DISLIKE" | "NEUTRAL" | null;
  recommendationId?: number;
  doctorRecommendation?: "RECOMMENDED" | "NOT_RECOMMENDED" | "NEUTRAL" | null;
  doctorNotes?: string;
  canEdit?: boolean;
  canRecommend?: boolean;
}

export const PATIENT_ACTIVITY_QUERY_KEY = ["patientActivities"];

const fetchAndCombineActivityData = async (
  currentUserRole: string | undefined,
  patientId: number
): Promise<PatientActivity[]> => {
  const [activities, centreActivities, preferences, recommendations] =
    await Promise.all([
      getAllActivities(),
      getAllCentreActivities(),
      getCentreActivityPreferences(patientId.toString()),
      getCentreActivityRecommendations(patientId.toString()),
    ]);

  const preferenceMap = new Map<number, CentreActivityPreference>();
  preferences.forEach((pref) => {
    if (!pref.is_deleted) {
      preferenceMap.set(pref.centre_activity_id, pref);
    }
  });

  const recommendationMap = new Map<number, CentreActivityRecommendation>();
  recommendations.forEach((rec) => {
    if (!rec.is_deleted) {
      recommendationMap.set(rec.centre_activity_id, rec);
    }
  });

  const combinedData: PatientActivity[] = centreActivities.flatMap((ca) => {
    const activity = activities.find((a) => a.id === ca.activity_id);
    if (!activity || activity.is_deleted || ca.is_deleted) {
      return [];
    }

    const preference = preferenceMap.get(ca.id);
    const recommendation = recommendationMap.get(ca.id);

    // Conversion logic
    const patientPreference = preference
      ? intToPreference(preference.is_like)
      : "NEUTRAL";
    const doctorRecommendation = recommendation
      ? intToRecommendation(recommendation.doctor_recommendation)
      : "NEUTRAL";

    return {
      id: ca.id,
      activityId: activity.id,
      name: activity.title,
      description: activity.description || undefined,
      preferenceId: preference?.id,
      patientPreference,
      recommendationId: recommendation?.id,
      doctorRecommendation,
      doctorNotes: recommendation?.doctor_remarks || undefined,
      canEdit: currentUserRole === "SUPERVISOR",
      canRecommend: currentUserRole === "DOCTOR",
    };
  });

  return combinedData.sort((a, b) => a.name.localeCompare(b.name));
};

const useGetPatientActivity = (
  currentUserRole: string | undefined,
  patientId: number
) => {
  return useQuery({
    queryKey: PATIENT_ACTIVITY_QUERY_KEY,
    queryFn: () => fetchAndCombineActivityData(currentUserRole, patientId),
  });
};

export default useGetPatientActivity;
