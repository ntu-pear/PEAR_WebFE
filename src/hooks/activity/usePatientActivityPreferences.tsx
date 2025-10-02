import { useState, useEffect } from "react";
import {
  getCentreActivityPreferences,
  getAllActivities,
  getAllCentreActivities,
  Activity,
  CentreActivity,
} from "@/api/activity/activityPreference";
import {
  getCentreActivityRecommendations,
} from "@/api/activity/activityRecommendation";
import { intToPreference, intToRecommendation } from "@/utils/activityConversions";

// Combined type for display - patient specific
export interface PatientActivityPreferenceWithRecommendation {
  id: number;
  centreActivityId: number;
  activityId: number;
  activityName: string;
  activityDescription?: string;
  patientId: number;
  patientPreference?: "LIKE" | "DISLIKE" | "NEUTRAL" | null;
  doctorRecommendation?: "RECOMMENDED" | "NOT_RECOMMENDED" | "NEUTRAL" | null;
  doctorNotes?: string;
  canEdit?: boolean;
}

export const usePatientActivityPreferences = (patientId: string) => {
  const [activityPreferences, setActivityPreferences] = useState<
    PatientActivityPreferenceWithRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientActivityPreferences = async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch all required data in parallel
      const [activities, centreActivities, preferences, recommendations] = await Promise.all([
        getAllActivities(),
        getAllCentreActivities(),
        getCentreActivityPreferences(patientId), // Get preferences for specific patient
        getCentreActivityRecommendations(patientId), // Get recommendations for specific patient
      ]);

      console.log("Fetched patient activity data summary:", {
        patientId,
        activities: activities.length,
        centreActivities: centreActivities.length,
        preferences: preferences.length,
        recommendations: recommendations.length
      });

      // Create a map of centre activity id to activity details
      const centreActivityMap = new Map<number, { activity: Activity; centreActivity: CentreActivity }>();
      
      centreActivities.forEach(centreActivity => {
        const activity = activities.find(a => a.id === centreActivity.activity_id);
        if (activity && !activity.is_deleted && !centreActivity.is_deleted) {
          centreActivityMap.set(centreActivity.id, { activity, centreActivity });
        }
      });

      // Create preference mapping for this patient
      const preferenceMap = new Map<number, string>();
      preferences.forEach(pref => {
        if (pref.patient_id === parseInt(patientId)) {
          preferenceMap.set(pref.centre_activity_id, intToPreference(pref.is_like));
        }
      });

      // Create recommendation mapping for this patient
      const recommendationMap = new Map<number, { recommendation: string; notes?: string }>();
      recommendations.forEach(rec => {
        if (rec.patient_id === parseInt(patientId)) {
          recommendationMap.set(rec.centre_activity_id, {
            recommendation: intToRecommendation(rec.doctor_recommendation),
            notes: rec.doctor_remarks || undefined
          });
        }
      });

      // Combine all data for display - show ALL available activities for this patient
      const combinedData: PatientActivityPreferenceWithRecommendation[] = [];

      // Loop through all centre activities to show complete list for the patient
      centreActivityMap.forEach(({ activity }, centreActivityId) => {
        const patientPreference = preferenceMap.get(centreActivityId) as "LIKE" | "DISLIKE" | "NEUTRAL" | undefined;
        const recommendation = recommendationMap.get(centreActivityId);
        const doctorRecommendation = recommendation?.recommendation as "RECOMMENDED" | "NOT_RECOMMENDED" | "NEUTRAL" | undefined;

        combinedData.push({
          id: parseInt(`${patientId}${centreActivityId}`), // Unique ID combining patient and centre activity
          centreActivityId: centreActivityId,
          activityId: activity.id,
          activityName: activity.title,
          activityDescription: activity.description || undefined,
          patientId: parseInt(patientId),
          patientPreference,
          doctorRecommendation,
          doctorNotes: recommendation?.notes,
          canEdit: true, // Supervisors can edit preferences
        });
      });

      setActivityPreferences(combinedData.sort((a, b) => a.activityName.localeCompare(b.activityName)));
    } catch (err) {
      console.error("Error fetching patient activity preferences:", err);
      setError("Failed to fetch activity preferences for this patient");
    } finally {
      setLoading(false);
    }
  };

  const refreshPatientActivityPreferences = () => {
    fetchPatientActivityPreferences();
  };

  useEffect(() => {
    fetchPatientActivityPreferences();
  }, [patientId]);

  return {
    activityPreferences,
    loading,
    error,
    refreshPatientActivityPreferences,
  };
};