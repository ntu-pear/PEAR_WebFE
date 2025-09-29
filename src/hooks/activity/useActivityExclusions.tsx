import { useState, useEffect } from "react";
import {
  getAllCentreActivityExclusions,
} from "@/api/activity/activityExclusion";
import {
  getAllActivities,
  getAllCentreActivities,
  Activity,
  CentreActivity,
} from "@/api/activity/activityPreference";
import { fetchAllPatientTD } from "@/api/patients/patients";

// Combined type for display
export interface CentreActivityExclusionWithDetails {
  id: number;
  centreActivityId: number;
  activityId: number;
  activityName: string;
  activityDescription?: string;
  patientId: number;
  patientName: string;
  exclusionRemarks?: string;
  startDate: string;
  endDate?: string | null;
  isIndefinite: boolean;
  canEdit?: boolean;
}

export const useCentreActivityExclusions = () => {
  const [centreActivityExclusions, setCentreActivityExclusions] = useState<CentreActivityExclusionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCentreActivityExclusions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all required data in parallel
      const [activities, centreActivities, exclusions, patientsData] = await Promise.all([
        getAllActivities(),
        getAllCentreActivities(),
        getAllCentreActivityExclusions(),
        fetchAllPatientTD("", null, 0, 1000), // Get all patients
      ]);

      console.log("Fetched centre activity exclusion data summary:", {
        activities: activities.length,
        centreActivities: centreActivities.length,
        exclusions: exclusions.length,
        patients: patientsData.patients.length
      });

      // Create a map of centre activity id to activity details
      const centreActivityMap = new Map<number, { activity: Activity; centreActivity: CentreActivity }>();
      
      centreActivities.forEach(centreActivity => {
        const activity = activities.find(a => a.id === centreActivity.activity_id);
        if (activity && !activity.is_deleted && !centreActivity.is_deleted) {
          centreActivityMap.set(centreActivity.id, { activity, centreActivity });
        }
      });

      // Create patient data mapping
      const patientNameMap = new Map<number, string>();
      patientsData.patients.forEach(patient => {
        const patientId = typeof patient.id === 'string' ? parseInt(patient.id) : patient.id;
        patientNameMap.set(patientId, patient.name || patient.preferredName || `Patient ${patientId}`);
      });

      console.log("Patient mapping created:", {
        patientCount: patientNameMap.size,
        samplePatients: Array.from(patientNameMap.entries()).slice(0, 5)
      });

      // Transform exclusions with activity and patient details
      const combinedData: CentreActivityExclusionWithDetails[] = [];
      
      exclusions.forEach(exclusion => {
        if (exclusion.is_deleted) return; // Skip deleted exclusions
        
        const centreActivityData = centreActivityMap.get(exclusion.centre_activity_id);
        if (!centreActivityData) {
          console.warn(`Centre activity ${exclusion.centre_activity_id} not found for exclusion ${exclusion.id}`);
          return;
        }

        const { activity } = centreActivityData;
        
        // Check if end date is the backend's indefinite marker (2999-01-01)
        const isBackendIndefinite = exclusion.end_date && new Date(exclusion.end_date).getFullYear() >= 2999;
        const displayEndDate = isBackendIndefinite ? null : exclusion.end_date;
        const isIndefiniteBoolean = Boolean(!exclusion.end_date || isBackendIndefinite);

        combinedData.push({
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
          canEdit: true, // Supervisors can edit exclusions
        });
      });

      setCentreActivityExclusions(combinedData.sort((a, b) => a.activityName.localeCompare(b.activityName)));
    } catch (err) {
      console.error("Error fetching centre activity exclusions:", err);
      setError("Failed to fetch centre activity exclusions and related data");
    } finally {
      setLoading(false);
    }
  };

  const refreshCentreActivityExclusions = () => {
    fetchCentreActivityExclusions();
  };

  useEffect(() => {
    fetchCentreActivityExclusions();
  }, []);

  return {
    centreActivityExclusions,
    loading,
    error,
    refreshCentreActivityExclusions,
  };
};