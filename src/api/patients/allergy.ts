import { AllergyTD } from "@/mocks/mockPatientDetails";
import {
  allergyReactionTypeAPI,
  allergyTypeAPI,
  createPatientAllergyAPI,
  deletePatientAllergyAPI,
  patientAllergyAPI,
  updatePatientAllergyAPI,
} from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { AxiosError } from "axios";

export interface Allergy {
  AllergyRemarks: string;
  IsDeleted: string;
  Patient_AllergyID: number;
  PatientID: number;
  AllergyTypeValue: string;
  AllergyReactionTypeValue: string;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface AllergyType {
  Value: string;
  IsDeleted: string;
  AllergyTypeID: number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
}

export interface AllergyReactionType {
  Value: string;
  IsDeleted: string;
  AllergyReactionTypeID: number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface AllergyAutoFill {
  AllergyRemarks?: string;
  AllergyTypeID?: number;
  AllergyReactionTypeID?: number;
}

export interface AllergyAddFormData {
  AllergyRemarks: string;
  IsDeleted: string;
  PatientID?: number;
  AllergyTypeID: number;
  AllergyReactionTypeID: number;
  CreatedById?: string;
  ModifiedById?: string;
}

export interface AllergyUpdateFormData {
  AllergyRemarks: string;
  IsDeleted: string;
  Patient_AllergyID: number;
  AllergyTypeID: number;
  AllergyReactionTypeID: number;
}

export const convertToAllergyTD = (allergies: Allergy[]): AllergyTD[] => {
  if (!Array.isArray(allergies)) {
    console.log("allergies is not an array", allergies);
    return [];
  }

  return allergies
    .filter((a) => a.IsDeleted === "0")
    .map((a) => ({
      id: a.Patient_AllergyID,
      allergicTo: a.AllergyTypeValue?.toUpperCase(),
      reaction: a.AllergyReactionTypeValue?.toUpperCase(),
      notes: a.AllergyRemarks || "",
    }));
};

export const convertToAllergyAutoFill = (
  allergyTD: AllergyTD,
  allergyTypes: AllergyType[],
  allergyReactionTypes: AllergyReactionType[]
): AllergyAutoFill => {
  if (!Array.isArray(allergyTypes)) {
    console.error("allergyTypes is not an array", allergyTypes);
  }

  if (!Array.isArray(allergyReactionTypes)) {
    console.error("allergyReactionType is not an array", allergyReactionTypes);
  }

  return {
    AllergyRemarks: allergyTD.notes,
    AllergyTypeID: allergyTypes.find(
      (at) => at.Value.toUpperCase() === allergyTD?.allergicTo.toUpperCase()
    )?.AllergyTypeID,
    AllergyReactionTypeID: allergyReactionTypes.find(
      (art) => art.Value.toUpperCase() === allergyTD?.reaction.toUpperCase()
    )?.AllergyReactionTypeID,
  };
};

export const fetchPatientAllergy = async (
  patient_id: number
): Promise<AllergyTD[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await patientAllergyAPI.get<Allergy[]>(
      `/${patient_id}?require_auth=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET Patient Allergy", response.data);
    return convertToAllergyTD(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response && error.response.status === 404) {
        console.warn("Get Patient Allergy", error);
        return [];
      }
    }
    console.error("Get Patient Allergy", error);
    throw error;
  }
};

export const fetchPatientAllergyById = async (
  patient_id: number,
  allergy_id: number
): Promise<AllergyAutoFill> => {
  try {
    const r1 = await fetchPatientAllergy(patient_id);
    const r2 = await fetchAllAllergyTypes();
    const r3 = await fetchAllAllergyReactionTypes();

    const filteredR1 = r1.filter((p) => p.id === allergy_id)[0];
    return convertToAllergyAutoFill(filteredR1, r2, r3);
  } catch (error) {
    console.error("Get Patient Allergy", error);
    throw error;
  }
};

export const fetchAllAllergyTypes = async (): Promise<AllergyType[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await allergyTypeAPI.get<AllergyType[]>("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET all Allergy Reaction Types", response.data);
    return response.data?.sort((a, b) => a.Value.localeCompare(b.Value));
  } catch (error) {
    console.error("GET all Allergy Reaction Types", error);
    throw error;
  }
};

export const fetchAllAllergyReactionTypes = async (): Promise<
  AllergyReactionType[]
> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await allergyReactionTypeAPI.get<AllergyReactionType[]>(
      "",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET all Allergy Reaction Types", response.data);
    return response.data?.sort((a, b) => a.Value.localeCompare(b.Value));
  } catch (error) {
    console.error("GET all Allergy Reaction Types", error);
    throw error;
  }
};

export const addPatientAllergy = async (
  formData: AllergyAddFormData
): Promise<Allergy> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await createPatientAllergyAPI.post<Allergy>("", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("POST add patient allergy", response.data);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("POST add patient allergy", error);
    if (error.response) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
};

export const updatePatientAllergy = async (
  patientId: number,
  formData: AllergyUpdateFormData
): Promise<Allergy> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await updatePatientAllergyAPI.put<Allergy>(
      `/${patientId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT update patient allergy", response.data);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
};

export const deletePatientAllergy = async (
  patient_allergy_id: number
): Promise<Allergy> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await deletePatientAllergyAPI.delete<Allergy>(
      `/${patient_allergy_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("DELETE delete patient allergy", response.data);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("DELETE delete patient allergy", error);
    if (error.response) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
};
