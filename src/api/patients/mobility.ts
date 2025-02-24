import { MobilityAidTD } from "@/mocks/mockPatientDetails";
import { formatDateString } from "@/utils/formatDate";
import { mobilityListAPI, patientMobilityAPI } from "../apiConfig";

export interface MobilityList {
  MobilityListId: number;
  IsDeleted: number;
  CreatedDateTime: string;
  ModifiedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
  Value: string;
}

export interface MobilityAid {
  PatientID: number;
  MobilityListId: number;
  MobilityRemarks: string;
  IsRecovered: boolean;
  MobilityID: number;
  IsDeleted: number;
  CreatedDateTime: string;
  ModifiedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface AddMobilityAid {
  PatientID: number;
  MobilityListId: number;
  MobilityRemarks: string;
  IsRecovered: boolean;
  CreatedById: string;
  ModifiedById: string;
}

export interface UpdateMobilityAid {
  MobilityRemarks: string;
  IsRecovered: boolean;
}

export const fetchMobilityList = async (): Promise<MobilityList[]> => {
  try {
    const response = await mobilityListAPI.get<MobilityList[]>(``);

    console.log("GET Patient Mobility List", response.data);
    return response.data;
  } catch (error) {
    console.error("GET Patient Mobility List", error);
    throw error;
  }
};

export const convertToMobilityAidTD = (
  mobilityList: MobilityList[],
  mobilityAids: MobilityAid[]
): MobilityAidTD[] => {
  if (!Array.isArray(mobilityList)) {
    console.error("mobilityList is not an array", mobilityList);
    return [];
  }
  if (!Array.isArray(mobilityAids)) {
    console.error("mobilityAids is not an array", mobilityAids);
    return [];
  }

  return mobilityAids
    .filter((ma) => ma.IsDeleted === 0)
    .sort((a, b) => b.MobilityID - a.MobilityID) // Descending order
    .map((ma) => ({
      id: ma.MobilityID,
      mobilityAids:
        mobilityList
          .find((ml) => ml.MobilityListId === ma.MobilityListId)
          ?.Value?.toUpperCase() || "",
      remark: ma.MobilityRemarks,
      condition: ma.IsRecovered ? "FULLY RECOVERED" : "NOT RECOVERED",
      date: ma.CreatedDateTime ? formatDateString(ma.CreatedDateTime) : "",
    }));
};

export const fetchMobilityAids = async (
  patientId: number
): Promise<MobilityAidTD[]> => {
  try {
    const mobilityList = await fetchMobilityList();

    const mobilityAidsResponse = await patientMobilityAPI.get<MobilityAid[]>(
      `/${patientId}`
    );
    console.log("GET Patient Mobility Aids", mobilityAidsResponse.data);

    return convertToMobilityAidTD(
      mobilityList,
      [mobilityAidsResponse.data].flat()
    );
  } catch (error) {
    console.error("GET Patient Mobility Aids", error);
    throw error;
  }
};

export const fetchMobilityAidById = async (
  mobiilityAidID: number
): Promise<MobilityAid> => {
  try {
    const mobilityAidsResponse = await patientMobilityAPI.get<MobilityAid>(
      `/${mobiilityAidID}`
    );
    console.log("GET Patient Mobility Aids", mobilityAidsResponse.data);

    return mobilityAidsResponse.data;
  } catch (error) {
    console.error("GET Patient Mobility Aids", error);
    throw error;
  }
};

export const addMobilityAid = async (
  addMobilityAid: AddMobilityAid
): Promise<MobilityAid> => {
  try {
    const response = await patientMobilityAPI.post<MobilityAid>(
      "",
      addMobilityAid
    );
    console.log("GET Patient Mobility Aids", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add patient mobility aids", error);
    throw error;
  }
};

export const updateMobilityAid = async (
  mobilityAidID: number,
  updateMobilityAid: UpdateMobilityAid
): Promise<MobilityAid> => {
  try {
    const response = await patientMobilityAPI.put<MobilityAid>(
      `/${mobilityAidID}`,
      updateMobilityAid
    );
    console.log("PUT update patient Mobility Aids", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update patient mobility aids", error);
    throw error;
  }
};

export const deleteMobilityAid = async (
  mobilityAidID: number
): Promise<MobilityAid> => {
  try {
    const response = await patientMobilityAPI.delete<MobilityAid>(
      `/${mobilityAidID}`
    );
    console.log("DELETE delete patient Mobility Aids", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE delete  patient mobility aids", error);
    throw error;
  }
};
