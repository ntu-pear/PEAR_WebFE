// src/api/patients/medicalDiagnosis.ts
import { TableRowData } from "@/components/Table/DataTable";
import {
  medicalDiagnosisListAPI,
  createMedicalDiagnosisListAPI,
  updateMedicalDiagnosisListAPI,
  deleteMedicalDiagnosisListAPI,
} from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

// =====================
// Raw server models
// =====================
export interface MedicalDiagnosis {
  Id: number;
  DiagnosisName: string;
  IsDeleted: string; // "0" | "1"
  CreatedDate: string;
  ModifiedDate: string;
  CreatedByID: string;
  ModifiedByID: string;
}

export interface ViewMedicalDiagnosisList {
  data: MedicalDiagnosis[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// =====================
// Table model
// =====================
export interface MedicalDiagnosisTD extends TableRowData {
  diagnosis_name: string;
  isDeleted: string; // "0" | "1"
  createdDate: string;
  modifiedDate: string;
}

// Useful if you want pagination similar to MedicalHistoryTDServer
export interface MedicalDiagnosisTDServer {
  medicalDiagnosis: MedicalDiagnosisTD[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

// =====================
// Payloads
// =====================
export interface AddMedicalDiagnosis {
  DiagnosisName: string;
  IsDeleted: string; // "0"
  CreatedDate: string;
  ModifiedDate: string;
  CreatedByID?: string;
  ModifiedByID?: string;
}

export interface UpdateMedicalDiagnosis {
  DiagnosisName: string;
  IsDeleted: string; // "0" or "1"

}

// =====================
// Converters
// =====================
export const convertToMedicalDiagnosisTD = (
  diagnosisList: MedicalDiagnosis[]
): MedicalDiagnosisTD[] => {
  return diagnosisList.map((d) => ({
    id: d.Id,
    diagnosis_name: d.DiagnosisName,
    isDeleted: d.IsDeleted,
    createdDate: d.CreatedDate,
    modifiedDate: d.ModifiedDate,
  }));
};

// =====================
// API calls
// =====================

// // Mirrors fetchMedicalHistory style (supports pagination)
// export const fetchMedicalDiagnosis = async (
//   pageNo: number = 0,
//   pageSize: number = 10
// ): Promise<MedicalDiagnosisTDServer> => {
//   const token = retrieveAccessTokenFromCookie();
//   if (!token) throw new Error("No token found.");

//   try {
//     const response = await medicalDiagnosisListAPI.get<ViewMedicalDiagnosisList>("", {
//       params: { pageNo, pageSize },
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const pagination = {
//       pageNo: response.data.pageNo,
//       pageSize: response.data.pageSize,
//       totalRecords: response.data.totalRecords,
//       totalPages: response.data.totalPages,
//     };

//     const rows = convertToMedicalDiagnosisTD(response.data.data);
//     return { medicalDiagnosis: rows, pagination };
//   } catch (error) {
//     console.error("GET Medical Diagnosis List", error);
//     throw error;
//   }
// };

// If you want a simple “list only” function like your socialHistory.ts did
export const fetchMedicalDiagnosisList = async (): Promise<MedicalDiagnosis[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await medicalDiagnosisListAPI.get<ViewMedicalDiagnosisList>("", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("GET medical diagnosis list", response.data);
    return response.data.data;
  } catch (error) {
    console.error("GET medical diagnosis list", error);
    throw error;
  }
};

export const createMedicalDiagnosisList = async (
  diagnosisName: string,
): Promise<MedicalDiagnosis> => {
  const token = retrieveAccessTokenFromCookie();
  console.log(token)
  if (!token) throw new Error("No token found.");

  try {

    const response = await createMedicalDiagnosisListAPI.post("", 
        {
        DiagnosisName: diagnosisName,
        IsDeleted: "0",
      }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("POST create medical diagnosis", response.data);

    // Some endpoints return {data: ...}, others return the object directly.
    return response.data.data ?? response.data;
  } catch (error) {
    console.error("POST create medical diagnosis", error);
    throw error;
  }
};

export const updateMedicalDiagnosisList = async (
  id: number,
  diagnosisName: string,
) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
  console.log(id)
  try {
    const payload: UpdateMedicalDiagnosis = {
      DiagnosisName: diagnosisName,
      IsDeleted: "0",

    };

    const response = await updateMedicalDiagnosisListAPI.put("", payload, {
      params: {diagnosis_id: id,},
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("PUT update medical diagnosis", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update medical diagnosis", error);
    throw error;
  }
};

export const deleteMedicalDiagnosisList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deleteMedicalDiagnosisListAPI.delete("", {
      params: {diagnosis_id: id},
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("DELETE medical diagnosis", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE medical diagnosis", error);
    throw error;
  }
};
