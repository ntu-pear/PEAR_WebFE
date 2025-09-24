import { useState, useEffect } from "react";
import {
  getAllCentreActivityPreferences,
  getAllActivities,
  getAllCentreActivities,
  CentreActivityPreference,
  Activity,
  CentreActivity,
} from "@/api/activity/activityPreference";
import {
  getAllCentreActivityRecommendations,
  CentreActivityRecommendation,
} from "@/api/activity/activityRecommendation";
import { fetchAllPatientTD } from "@/api/patients/patients";

// Combined type for display
export interface ActivityPreferenceWithRecommendation {
  id: number;
  centreActivityId: number;
  activityId: number;
  activityName: string;
  activityDescription?: string;
  patientId: number;
  patientName: string;
  patientPreference?: "LIKE" | "DISLIKE" | "NEUTRAL" | null;
  doctorRecommendation?: "RECOMMENDED" | "NOT_RECOMMENDED" | "NEUTRAL" | null;
  doctorNotes?: string;
  canEdit?: boolean;
}

export const useActivityPreferences = () => {
  const [activityPreferences, setActivityPreferences] = useState<
    ActivityPreferenceWithRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("📊 useActivityPreferences - Fetching ALL patients' activity preferences");

  const fetchActivityPreferences = async () => {
    try {
      console.log("🔄 Starting to fetch ALL patients' activity preferences and recommendations");
      setLoading(true);
      setError(null);
      
      // Fetch all required data in parallel
      console.log("🔄 Fetching all data in parallel...");
      const [activities, centreActivities, preferences, recommendations, patientsData] = await Promise.all([
        getAllActivities(),
        getAllCentreActivities(),
        getAllCentreActivityPreferences(), // Get ALL preferences from all patients
        getAllCentreActivityRecommendations(), // Get ALL recommendations from all patients
        fetchAllPatientTD("", null, 0, 1000), // Get all patients (large page size to get all)
      ]);

      console.log("📊 Fetched data summary:", {
        activities: activities.length,
        centreActivities: centreActivities.length,
        preferences: preferences.length,
        recommendations: recommendations.length,
        patients: patientsData.patients.length
      });

      console.log("🔍 Raw data details:");
      console.log("Activities sample:", activities.slice(0, 3));
      console.log("Centre Activities sample:", centreActivities.slice(0, 3));
      console.log("Preferences sample:", preferences.slice(0, 5));
      console.log("Recommendations sample:", recommendations.slice(0, 5));
      console.log("Patients sample:", patientsData.patients.slice(0, 5));

      // Create a map of centre activity id to activity details
      const centreActivityMap = new Map<number, { activity: Activity; centreActivity: CentreActivity }>();
      
      centreActivities.forEach(centreActivity => {
        const activity = activities.find(a => a.id === centreActivity.activity_id);
        if (activity && !activity.is_deleted && !centreActivity.is_deleted) {
          centreActivityMap.set(centreActivity.id, { activity, centreActivity });
        }
      });

      // Create preference and recommendation maps by patient-centre_activity combination
      const preferenceMap = new Map<string, CentreActivityPreference>();
      preferences.forEach(pref => {
        console.log(`🔍 Processing preference: patient_id=${pref.patient_id}, centre_activity_id=${pref.centre_activity_id}, is_like=${pref.is_like}, is_deleted=${pref.is_deleted}`);
        if (!pref.is_deleted) {
          const key = `${pref.patient_id}-${pref.centre_activity_id}`;
          preferenceMap.set(key, pref);
        }
      });

      const recommendationMap = new Map<string, CentreActivityRecommendation>();
      recommendations.forEach(rec => {
        console.log(`🔍 Processing recommendation: patient_id=${rec.patient_id}, centre_activity_id=${rec.centre_activity_id}, doctor_remarks=${rec.doctor_remarks}, is_deleted=${rec.is_deleted}`);
        if (!rec.is_deleted) {
          const key = `${rec.patient_id}-${rec.centre_activity_id}`;
          recommendationMap.set(key, rec);
        }
      });

      // Get all unique patient-centre activity combinations
      const patientActivityCombinations = new Set<string>();
      preferences.forEach(pref => !pref.is_deleted && patientActivityCombinations.add(`${pref.patient_id}-${pref.centre_activity_id}`));
      recommendations.forEach(rec => !rec.is_deleted && patientActivityCombinations.add(`${rec.patient_id}-${rec.centre_activity_id}`));

      console.log("🎯 Unique patient-activity combinations:", patientActivityCombinations.size);

      // Create real patient data mapping from API response
      const patientNameMap = new Map<number, string>();
      patientsData.patients.forEach(patient => {
        const patientId = typeof patient.id === 'string' ? parseInt(patient.id) : patient.id;
        patientNameMap.set(patientId, patient.name || patient.preferredName || `Patient ${patientId}`);
      });

      console.log("👥 Patient mapping created:", {
        patientCount: patientNameMap.size,
        samplePatients: Array.from(patientNameMap.entries()).slice(0, 5)
      });

      // Show patient-activity combinations with preferences or recommendations
      const combinedData: ActivityPreferenceWithRecommendation[] = [];
      
      patientActivityCombinations.forEach(combination => {
        const [patientIdStr, centreActivityIdStr] = combination.split('-');
        const patientId = parseInt(patientIdStr);
        const centreActivityId = parseInt(centreActivityIdStr);
        
        const centreActivityData = centreActivityMap.get(centreActivityId);
        if (!centreActivityData) {
          console.warn(`⚠️ Centre activity ${centreActivityId} not found in centre activities`);
          return;
        }

        const { activity } = centreActivityData;
        const preference = preferenceMap.get(combination);
        const recommendation = recommendationMap.get(combination);

        // For preferences: LIKE/DISLIKE if exists, NEUTRAL as default
        const patientPreference: "LIKE" | "DISLIKE" | "NEUTRAL" = preference 
          ? (preference.is_like ? "LIKE" : "DISLIKE") 
          : "NEUTRAL"; // Default to NEUTRAL when no preference record exists

        // For recommendations: RECOMMENDED if exists, null if no record
        const doctorRecommendation = recommendation ? "RECOMMENDED" : null;

        combinedData.push({
          id: parseInt(`${patientId}${centreActivityId}`), // Unique ID combining patient and centre activity
          centreActivityId: centreActivityId,
          activityId: activity.id,
          activityName: activity.title,
          activityDescription: activity.description || undefined,
          patientId: patientId,
          patientName: patientNameMap.get(patientId) || `Patient ${patientId}`,
          patientPreference,
          doctorRecommendation,
          doctorNotes: recommendation?.doctor_remarks || undefined,
          canEdit: true, // Supervisors can edit preferences
        });
      });

      setActivityPreferences(combinedData.sort((a, b) => a.activityName.localeCompare(b.activityName)));
      console.log("✅ Successfully set activity preferences:", combinedData.length, "items");
    } catch (err) {
      console.error("❌ Error fetching activity preferences:", err);
      setError("Failed to fetch activity preferences and patient data");
    } finally {
      setLoading(false);
    }
  };

  const refreshActivityPreferences = () => {
    fetchActivityPreferences();
  };

  useEffect(() => {
    fetchActivityPreferences();
  }, []); // No patient dependency since we fetch all patients' data

  return {
    activityPreferences,
    loading,
    error,
    refreshActivityPreferences,
  };
};