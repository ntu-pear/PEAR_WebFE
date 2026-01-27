import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAllCentreActivities, CentreActivity } from "@/api/activity/activityPreference";
import { getAllActivities, Activity } from "@/api/activity/activityPreference";
import { fetchAllPatientTD } from "@/api/patients/patients";
import { toast } from "sonner";

export interface CentreActivityExclusionFormValues {
  centre_activity_id: number;
  patient_id: number;
  exclusion_remarks?: string;
  start_date: string;
  end_date?: string | null;
}

type Props = {
  initial?: CentreActivityExclusionFormValues & { id?: number };
  submitting?: boolean;
  isEditing?: boolean;
  onSubmit: (values: CentreActivityExclusionFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

interface CentreActivityWithDetails extends CentreActivity {
  activity_title?: string;
}

interface Patient {
  id: string | number;
  name?: string;
  preferredName?: string;
}

export default function CentreActivityExclusionForm({ 
  initial, 
  submitting, 
  isEditing = false,
  onSubmit, 
  onCancel 
}: Props) {
  const [centreActivityId, setCentreActivityId] = useState<string>(
    initial?.centre_activity_id?.toString() ?? ""
  );
  const [patientId, setPatientId] = useState<string>(
    initial?.patient_id?.toString() ?? ""
  );
  const [exclusionRemarks, setExclusionRemarks] = useState(
    initial?.exclusion_remarks ?? ""
  );
  const [startDate, setStartDate] = useState(
    initial?.start_date ?? ""
  );
  const [endDate, setEndDate] = useState(() => {
    if (!initial?.end_date) return "";
    // Check if it's the backend's indefinite marker (2999-01-01)
    const endDateObj = new Date(initial.end_date);
    return endDateObj.getFullYear() >= 2999 ? "" : initial.end_date;
  });
  const [isIndefinite, setIsIndefinite] = useState(() => {
    if (!initial?.end_date) return !!initial;
    // Check if it's the backend's indefinite marker (2999-01-01)
    const endDateObj = new Date(initial.end_date);
    return endDateObj.getFullYear() >= 2999;
  });

  const [centreActivities, setCentreActivities] = useState<CentreActivityWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activitiesData, centreActivitiesData, patientsData] = await Promise.all([
          getAllActivities(),
          getAllCentreActivities(),
          fetchAllPatientTD("", null, 0, 1000),
        ]);

        // Create activity map for titles
        const activityMap = new Map<number, Activity>();
        activitiesData.forEach(activity => {
          if (!activity.is_deleted) {
            activityMap.set(activity.id, activity);
          }
        });

        // Combine centre activities with activity titles
        const centreActivitiesWithDetails: CentreActivityWithDetails[] = 
          centreActivitiesData
            .filter(ca => !ca.is_deleted)
            .map(ca => ({
              ...ca,
              activity_title: activityMap.get(ca.activity_id)?.title || 'Unknown Activity'
            }))
            .sort((a, b) => (a.activity_title || '').localeCompare(b.activity_title || ''));

        setCentreActivities(centreActivitiesWithDetails);
        setPatients(patientsData.patients.sort((a, b) => {
          const nameA = a.name || a.preferredName || `Patient ${a.id}`;
          const nameB = b.name || b.preferredName || `Patient ${b.id}`;
          return nameA.localeCompare(nameB);
        }));
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!centreActivityId) {
      newErrors.centre_activity_id = ["Activity is required"];
    }
    if (!isEditing && !patientId) {
      newErrors.patient_id = ["Patient is required"];
    }
    if (!startDate) {
      newErrors.start_date = ["Start date is required"];
    }
    if (!exclusionRemarks.trim()) {
      newErrors.exclusion_remarks = ["Exclusion remarks are required"];
    }
    if (!isIndefinite && endDate && startDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.end_date = ["End date must be after start date"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formValues: CentreActivityExclusionFormValues = {
      centre_activity_id: parseInt(centreActivityId),
      patient_id: parseInt(patientId),
      exclusion_remarks: exclusionRemarks.trim() || undefined,
      start_date: startDate,
      end_date: isIndefinite ? "2999-01-01" : (endDate || null),
    };

    try {
      await onSubmit(formValues);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading form data...</div>;
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Activity Selection */}
      <div className="space-y-2">
        <Label htmlFor="centre-activity">Activity *</Label>
        <select
          id="centre-activity"
          value={centreActivityId}
          onChange={(e) => setCentreActivityId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
        >
          <option value="" disabled>Select an activity</option>
          {centreActivities.map((ca) => (
            <option key={ca.id} value={ca.id.toString()}>
              {ca.activity_title}
            </option>
          ))}
        </select>
        {errors.centre_activity_id && (
          <div className="text-sm text-red-600">
            {errors.centre_activity_id.join(", ")}
          </div>
        )}
      </div>

      {/* Patient Selection - Only show when not editing */}
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="patient">Patient *</Label>
          <select
            id="patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
          >
            <option value="" disabled>Select a patient</option>
            {patients.map((patient) => {
              const patientIdStr = typeof patient.id === 'string' ? patient.id : patient.id.toString();
              const patientName = patient.name || patient.preferredName || `Patient ${patient.id}`;
              return (
                <option key={patientIdStr} value={patientIdStr}>
                  {patientName}
                </option>
              );
            })}
          </select>
          {errors.patient_id && (
            <div className="text-sm text-red-600">
              {errors.patient_id.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Start Date */}
      <div className="space-y-2">
        <Label htmlFor="start-date">Start Date *</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        {errors.start_date && (
          <div className="text-sm text-red-600">
            {errors.start_date.join(", ")}
          </div>
        )}
      </div>

      {/* Indefinite Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="indefinite"
          checked={isIndefinite}
          onChange={(e) => {
            setIsIndefinite(e.target.checked);
            if (e.target.checked) {
              setEndDate("");
            }
          }}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <Label
          htmlFor="indefinite"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Indefinite exclusion
        </Label>
      </div>

      {/* End Date (only if not indefinite) */}
      {!isIndefinite && (
        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
          {errors.end_date && (
            <div className="text-sm text-red-600">
              {errors.end_date.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Exclusion Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Exclusion Remarks *</Label>
        <Textarea
          id="remarks"
          placeholder="Enter reason for exclusion..."
          value={exclusionRemarks}
          onChange={(e) => setExclusionRemarks(e.target.value)}
          className="resize-none"
          rows={3}
        />
        {errors.exclusion_remarks && (
          <div className="text-sm text-red-600">
            {errors.exclusion_remarks.join(", ")}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? "Saving..." : initial?.id ? "Update Centre Activity Exclusion" : "Create Centre Activity Exclusion"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}