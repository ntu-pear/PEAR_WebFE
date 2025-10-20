import { formatDateString } from "@/utils/formatDate";
import { dementiaListAPI, patientAssignedDementiaAPI } from "../apiConfig";
import { AxiosError } from "axios";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { TableRowData } from "@/components/Table/DataTable";

export interface DiagnosedDementia {
  IsDeleted: string;
  PatientId: number;
  DementiaTypeListId: number;
  id: number;
  CreatedDate: string;
  ModifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface DementiaType {
  Value: string;
  IsDeleted: string;
  DementiaTypeListId: number;
  CreatedDate: string;
  ModifiedDate: string;
}

export interface ViewDiagnosedDementiaList {
  data: DiagnosedDementia[];
  pageNo: 0;
  pageSize: 0;
  totalRecords: 0;
  totalPages: 0;
}

export interface DiagnosedDementiaTD extends TableRowData {
  dementiaType: string;
  dementiaDate: string;
}

export interface DiagnosedDementiaTDServer {
  diagnosedDementias: DiagnosedDementiaTD[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface AddDementiaForm {
  IsDeleted: string;
  PatientId: number;
  DementiaTypeListId: number;
  CreatedDate: string;
  ModifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

export const fetchDementiaTypeList = async (): Promise<DementiaType[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
  try {
    const response = await dementiaListAPI.get<DementiaType[]>("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET all dementia Type List", response.data);

    return response.data;
  } catch (error) {
    console.error("GET all dementia Type List", error);
    throw error;
  }
};

export const addDementiaType = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
  try {
    const response = await dementiaListAPI.post(
      "",
      {
        Value: value,
        IsDeleted: "0",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("POST add dementia Type", response.data);

    return response.data;
  } catch (error) {
    console.error("POST add dementia Type", error);
    throw error;
  }
};

export const updateDementiaType = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
  try {
    const response = await dementiaListAPI.put(
      `/${id}`,
      {
        Value: value,
        IsDeleted: "0",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT update dementia Type", response.data);

    return response.data;
  } catch (error) {
    console.error("PUT update dementia Type", error);
    throw error;
  }
};

export const deleteDementiaType = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
  try {
    const response = await dementiaListAPI.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DELETE dementia Type", response.data);

    return response.data;
  } catch (error) {
    console.error("DELETE dementia Type", error);
    throw error;
  }
};

export const convertToDiagnosedDementiaTD = (
  dementiaList: DementiaType[],
  viewDiagnosedDementiaList: ViewDiagnosedDementiaList
): DiagnosedDementiaTDServer => {
  if (!Array.isArray(dementiaList)) {
    console.log("Diagnosed Dementia is not an array", dementiaList);
  }

  if (!Array.isArray(viewDiagnosedDementiaList.data)) {
    console.log(
      "Diagnosed Dementia is not an array",
      viewDiagnosedDementiaList.data
    );
    return {
      diagnosedDementias: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    };
  }

  const diagnosedDementiaTransformed = viewDiagnosedDementiaList.data
    .filter((dd) => dd.IsDeleted === "0")
    .map((dd) => ({
      id: dd.id,
      dementiaDate: dd.CreatedDate ? formatDateString(dd.CreatedDate) : "",
      dementiaType:
        dementiaList.find(
          (dl) => dl.DementiaTypeListId === dd.DementiaTypeListId
        )?.Value || "",
    }));

  const updatedTD = {
    diagnosedDementias: diagnosedDementiaTransformed,
    pagination: {
      pageNo: viewDiagnosedDementiaList.pageNo,
      pageSize: viewDiagnosedDementiaList.pageSize,
      totalRecords: viewDiagnosedDementiaList.totalRecords,
      totalPages: viewDiagnosedDementiaList.totalPages,
    },
  };

  return updatedTD;
};

export const fetchDiagnosedDementia = async (
  patientId: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<DiagnosedDementiaTDServer> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const dlResponse = await fetchDementiaTypeList();

    const ddResponse =
      await patientAssignedDementiaAPI.get<ViewDiagnosedDementiaList>(
        `/Patient/${patientId}?pageNo=${pageNo}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    console.log("GET all patient assigned dementia", ddResponse);

    return convertToDiagnosedDementiaTD(dlResponse, ddResponse.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response && error.response.status === 404) {
        console.warn(
          "Patient assigned dementia not found, returning empty array."
        );
        return {
          diagnosedDementias: [],
          pagination: {
            pageNo: 0,
            pageSize: 0,
            totalRecords: 0,
            totalPages: 0,
          },
        };
      }
    }
    console.error("GET all dementia List/ patient assigned dementia", error);
    throw error;
  }
};

export const addDiagnosedDementa = async (
  formData: AddDementiaForm
): Promise<DiagnosedDementia> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await patientAssignedDementiaAPI.post<DiagnosedDementia>(
      "/add",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("POST add diagnosed dementia", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add diagnosed dementia", error);
    throw error;
  }
};

export const deleteDiagnosedDementa = async (
  dementiaId: number
): Promise<DiagnosedDementia> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await patientAssignedDementiaAPI.delete<DiagnosedDementia>(
      `/delete/${dementiaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Delete delete diagnosed dementia", response.data);
    return response.data;
  } catch (error) {
    console.error("Delete delete diagnosed dementia", error);
    throw error;
  }
};
