import {
  dietListAPI,
  educationListAPI,
  liveWithListAPI,
  occupationListAPI,
  petListAPI,
  religionListAPI,
  socialHistoryAPI,
} from "../apiConfig";
import { convertSocialHistoryYesNo } from "@/utils/convertToYesNo";
import { TableRowData } from "@/components/Table/DataTable";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface SocialHistory {
  isDeleted: string;
  patientId: number;
  sexuallyActive: number;
  secondHandSmoker: number;
  alcoholUse: number;
  caffeineUse: number;
  tobaccoUse: number;
  drugUse: number;
  exercise: number;
  dietListId: number;
  educationListId: number;
  liveWithListId: number;
  occupationListId: number;
  petListId: number;
  religionListId: number;
  id: number;
  dietValue: string;
  educationValue: string;
  liveWithValue: string;
  occupationValue: string;
  petValue: string;
  religionValue: string;
  createdDate: string;
  modifiedDate: string;
  createdById: string;
  modifiedById: string;
}

export interface SocialHistoryTD extends TableRowData {
  alcoholUse: string;
  caffeineUse: string;
  diet: string;
  drugUse: string;
  education: string;
  exercise: string;
  liveWith: string;
  occupation: string;
  pet: string;
  religion: string;
  secondhandSmoker: string;
  sexuallyActive: string;
  tobaccoUse: string;
}

export interface AddSocialHistory {
  isDeleted: string;
  patientId: number;
  sexuallyActive: number;
  secondHandSmoker: number;
  alcoholUse: number;
  caffeineUse: number;
  tobaccoUse: number;
  drugUse: number;
  exercise: number;
  dietListId: number;
  educationListId: number;
  liveWithListId: number;
  occupationListId: number;
  petListId: number;
  religionListId: number;
  createdDate: string;
  modifiedDate: string;
  createdById: string;
  modifiedById: string;
}

export interface UpdateSocialHistory {
  patientId: number;
  sexuallyActive: number;
  secondHandSmoker: number;
  alcoholUse: number;
  caffeineUse: number;
  tobaccoUse: number;
  drugUse: number;
  exercise: number;
  dietListId: number;
  educationListId: number;
  liveWithListId: number;
  occupationListId: number;
  petListId: number;
  religionListId: number;
  id: number;
  modifiedById: string;
  modifiedDate: string;
}

export interface SocialHistoryDDItem {
  Value: string;
  IsDeleted: string;
  Id: number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

export const convertToSocialHistoryTD = (
  socialHistory: SocialHistory
): SocialHistoryTD => {
  return {
    id: socialHistory.id,
    alcoholUse: convertSocialHistoryYesNo(socialHistory.alcoholUse),
    caffeineUse: convertSocialHistoryYesNo(socialHistory.caffeineUse),
    diet: socialHistory.dietValue.toUpperCase(),
    drugUse: convertSocialHistoryYesNo(socialHistory.drugUse),
    education: socialHistory.educationValue.toUpperCase(),
    exercise: convertSocialHistoryYesNo(socialHistory.exercise),
    liveWith: socialHistory.liveWithValue.toUpperCase(),
    occupation: socialHistory.occupationValue.toUpperCase(),
    pet: socialHistory.petValue.toUpperCase(),
    religion: socialHistory.religionValue.toUpperCase(),
    secondhandSmoker: convertSocialHistoryYesNo(socialHistory.secondHandSmoker),
    sexuallyActive: convertSocialHistoryYesNo(socialHistory.sexuallyActive),
    tobaccoUse: convertSocialHistoryYesNo(socialHistory.tobaccoUse),
  };
};

export const fetchSocialHistoryTD = async (
  patientId: number
): Promise<SocialHistoryTD> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await socialHistoryAPI.get<SocialHistory>(
      `?patient_id=${patientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET Patient Social History", response.data);
    return convertToSocialHistoryTD(response.data);
  } catch (error) {
    console.error("GET Patient Social History", error);
    throw error;
  }
};

export const fetchSocialHistory = async (
  patientId: number
): Promise<SocialHistory> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await socialHistoryAPI.get<SocialHistory>(
      `?patient_id=${patientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET Patient Social History", response.data);
    return response.data;
  } catch (error) {
    console.error("GET Patient Social History", error);
    throw error;
  }
};

export const addSocialHistory = async (
  addSocialHistory: AddSocialHistory
): Promise<SocialHistory> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await socialHistoryAPI.post<SocialHistory>(
      `/add`,
      addSocialHistory,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("POST add patient social history", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add patient social history", error);
    throw error;
  }
};

export const updateSocialHistory = async (
  updateSocialHistory: UpdateSocialHistory
): Promise<SocialHistory> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await socialHistoryAPI.put<SocialHistory>(
      `/update`,
      updateSocialHistory,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT update patient social history", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update patient social history", error);
    throw error;
  }
};

export const fetchDietList = async (): Promise<SocialHistoryDDItem[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await dietListAPI.get<SocialHistoryDDItem[]>(``, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET get diet list", response.data);
    return response.data;
  } catch (error) {
    console.error("GET get diet list", error);
    throw error;
  }
};

export const fetchEducationList = async (): Promise<SocialHistoryDDItem[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await educationListAPI.get<SocialHistoryDDItem[]>(``, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET get education list", response.data);
    return response.data;
  } catch (error) {
    console.error("GET get education list", error);
    throw error;
  }
};

export const fetchLiveWithList = async (): Promise<SocialHistoryDDItem[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await liveWithListAPI.get<SocialHistoryDDItem[]>(``, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET get live with list", response.data);
    return response.data;
  } catch (error) {
    console.error("GET get live with list", error);
    throw error;
  }
};

export const fetchOccupationList = async (): Promise<SocialHistoryDDItem[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await occupationListAPI.get<SocialHistoryDDItem[]>(``, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET get occupation list", response.data);
    return response.data;
  } catch (error) {
    console.error("GET get occupation list", error);
    throw error;
  }
};

export const fetchPetList = async (): Promise<SocialHistoryDDItem[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await petListAPI.get<SocialHistoryDDItem[]>(``, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET get pet list", response.data);
    return response.data;
  } catch (error) {
    console.error("GET get pet list", error);
    throw error;
  }
};

export const fetchReligionList = async (): Promise<SocialHistoryDDItem[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await religionListAPI.get<SocialHistoryDDItem[]>(``, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET get religion list", response.data);
    return response.data;
  } catch (error) {
    console.error("GET get religion list", error);
    throw error;
  }
};
