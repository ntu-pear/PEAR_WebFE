// src/api/scheduler/medicalSchedule.ts
import { schedulerMedicationAPI } from "@/api/apiConfig";
import { fetchPatientInfo } from "@/api/patients/patients";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";

// Backend raw medication schedule type
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

// Frontend table-friendly type
export interface MedicationScheduleItem {
  patientId: number;
  patientName: string;
  prescriptionName: string;
  administerDate: string;
  administerTime: string;
  status: string;
  actualAdministerTime?: string;
  administeredBy?: string;
  assignedTo?: string; // Caregiver
  id: string; // unique id for DataTableClient
  profilePicture?: string; 
}

const authHeader = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
};

// ✅ List all medication schedules
export const listMedicationSchedules = async (): Promise<MedicationScheduleItem[]> => {
  try {
    const res = await schedulerMedicationAPI.get<MedicationScheduleData[]>("/get/", {
      headers: authHeader(),
    });

    const rawData = res.data;

    const mapped = await Promise.all(
      rawData.map(async (item, index) => {
        let patientName = "Unknown";
        let profilePicture = "";

        try {
          const patient = await fetchPatientInfo(item.PatientID);
          patientName = patient.name;
          profilePicture = patient.profilePicture || "";
        } catch (err) {
          console.warn(`Failed to fetch patient ${item.PatientID}`, err);
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
          administeredBy: item.AdministeredBy,
          assignedTo: item.AssignedTo,
          id: `${item.PatientID}-${item.PrescriptionName}-${index}`, // unique ID
        };
      })
    );

    // Optional: sort by patient name
    return mapped.sort((a, b) => a.patientName.localeCompare(b.patientName));
  } catch (error) {
    console.error("Failed to fetch medication schedules:", error);
    throw error;
  }
};

// ✅ Update a medication schedule (mark as administered or edited)
export const updateMedicationSchedule = async (item: MedicationScheduleItem) => {
  try {
    const payload = {
      PatientID: item.patientId,
      PrescriptionName: item.prescriptionName,
      AdministerDate: item.administerDate,
      AdministerTime: item.administerTime,
      Status: item.status,
      AdministeredBy: item.administeredBy || "",
    };

    const res = await schedulerMedicationAPI.put<MedicationScheduleData>("/update/", payload, {
      headers: authHeader(),
    });

    return res.data;
  } catch (error) {
    console.error("Failed to update medication schedule:", error);
    throw error;
  }
};