import { useState, useEffect } from "react";
import { Activity, CentreActivity } from "@/api/activity/activityPreference";
import { getActivityExclusionTableByPatient } from "@/api/activity/activityAggregated";

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

export const useCentreActivityExclusions = (patientId: string) => {
  const [centreActivityExclusions, setCentreActivityExclusions] = useState<CentreActivityExclusionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCentreActivityExclusions = async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { activities, centre_activities: centreActivities, exclusions, patients } =
        await getActivityExclusionTableByPatient(patientId);

      const centreActivityMap = new Map<number, { activity: Activity; centreActivity: CentreActivity }>();

      centreActivities.forEach(centreActivity => {
        const activity = activities.find(a => a.id === centreActivity.activity_id);
        if (activity && !activity.is_deleted && !centreActivity.is_deleted) {
          centreActivityMap.set(centreActivity.id, { activity, centreActivity });
        }
      });

      const patientNameMap = new Map<number, string>();
      patients.forEach(patient => {
        patientNameMap.set(patient.id, patient.name || patient.preferred_name || `Patient ${patient.id}`);
      });

      const combinedData: CentreActivityExclusionWithDetails[] = [];

      exclusions.forEach(exclusion => {
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
  }, [patientId]);

  return {
    centreActivityExclusions,
    loading,
    error,
    refreshCentreActivityExclusions,
  };
};