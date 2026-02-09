// src/api/patients/DementiaStage.ts
import { TableRowData } from "@/components/Table/DataTable";
import {
  dementiaStageListAPI,
  createDementiaStageListAPI,
  updateDementiaStageListAPI,
  deleteDementiaStageListAPI,
} from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

// =====================
// Raw server models
// =====================
export interface DementiaStage {
  id: number;
  DementiaStage: string;
  IsDeleted: string; // "0" | "1"
  CreatedDate: string;
  ModifiedDate: string;
  CreatedByID: string;
  ModifiedByID: string;
}

export interface ViewDementiaStageList {
  data: DementiaStage[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// =====================
// Table model
// =====================
export interface DementiaStageTD extends TableRowData {
  DementiaStage: string;
  isDeleted: string; // "0" | "1"
  createdDate: string;
  modifiedDate: string;
}

// Useful if you want pagination similar to MedicalHistoryTDServer
export interface DementiaStageTDServer {
  DementiaStage: DementiaStageTD[];
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
export interface AddDementiaStage {
  DementiaStage: string;
  IsDeleted: string; // "0"
  CreatedDate: string;
  ModifiedDate: string;
  CreatedByID?: string;
  ModifiedByID?: string;
}

export interface UpdateDementiaStage {
  DementiaStage: string;

}

// =====================
// Converters
// =====================
export const convertToDementiaStageTD = (
  DementiaStageList: DementiaStage[]
): DementiaStageTD[] => {
  return DementiaStageList.map((d) => ({
    id: d.id,
    DementiaStage: d.DementiaStage,
    isDeleted: d.IsDeleted,
    createdDate: d.CreatedDate,
    modifiedDate: d.ModifiedDate,
  }));
};

// =====================
// API calls
// =====================

// // Mirrors fetchMedicalHistory style (supports pagination)
// export const fetchDementiaStage = async (
//   pageNo: number = 0,
//   pageSize: number = 10
// ): Promise<DementiaStageTDServer> => {
//   const token = retrieveAccessTokenFromCookie();
//   if (!token) throw new Error("No token found.");

//   try {
//     const response = await DementiaStageListAPI.get<ViewDementiaStageList>("", {
//       params: { pageNo, pageSize },
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const pagination = {
//       pageNo: response.data.pageNo,
//       pageSize: response.data.pageSize,
//       totalRecords: response.data.totalRecords,
//       totalPages: response.data.totalPages,
//     };

//     const rows = convertToDementiaStageTD(response.data.data);
//     return { DementiaStage: rows, pagination };
//   } catch (error) {
//     console.error("GET Medical Diagnosis List", error);
//     throw error;
//   }
// };

// If you want a simple “list only” function like your socialHistory.ts did
export const fetchDementiaStageList = async (): Promise<DementiaStage[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await dementiaStageListAPI.get<DementiaStage[]>("", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("GET DementiaStage list", response.data);
    return response.data;
  } catch (error) {
    console.error("GET DementiaStage list", error);
    throw error;
  }
};

export const createDementiaStageList = async (
  DementiaStage: string,
): Promise<DementiaStage> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {

    const response = await createDementiaStageListAPI.post("", 
        {
        DementiaStage: DementiaStage,
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

export const updateDementiaStageList = async (
  id: number,
  DementiaStage: string,
) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
  console.log(id)
  try {
    const payload: UpdateDementiaStage = {
      DementiaStage: DementiaStage,

    };

    const response = await updateDementiaStageListAPI.put(`/${id}`, payload, {
    params:{ stage_id: id},
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("PUT update DementiaStage", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update DementiaStage", error);
    throw error;
  }
};

export const deleteDementiaStageList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
    console.log(id)
  try {
    const response = await deleteDementiaStageListAPI.delete(`/${id}`, {
    params:{ stage_id: id},
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("DELETE DementiaStage", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE DementiaStage", error);
    throw error;
  }
};
