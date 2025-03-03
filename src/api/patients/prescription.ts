import { mockPrescriptionListData } from "@/mocks/mockPatientDetails";
import {
  convertIsAfterMeal,
  getStatusDescription,
} from "@/utils/convertToYesNo";
import { formatDateString } from "@/utils/formatDate";
import { patientPrescriptionAPI, prescriptionAPI } from "../apiConfig";
import { TableRowData } from "@/components/Table/DataTable";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface Prescription {
  IsDeleted: string;
  PatientId: number;
  PrescriptionListId: number;
  Dosage: string;
  FrequencyPerDay: number;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  IsAfterMeal: string;
  PrescriptionRemarks: string;
  Status: string;
  Id: number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface PrescriptionList {
  Id: number;
  IsDeleted: string;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  Value: string;
}

// prescriptions response body from api
export interface PrescriptionViewList {
  data: Prescription[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// prescription response body from api
export interface PrescriptionView {
  data: Prescription;
}

export interface PrescriptionTD extends TableRowData {
  drugName: string;
  dosage: string;
  frequencyPerDay: number;
  instruction: string;
  startDate: string;
  endDate: string;
  afterMeal: string;
  remark: string;
  status: string;
}

export interface PrescriptionTDServer {
  prescriptions: PrescriptionTD[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface PrescriptionFormData {
  PatientId: number;
  PrescriptionListId: number;
  Dosage: string;
  FrequencyPerDay: number;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  IsAfterMeal: string;
  PrescriptionRemarks: string;
  Status: string;
  CreatedById: string;
  ModifiedById: string;
  CreatedDateTime: string;
  UpdatedDateTime: string;
}

export interface PrescriptionDelete {
  PatientId: number;
  PrescriptionListId: number;
  Dosage: string;
  FrequencyPerDay: number;
  Instruction: string;
  StartDate: string;
  PrescriptionRemarks: string;
  UpdatedDateTime: string;
  ModifiedById: string;
}

export interface PrescriptionUpdate {
  PatientId: number;
  PrescriptionListId: number;
  Dosage: string;
  FrequencyPerDay: number;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  IsAfterMeal: string;
  PrescriptionRemarks: string;
  Status: string;
  UpdatedDateTime: string;
  ModifiedById: string;
}

const convertToPrescriptionTDServer = (
  prescriptionList: PrescriptionList[],
  prescriptionViewList: PrescriptionViewList
): PrescriptionTDServer => {
  if (!Array.isArray(prescriptionList)) {
    console.error("prescriptionList is not an array", prescriptionList);
  }

  if (!Array.isArray(prescriptionViewList.data)) {
    console.error(
      "prescriptionViewList.data is not an array",
      prescriptionViewList.data
    );
    return {
      prescriptions: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    };
  }

  const prescriptionsTransformed = prescriptionViewList.data
    .filter((p) => p.IsDeleted === "0")
    .sort((a, b) => b.Id - a.Id) // Descending order
    .map((p) => ({
      id: p.Id,
      drugName:
        prescriptionList
          .find((pl) => pl.Id === p.PrescriptionListId)
          ?.Value.toUpperCase() || "",
      dosage: p.Dosage.toUpperCase(),
      frequencyPerDay: p.FrequencyPerDay,
      instruction: p.Instruction,
      startDate: formatDateString(p.StartDate),
      endDate: formatDateString(p.EndDate),
      afterMeal: convertIsAfterMeal(p.IsAfterMeal)?.toUpperCase(),
      remark: p.PrescriptionRemarks,
      status: getStatusDescription(p.Status)?.toUpperCase(),
    }));

  const updatedTD = {
    prescriptions: prescriptionsTransformed,
    pagination: {
      pageNo: prescriptionViewList.pageNo,
      pageSize: prescriptionViewList.pageSize,
      totalRecords: prescriptionViewList.totalRecords,
      totalPages: prescriptionViewList.totalPages,
    },
  };

  console.log("convertToPrescriptionTD: ", updatedTD);
  return updatedTD;
};

export const fetchPatientPrescription = async (
  patientId: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<PrescriptionTDServer> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const dlResponse = mockPrescriptionListData;
    console.log("GET all prescription List", dlResponse.data);

    const ddResponse = await patientPrescriptionAPI.get<PrescriptionViewList>(
      `/?patient_id=${patientId}&pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("GET all patient prescriptions", ddResponse.data);

    return convertToPrescriptionTDServer(dlResponse.data, ddResponse.data);
  } catch (error) {
    console.error("GET all prescription List/ patient prescriptions", error);
    throw error;
  }
};

export const fetchPrescriptionById = async (
  prescriptionId: number
): Promise<PrescriptionView> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await prescriptionAPI.get<PrescriptionView>(
      `/${prescriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET prescription by prescriptionId", response.data);
    return response.data;
  } catch (error) {
    console.error("GET prescription by prescriptionId", error);
    throw error;
  }
};

export const addPatientPrescription = async (
  formData: PrescriptionFormData
): Promise<PrescriptionView> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await prescriptionAPI.post<PrescriptionView>(
      `/add`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("ADD patient prescription", response.data);

    return response.data;
  } catch (error) {
    console.error("ADD patient prescription", error);
    throw error;
  }
};

export const deletePatientPrescription = async (
  prescriptionId: number,
  prescriptionDelete: PrescriptionDelete
): Promise<PrescriptionView> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await prescriptionAPI.put<PrescriptionView>(
      `/delete/${prescriptionId}`,
      prescriptionDelete,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PUT Delete patient prescription", response.data);

    return response.data;
  } catch (error) {
    console.error("PUT Delete patient prescription", error);
    throw error;
  }
};

export const updatePatientPrescription = async (
  prescriptionId: number,
  prescriptionUpdate: PrescriptionUpdate
): Promise<PrescriptionView> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await prescriptionAPI.put<PrescriptionView>(
      `/update/${prescriptionId}`,
      prescriptionUpdate,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PUT Update patient prescription", response.data);

    return response.data;
  } catch (error) {
    console.error("PUT Update patient prescription", error);
    throw error;
  }
};
