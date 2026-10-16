import { schedulerMedicationAPI } from "@/api/apiConfig";
import { fetchPatientInfo } from "@/api/patients/patients";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";
import { userAPI } from "@/api/apiConfig";

// Backend raw
interface MedicationScheduleData {
  PatientID: number;
  PrescriptionName: string;
  AdministerDate: string;
  AdministerTime: string;
  Status: string; // "0" or "1"
  ActualAdministerTime?: string;
  AdministeredBy?: string;
  AssignedTo?: string;
}
export interface MedicationScheduleItem {
  patientId: number;
  patientName: string;
  prescriptionName: string;
  administerDate: string;
  administerTime: string;
  status: string;
  actualAdministerTime?: string;
  administeredBy?: string;
  administeredByProfile?: string;
  assignedTo?: string;
  assignedToProfile?: string;
  id: string;
  profilePicture?: string;
}

const authHeader = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
};

// The schedule lists the same few staff on many rows, and the User service
// rate-limits these lookups, so share one request per user and keep the result.
// Failed lookups are not kept, so the next load tries again.
const usernameCache = new Map<string, Promise<string>>();
const profilePhotoCache = new Map<string, Promise<string>>();

const cached = (
  cache: Map<string, Promise<string>>,
  userId: string,
  load: () => Promise<string | null>
): Promise<string> => {
  const hit = cache.get(userId);
  if (hit) return hit;
  const pending = load().then((value) => {
    if (value === null) cache.delete(userId);
    return value ?? "";
  });
  cache.set(userId, pending);
  return pending;
};

const getUsernameById = async (userId: string) => {
  const name = await cached(usernameCache, userId, async () => {
    try {
      const res = await userAPI.get(`/username/${userId}`, {
        headers: authHeader(),
      });
      return res.data.nric_FullName || res.data.preferredName || "";
    } catch (err) {
      console.warn(`Failed to fetch name for user ${userId}`, err);
      return null;
    }
  });
  // fallback to ID if no name found
  return name || userId;
};

export const fetchUserProfilePhotoById = async (
  userId: string
): Promise<string> =>
  cached(profilePhotoCache, userId, async () => {
    try {
      const res = await userAPI.get(`/profile_pic/${userId}`, {
        headers: authHeader(),
      });
      return res?.data?.image_url || "";
    } catch (err) {
      console.warn(`Failed to fetch profile pic for user ${userId}`, err);
      return null;
    }
  });

// List all medication schedules
export const listMedicationSchedules = async (): Promise<
  MedicationScheduleItem[]
> => {
  try {
    const res = await schedulerMedicationAPI.get<MedicationScheduleData[]>(
      "/get/",
      {
        headers: authHeader(),
      }
    );

    const rawData = res.data;

    if (!Array.isArray(rawData)) {
      return [];
    }

    const mapped = await Promise.all(
      rawData.map(async (item, index) => {
        let patientName = "Unknown";
        let profilePicture = "";
        let assignedToName = item.AssignedTo || ""; // fallback to ID if needed
        let assignedToProfile = "";
        let administeredByName = item.AdministeredBy || ""; // fallback to ID if needed
        let administeredByProfile = "";

        try {
          const patient = await fetchPatientInfo(item.PatientID);
          patientName = patient.name || `Patient ${item.PatientID}`;
          profilePicture = patient.profilePicture || "";
        } catch (err) {
          console.warn(`Failed to fetch patient ${item.PatientID}`, err);
        }

        if (item.AssignedTo) {
          assignedToName = await getUsernameById(item.AssignedTo); // uses ID if no name
          assignedToProfile = await fetchUserProfilePhotoById(item.AssignedTo);
        }

        if (item.AdministeredBy) {
          administeredByName = await getUsernameById(item.AdministeredBy); // uses ID if no name
          administeredByProfile = await fetchUserProfilePhotoById(
            item.AdministeredBy
          );
        }

        return {
          patientId: item.PatientID,
          patientName,
          profilePicture,
          prescriptionName: item.PrescriptionName,
          administerDate: item.AdministerDate,
          administerTime: item.AdministerTime,
          status: item.Status,
          actualAdministerTime: item.ActualAdministerTime,
          administeredBy: administeredByName,
          administeredByProfile,
          assignedTo: assignedToName,
          assignedToProfile,
          id: `${item.PatientID}-${item.PrescriptionName}-${index}`,
        };
      })
    );

    return mapped.sort((a, b) => a.patientName.localeCompare(b.patientName));
  } catch (error) {
    console.error("Failed to fetch medication schedules:", error);
    throw error;
  }
};

// Update a medication schedule
export const updateMedicationSchedule = async (
  item: MedicationScheduleItem
) => {
  try {
    const payload = {
      PatientID: item.patientId,
      PrescriptionName: item.prescriptionName,
      AdministerDate: item.administerDate,
      AdministerTime: item.administerTime,
      Status: item.status,
      AdministeredBy: item.administeredBy || "",
    };

    const res = await schedulerMedicationAPI.put<MedicationScheduleData>(
      "/update/",
      payload,
      {
        headers: authHeader(),
      }
    );

    return res.data;
  } catch (error) {
    console.error("Failed to update medication schedule:", error);
    throw error;
  }
};
// Undo a given dose (supervisors only). Scheduler also undoes it in patient service.
export const undoMedicationSchedule = async (item: MedicationScheduleItem) => {
  const payload = {
    PatientID: item.patientId,
    PrescriptionName: item.prescriptionName,
    AdministerDate: item.administerDate,
    AdministerTime: item.administerTime,
  };
  const res = await schedulerMedicationAPI.put("/undo/", payload, {
    headers: authHeader(),
  });
  return res.data;
};
