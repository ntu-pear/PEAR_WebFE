import {
  createDietListAPI,
  createEducationListAPI,
  createLiveWithListAPI,
  createOccupationListAPI,
  createPetListAPI,
  createReligionListAPI,
  deleteDietListAPI,
  deleteEducationListAPI,
  deleteLiveWithListAPI,
  deleteOccupationListAPI,
  deletePetListAPI,
  deleteReligionListAPI,
  dietListAPI,
  educationListAPI,
  liveWithListAPI,
  occupationListAPI,
  petListAPI,
  religionListAPI,
  socialHistoryAPI,
  updateDietListAPI,
  updateEducationListAPI,
  updateLiveWithListAPI,
  updateOccupationListAPI,
  updatePetListAPI,
  updateReligionListAPI,
  prescriptionListAPI,
  createPrescriptionListAPI,
  deletePrescriptionListAPI,
  updatePrescriptionListAPI
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

export const createDietList = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await createDietListAPI.post(
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
    console.log("POST add diet list", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add diet list", error);
    throw error;
  }
};

export const updateDietList = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await updateDietListAPI.put(
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
    console.log("PUT update diet list", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update diet list", error);
    throw error;
  }
};

export const deleteDietList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deleteDietListAPI.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DELETE diet list", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE diet list", error);
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

export const createEducationList = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await createEducationListAPI.post(
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
    console.log("POST add education list", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add education list", error);
    throw error;
  }
};

export const updateEducationList = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await updateEducationListAPI.put(
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
    console.log("PUT update education list", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update education list", error);
    throw error;
  }
};

export const deleteEducationList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deleteEducationListAPI.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DELETE education list", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE education list", error);
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

export const createLiveWithList = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await createLiveWithListAPI.post(
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
    console.log("POST add live with list", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add live with list", error);
    throw error;
  }
};

export const updateLiveWithList = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await updateLiveWithListAPI.put(
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
    console.log("PUT update live with list", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update live with list", error);
    throw error;
  }
};

export const deleteLiveWithList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deleteLiveWithListAPI.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DELETE live with list", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE live with list", error);
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

export const createOccupationList = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await createOccupationListAPI.post(
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
    console.log("POST add occupation list", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add occupation list", error);
    throw error;
  }
};

export const updateOccupationList = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await updateOccupationListAPI.put(
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
    console.log("PUT update occupation list", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update occupation list", error);
    throw error;
  }
};

export const deleteOccupationList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deleteOccupationListAPI.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DELETE occupation list", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE occupation list", error);
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

export const createPetList = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await createPetListAPI.post(
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
    console.log("POST add pet list", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add pet list", error);
    throw error;
  }
};

export const updatePetList = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await updatePetListAPI.put(
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
    console.log("PUT update pet list", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update pet list", error);
    throw error;
  }
};

export const deletePetList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deletePetListAPI.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DELETE pet list", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE pet list", error);
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

export const createReligionList = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await createReligionListAPI.post(
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
    console.log("POST add religion list", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add religion list", error);
    throw error;
  }
};

export const updateReligionList = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await updateReligionListAPI.put(
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
    console.log("PUT update religion list", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update religion list", error);
    throw error;
  }
};

export const deleteReligionList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deleteReligionListAPI.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DELETE religion list", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE religion list", error);
    throw error;
  }
};

export const fetchPrescriptionList = async (): Promise<SocialHistoryDDItem[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await prescriptionListAPI.get("", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("GET prescription list", response.data);
    return response.data.data;
  } catch (error) {
    console.error("GET prescription list", error);
    throw error;
  }
};

export const createPrescriptionList = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const now = new Date().toISOString(); 
    const response = await createPrescriptionListAPI.post(
      "/add",  // make sure this matches your FastAPI route
      {
        Value: value,      // uppercase key matches backend schema
        IsDeleted: "0",  // boolean, not string
        CreatedDateTime: now,  // Add required field
        UpdatedDateTime: now
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("POST create prescription list", response.data);
    return response.data.data; // unwrap the returned object
  } catch (error: any) {
     console.error("POST create prescription list", error);

  throw error;
}
};


export const updatePrescriptionList = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const now = new Date().toISOString(); 
    const response = await updatePrescriptionListAPI.put(
      `/${id}`,
      { Value: value, IsDeleted: "0", UpdatedDateTime: now},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("PUT update prescription list", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update prescription list", error);
    throw error;
  }
};

export const deletePrescriptionList = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deletePrescriptionListAPI.delete(`/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("DELETE prescription list", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE prescription list", error);
    throw error;
  }
};

