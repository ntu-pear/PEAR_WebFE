// src/api/patients/problem.ts
import { TableRowData } from "@/components/Table/DataTable";
import {
  problemListAPI,
  createProblemListAPI,
  updateProblemListAPI,
  deleteProblemListAPI,
} from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

// =====================
// Raw server models
// =====================
export interface Problem {
  Id: number;
  ProblemName: string;
  IsDeleted: string; // "0" | "1"
  CreatedDate: string;
  ModifiedDate: string;
  CreatedByID: string;
  ModifiedByID: string;
}

export interface ViewProblemList {
  data: Problem[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// =====================
// Table model
// =====================
export interface ProblemTD extends TableRowData {
  problemName: string;
  isDeleted: string; // "0" | "1"
  createdDate: string;
  modifiedDate: string;
}

// Useful if you want pagination similar to MedicalHistoryTDServer
export interface ProblemTDServer {
  Problem: ProblemTD[];
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
export interface AddProblem {
  ProblemName: string;
  IsDeleted: string; // "0"
  CreatedDate: string;
  ModifiedDate: string;
  CreatedByID?: string;
  ModifiedByID?: string;
}

export interface UpdateProblem {
  ProblemName: string;

}

// =====================
// Converters
// =====================
export const convertToProblemTD = (
  ProblemList: Problem[]
): ProblemTD[] => {
  return ProblemList.map((d) => ({
    id: d.Id,
    problemName: d.ProblemName,
    isDeleted: d.IsDeleted,
    createdDate: d.CreatedDate,
    modifiedDate: d.ModifiedDate,
  }));
};

// =====================
// API calls
// =====================

// // Mirrors fetchMedicalHistory style (supports pagination)
// export const fetchProblem = async (
//   pageNo: number = 0,
//   pageSize: number = 10
// ): Promise<ProblemTDServer> => {
//   const token = retrieveAccessTokenFromCookie();
//   if (!token) throw new Error("No token found.");

//   try {
//     const response = await ProblemListAPI.get<ViewProblemList>("", {
//       params: { pageNo, pageSize },
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const pagination = {
//       pageNo: response.data.pageNo,
//       pageSize: response.data.pageSize,
//       totalRecords: response.data.totalRecords,
//       totalPages: response.data.totalPages,
//     };

//     const rows = convertToProblemTD(response.data.data);
//     return { Problem: rows, pagination };
//   } catch (error) {
//     console.error("GET Medical Diagnosis List", error);
//     throw error;
//   }
// };

// If you want a simple “list only” function like your socialHistory.ts did
export const fetchProblemList = async (): Promise<Problem[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await problemListAPI.get<ViewProblemList>("", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("GET problem list", response.data);
    return response.data.data;
  } catch (error) {
    console.error("GET problem list", error);
    throw error;
  }
};

export const createProblemList = async (
  problemName: string,
): Promise<Problem> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {

    const response = await createProblemListAPI.post("", 
        {
        ProblemName: problemName,
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

export const updateProblemList = async (
  id: number,
  problemName: string,
) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
  console.log(id)
  try {
    const payload: UpdateProblem = {
      ProblemName: problemName,

    };

    const response = await updateProblemListAPI.put(`/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("PUT update problem", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update problem", error);
    throw error;
  }
};

export const deleteProblemList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deleteProblemListAPI.delete(`/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("DELETE problem", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE problem", error);
    throw error;
  }
};
