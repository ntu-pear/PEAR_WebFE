import { adhocAPI } from "@/api/apiConfig";
import { listActivities } from "./activities";
import { fetchPatientInfo } from "@/api/patients/patients";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";
import { formatDateTime } from "@/utils/formatDate";

/* =========================
   Auth Header (REQUIRED)
========================= */

const authHeader = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
};

// Backend raw adhoc activity type
interface AdhocActivityData {
  id: number;
  PatientId: number;
  PatientName?: string;
  StartDate: string;
  EndDate: string;
  OldActivityId?: number;
  NewActivityId?: number;
  LastUpdated?: string;
}

// Frontend Table Type
export interface AdhocActivity {
  id: number;
  patientId: number;
  patientName?: string;
  startDate: string;
  endDate: string;
  oldActivityId?: number;
  oldActivityTitle?: string;
  oldActivityDescription?: string;
  newActivityId?: number;
  newActivityTitle?: string;
  newActivityDescription?: string;
  lastUpdated?: string;
}

/* =========================
   API Calls
========================= */

/**
 * List all adhoc activities
 * @param includeDeleted optional, default false
 * @param skip optional, default 0
 * @param limit optional, default 100
 */
export const listAdhocActivities = async (
  includeDeleted = false,
  skip = 0,
  limit = 100
): Promise<AdhocActivity[]> => {
  try {
    const res = await adhocAPI.get<AdhocActivity[]>("/", {
    headers: {
        ...authHeader(),
        "Cache-Control": "no-cache",
    },
    params: { 
        include_deleted: includeDeleted, 
        skip, 
        limit 
    },
    });

    const adhocs = res.data; // raw backend data

    // 2️⃣ fetch all activities once to map ids
    const allActivities = await listActivities({ include_deleted: true, limit: 1000 });
    const activityMap = new Map<number, { title: string; description?: string }>();
    allActivities.forEach((a) =>
    activityMap.set(a.id, {
        title: a.title,
        description: a.description ?? undefined, // ✅ convert null to undefined
    })
    );

    // 3️⃣ map each adhoc
    const mapped = await Promise.all(
      adhocs.map(async (a: any) => {
        // get patient name
        let patientName = "Unknown";
        try {
          const patient = await fetchPatientInfo(a.patient_id);
          patientName = patient.name;
        } catch (err) {
          console.warn(`Failed to fetch patient ${a.patient_id}`, err);
        }

        const oldActivity = activityMap.get(a.old_centre_activity_id);
        const newActivity = activityMap.get(a.new_centre_activity_id);

        return {
          id: a.id,
          patientId: a.patient_id,
          patientName,
          startDate: formatDateTime(a.start_date),
          endDate: formatDateTime(a.end_date),
          oldActivityId: a.old_centre_activity_id,
          oldActivityTitle: oldActivity?.title ?? "",
          oldActivityDescription: oldActivity?.description ?? "", // ✅ fix null
          newActivityId: a.new_centre_activity_id,
          newActivityTitle: newActivity?.title ?? "",
          newActivityDescription: newActivity?.description ?? "",
          lastUpdated: formatDateTime(a.modified_date ?? a.created_date),
        };
      })
    );

    // 4️⃣ sort by patient name
    return mapped.sort((a, b) => a.patientName.localeCompare(b.patientName));
  } catch (error) {
    console.error("Failed to fetch adhoc activities:", error);
    throw error;
  }
};

// Fetch adhoc by patient ID (optional, similar pattern)
export const listAdhocByPatient = async (patientId: number): Promise<AdhocActivity[]> => {
  try {
    const res = await adhocAPI.get<AdhocActivityData[]>(`/patient/${patientId}`, { headers: authHeader() });

    const allActivities = await listActivities({ include_deleted: false, limit: 1000 });

    return res.data.map((a: AdhocActivityData) => {
      const oldAct = allActivities.find(act => act.id === a.OldActivityId);
      const newAct = allActivities.find(act => act.id === a.NewActivityId);

      return {
        id: a.id,
        patientId: a.PatientId,
        patientName: a.PatientName ?? "Unknown",
        startDate: a.StartDate,
        endDate: a.EndDate,
        oldActivityId: a.OldActivityId,
        oldActivityTitle: oldAct?.title,
        oldActivityDescription: oldAct?.description ?? "",
        newActivityId: a.NewActivityId,
        newActivityTitle: newAct?.title,
        newActivityDescription: newAct?.description ?? "",
        lastUpdated: a.LastUpdated,
      };
    });
  } catch (error) {
    console.error(`Failed to fetch adhoc activities for patient ${patientId}:`, error);
    throw error;
  }
};

// Create new adhoc activity
export interface CreateAdhocInput {
  patientId: number;
  startDate: string;
  endDate: string;
  oldActivityId?: number;
  oldActivityTitle?: string;
  newActivityId?: number;
  newActivityTitle?: string;
}

export const createAdhocActivity = async (input: CreateAdhocInput) => {
  try {
    const res = await adhocAPI.post("/", input, { headers: authHeader() });
    return res.data;
  } catch (error) {
    console.error("Failed to create adhoc activity:", error);
    throw error;
  }
};

// Update existing adhoc activity
export interface UpdateAdhocInput extends CreateAdhocInput {
  id: number;
}

export const updateAdhocActivity = async (input: UpdateAdhocInput) => {
  try {
    const res = await adhocAPI.put(`/${input.id}`, input, { headers: authHeader() });
    return res.data;
  } catch (error) {
    console.error("Failed to update adhoc activity:", error);
    throw error;
  }
};

// Delete adhoc activity
export const deleteAdhocActivity = async (id: number) => {
  try {
    const res = await adhocAPI.delete(`/${id}`, { headers: authHeader() });
    return res.data;
  } catch (error) {
    console.error("Failed to delete adhoc activity:", error);
    throw error;
  }
};

export const fetchAdhocActivities = async (): Promise<AdhocActivity[]> => {
  const res = await fetch("http://10.96.188.186/api/v1/activities/?include_deleted=false&skip=0&limit=100");
  if (!res.ok) throw new Error("Failed to fetch adhoc activities");
  return res.json();
};
