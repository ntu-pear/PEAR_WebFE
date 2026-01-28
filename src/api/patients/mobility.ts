import { formatDateString } from "@/utils/formatDate";
import { mobilityListAPI, patientMobilityAPI } from "../apiConfig";
import { AxiosError } from "axios";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { TableRowData } from "@/components/Table/DataTable";

export interface MobilityList {
  MobilityListId: number;
  IsDeleted: boolean;
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
  RecoveryDate: string | null;
  MobilityID: number;
  IsDeleted: boolean;
  CreatedDateTime: string;
  ModifiedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface ViewMobilityAidList {
  data: MobilityAid[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface MobilityAidTD extends TableRowData {
  mobilityAids: string;
  remark: string;
  condition: string;
  date: string;
  recoveryDate: string;
}

export interface MobilityAidTDServer {
  mobilityAids: MobilityAidTD[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface AddMobilityAid {
  PatientID: number;
  MobilityListId: number;
  MobilityRemarks: string;
  IsRecovered: boolean;
  CreatedById: string;
  ModifiedById: string;
  RecoveryDate: string|null;
}

export interface UpdateMobilityAid {
  MobilityRemarks: string;
  IsRecovered: boolean;
  RecoveryDate: string|null
}

export const fetchMobilityList = async (): Promise<MobilityList[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await mobilityListAPI.get<MobilityList[]>(``, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const activeMobilityList = response.data.filter((l)=>Number(l.IsDeleted)===0)
    console.log("GET Patient Mobility List", activeMobilityList);
    return activeMobilityList;
  } catch (error) {
    console.error("GET Patient Mobility List", error);
    throw error;
  }
};

export const convertToMobilityAidTD = (
  mobilityList: MobilityList[],
  viewMobilityAidList: ViewMobilityAidList
): MobilityAidTDServer => {
  if (!Array.isArray(mobilityList)) {
    console.error("mobilityList is not an array", mobilityList);
  }

  if (!Array.isArray(viewMobilityAidList.data)) {
    console.error(
      "viewMobilityAidList.data is not an array",
      viewMobilityAidList.data
    );
    return {
      mobilityAids: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    };
  }

  const mobilityAidsTransformed = viewMobilityAidList.data
    .filter((ma) => !ma.IsDeleted)
    .map((ma) => ({
      id: ma.MobilityID,
      mobilityAids:
        mobilityList
          .find((ml) => ml.MobilityListId === ma.MobilityListId)
          ?.Value?.toUpperCase() || "",
      remark: ma.MobilityRemarks,
      condition: ma.IsRecovered ? "FULLY RECOVERED" : "NOT RECOVERED",
      date: ma.CreatedDateTime ? formatDateString(ma.CreatedDateTime) : "",
      recoveryDate: ma.IsRecovered && ma.RecoveryDate? formatDateString(ma.RecoveryDate):""
    }));

  mobilityAidsTransformed.sort((a,b)=>{
    if (a.condition!=b.condition){
      return a.condition==="NOT RECOVERED"?-1:1
    }
    return (b.recoveryDate||"").localeCompare(a.recoveryDate||"")
  })

  const updatedTD = {
    mobilityAids: mobilityAidsTransformed,
    pagination: {
      pageNo: viewMobilityAidList.pageNo,
      pageSize: viewMobilityAidList.pageSize,
      totalRecords: viewMobilityAidList.totalRecords,
      totalPages: viewMobilityAidList.totalPages,
    },
  };
  console.log("convertToMobilityAidTD: ", updatedTD);

  return updatedTD;
};

export const fetchMobilityAids = async (
  patientId: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<MobilityAidTDServer> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const mobilityList = await fetchMobilityList();

    const mobilityAidsResponse =
      await patientMobilityAPI.get<ViewMobilityAidList>(
        `/Patient/${patientId}?pageNo=${pageNo}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    console.log("GET Patient Mobility Aids", mobilityAidsResponse.data);

    return convertToMobilityAidTD(mobilityList, mobilityAidsResponse.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response && error.response.status === 404) {
        console.warn("GET Patient Mobility Aids.", error);
        return {
          mobilityAids: [],
          pagination: {
            pageNo: 0,
            pageSize: 0,
            totalRecords: 0,
            totalPages: 0,
          },
        };
      }
    }
    console.error("GET Patient Mobility Aids", error);
    throw error;
  }
};

export const fetchMobilityAidById = async (
  mobiilityAidID: number
): Promise<MobilityAid> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const mobilityAidsResponse = await patientMobilityAPI.get<MobilityAid[]>(
      `/Mobility/${mobiilityAidID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return mobilityAidsResponse.data[0];
  } catch (error) {
    console.error("GET Patient Mobility Aids", error);
    throw error;
  }
};

export const addMobilityAid = async (
  addMobilityAid: AddMobilityAid
): Promise<MobilityAid> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await patientMobilityAPI.post<MobilityAid>(
      "/add",
      addMobilityAid,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
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
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await patientMobilityAPI.put<MobilityAid>(
      `/update/${mobilityAidID}`,
      updateMobilityAid,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
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
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await patientMobilityAPI.delete<MobilityAid>(
      `/delete/${mobilityAidID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("DELETE delete patient Mobility Aids", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE delete  patient mobility aids", error);
    throw error;
  }
};
