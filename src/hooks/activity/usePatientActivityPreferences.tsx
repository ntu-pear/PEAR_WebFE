import { useState, useEffect } from "react";
import { Activity, CentreActivity } from "@/api/activity/activityPreference";
import { getActivityPreferenceTableByPatient } from "@/api/activity/activityAggregated";
import { intToPreference, intToRecommendation } from "@/utils/activityConversions";
import { CentreActivityExclusionWithDetails } from "./useActivityExclusions";

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
  preferenceId?: number; // Actual database ID if preference exists
}

export const usePatientActivityPreferences = (patientId: string) => {
  const [activityPreferences, setActivityPreferences] = useState<
    PatientActivityPreferenceWithRecommendation[]
  >([]);
  const [centreActivityExclusions, setCentreActivityExclusions] = useState<
    CentreActivityExclusionWithDetails[]
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

      const { activities, centre_activities: centreActivities, preferences, recommendations, exclusions, patients } =
        await getActivityPreferenceTableByPatient(patientId);

      const centreActivityMap = new Map<number, { activity: Activity; centreActivity: CentreActivity }>();

      centreActivities.forEach(centreActivity => {
        const activity = activities.find(a => a.id === centreActivity.activity_id);
        if (activity && !activity.is_deleted && !centreActivity.is_deleted) {
          centreActivityMap.set(centreActivity.id, { activity, centreActivity });
        }
      });

      const preferenceMap = new Map<number, { preference: string; preferenceId?: number }>();
      preferences.forEach(pref => {
        preferenceMap.set(pref.centre_activity_id, {
          preference: intToPreference(pref.is_like),
          preferenceId: pref.id
        });
      });

      const recommendationMap = new Map<number, { recommendation: string; notes?: string }>();
      recommendations.forEach(rec => {
        recommendationMap.set(rec.centre_activity_id, {
          recommendation: intToRecommendation(rec.doctor_recommendation),
          notes: rec.doctor_remarks || undefined
        });
      });

      // Combine all data for display - show ALL available activities for this patient
      const combinedData: PatientActivityPreferenceWithRecommendation[] = [];

      // Loop through all centre activities to show complete list for the patient
      centreActivityMap.forEach(({ activity }, centreActivityId) => {
        const preferenceData = preferenceMap.get(centreActivityId);
        const patientPreference = preferenceData?.preference as "LIKE" | "DISLIKE" | "NEUTRAL" | undefined;
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
          preferenceId: preferenceData?.preferenceId, // Include actual database ID if it exists
        });
      });

      setActivityPreferences(combinedData.sort((a, b) => a.activityName.localeCompare(b.activityName)));

      const patientNameMap = new Map<number, string>();
      patients.forEach(patient => {
        patientNameMap.set(patient.id, patient.name || patient.preferred_name || `Patient ${patient.id}`);
      });

      const combinedExclusions: CentreActivityExclusionWithDetails[] = [];
      exclusions.forEach(exclusion => {
        const centreActivityData = centreActivityMap.get(exclusion.centre_activity_id);
        if (!centreActivityData) return;

        const { activity } = centreActivityData;
        const isBackendIndefinite = exclusion.end_date && new Date(exclusion.end_date).getFullYear() >= 2999;
        const displayEndDate = isBackendIndefinite ? null : exclusion.end_date;
        const isIndefiniteBoolean = Boolean(!exclusion.end_date || isBackendIndefinite);

        combinedExclusions.push({
          id: exclusion.id,
          centreActivityId: exclusion.centre_activity_id,
          activityId: activity.id,
          activityName: activity.title,
          activityDescription: activity.description || undefined,
          patientId: exclusion.patient_id,
          patientName: patientNameMap.get(exclusion.patient_id) || `Patient ${exclusion.patient_id}`,
          exclusionRemarks: exclusion.exclusion_remarks || undefined,
          startDate: exclusion.start_date,
          endDate: displayEndDate,
          isIndefinite: isIndefiniteBoolean,
          canEdit: true,
        });
      });

      setCentreActivityExclusions(combinedExclusions.sort((a, b) => a.activityName.localeCompare(b.activityName)));
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
    centreActivityExclusions,
    loading,
    error,
    refreshPatientActivityPreferences,
  };
};