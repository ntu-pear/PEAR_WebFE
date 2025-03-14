import { DiagnosedDementiaTD } from "@/mocks/mockPatientDetails";
import { formatDateString } from "@/utils/formatDate";
import { dementiaList, getPatientAssignedDementia } from "../apiConfig";
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

export interface DementiaList {
  Value: string;
  IsDeleted: string;
  DementiaTypeListId: number;
  CreatedDate: string;
  ModifiedDate: string;
}

export const convertToDiagnosedDementiaTD = (
  dementiaList: DementiaList[],
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
    const dlResponse = await dementiaList.get<DementiaList[]>("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET all dementia List", dlResponse.data);

    const ddResponse = await getPatientAssignedDementia.get<
      DiagnosedDementia[]
    >(`/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET all patient assigned dementia", ddResponse.data);

    return convertToDiagnosedDementiaTD(dlResponse.data, ddResponse.data);
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
