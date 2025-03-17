import { DiagnosedDementiaTD } from "@/mocks/mockPatientDetails";
import { formatDateString } from "@/utils/formatDate";
import {
  createPatientAssignedDementiaAPI,
  deletePatientAssignedDementiaAPI,
  dementiaListAPI,
  getPatientAssignedDementiaAPI,
} from "../apiConfig";
import { AxiosError } from "axios";
import { retrieveAccessTokenFromCookie } from "../users/auth";

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

export const convertToDiagnosedDementiaTD = (
  dementiaList: DementiaType[],
  diagnosedDementias: DiagnosedDementia[]
): DiagnosedDementiaTD[] => {
  if (!Array.isArray(dementiaList)) {
    console.log("Diagnosed Dementia is not an array", dementiaList);
    return [];
  }

  if (!Array.isArray(diagnosedDementias)) {
    console.log("Diagnosed Dementia is not an array", diagnosedDementias);
    return [];
  }

  return diagnosedDementias
    .filter((dd) => dd.IsDeleted === "0")
    .map((dd) => ({
      id: dd.id,
      dementiaDate: dd.CreatedDate ? formatDateString(dd.CreatedDate) : "",
      dementiaType:
        dementiaList.find(
          (dl) => dl.DementiaTypeListId === dd.DementiaTypeListId
        )?.Value || "",
    }));
};

export const fetchDiagnosedDementia = async (
  patientId: number
): Promise<DiagnosedDementiaTD[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const dlResponse = await fetchDementiaTypeList();

    const ddResponse = await getPatientAssignedDementiaAPI.get<
      DiagnosedDementia[]
    >(`/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET all patient assigned dementia", ddResponse);

    return convertToDiagnosedDementiaTD(dlResponse, ddResponse.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response && error.response.status === 404) {
        console.warn(
          "Patient assigned dementia not found, returning empty array."
        );
        return [];
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
    const response =
      await createPatientAssignedDementiaAPI.post<DiagnosedDementia>(
        "",
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
    const response =
      await deletePatientAssignedDementiaAPI.delete<DiagnosedDementia>(
        `/${dementiaId}`,
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
