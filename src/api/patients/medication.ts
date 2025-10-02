import { TableRowData } from "@/components/Table/DataTable";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { medicationAPI } from "../apiConfig";
import { fetchPrescriptionList, PrescriptionList } from "./prescription";
import { formatDate } from "@/utils/formatDate";

export interface IMedication {
  IsDeleted: string;
  PatientId: number;
  PrescriptionListId: number;
  AdministerTime: string;
  Dosage: string;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  PrescriptionRemarks: string;
  Id: number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface IMedicationView {
  data: IMedication;
}

export interface IMedicationList {
  data: IMedication[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface IMedicationTableData extends TableRowData {
  drugName: string;
  administerTime: string;
  dosage: string;
  instruction: string;
  startDate: string;
  endDate: string;
  prescriptionRemarks: string;
}

export interface IMedicationTableDataServer {
  medications: IMedicationTableData[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface IMedicationFormData {
  IsDeleted: string;
  PatientId: number;
  PrescriptionListId: number;
  AdministerTime: string;
  Dosage: string;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  PrescriptionRemarks: string;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

const convertToMedicationTDServer = (
  prescriptionList: PrescriptionList[],
  { data, pageNo, pageSize, totalRecords, totalPages }: IMedicationList
): IMedicationTableDataServer => {
  return {
    medications: data.map(
      ({
        Id,
        PrescriptionListId,
        AdministerTime,
        Dosage,
        Instruction,
        StartDate,
        EndDate,
        PrescriptionRemarks,
      }) => ({
        id: Id,
        drugName:
          prescriptionList.find(({ Id }) => Id === PrescriptionListId)?.Value ||
          "Unknown Drug",
        administerTime: AdministerTime,
        dosage: Dosage,
        instruction: Instruction,
        startDate: formatDate(StartDate),
        endDate: formatDate(EndDate),
        prescriptionRemarks: PrescriptionRemarks,
      })
    ),
    pagination: {
      pageNo,
      pageSize,
      totalRecords,
      totalPages,
    },
  };
};

export const fetchPatientMedicationTD = async (
  patientId: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<IMedicationTableDataServer> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const prescriptionList = await fetchPrescriptionList();

    const patientMedication = await medicationAPI.get<IMedicationList>(
      `/PatientMedication?patient_id=${patientId}&pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET Patient Medication", patientMedication.data);
    return convertToMedicationTDServer(
      prescriptionList.data,
      patientMedication.data
    );
  } catch (error) {
    console.error("GET Patient Medication", error);
    throw error;
  }
};

export const fetchMedicationById = async (
  medicationId: number
): Promise<IMedicationView> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await medicationAPI.get<IMedicationView>(
      `/${medicationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET Patient Medication By Id", response.data);
    return response.data;
  } catch (error) {
    console.error("GET Patient Medication By Id", error);
    throw error;
  }
};

export const addPatientMedication = async (
  data: IMedicationFormData
): Promise<IMedicationView> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await medicationAPI.post<IMedicationView>("/add", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("POST add Patient Medication", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add Patient Medication", error);
    throw error;
  }
};

export const updatePatientMedication = async (
  medicationId: number,
  data: IMedicationFormData
): Promise<IMedicationView> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await medicationAPI.put<IMedicationView>(
      `/update/${medicationId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT update Patient Medication", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update Patient Medication", error);
    throw error;
  }
};

export const deletePatientMedication = async (
  medicationId: number
): Promise<IMedicationView> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
  try {
    const response = await medicationAPI.delete<IMedicationView>(
      `/delete/${medicationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("DELETE Patient Medication", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE Patient Medication", error);
    throw error;
  }
};
