import { AllergyTD } from "@/mocks/mockPatientDetails";
import {
  allergyReactionTypeAPI,
  allergyTypeAPI,
  createPatientAllergyAPI,
  deletePatientAllergyAPI,
  patientAllergyAPI,
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

export interface AllergyFormData {
  AllergyRemarks: string;
  IsDeleted: string;
  PatientID: number;
  AllergyTypeID: number;
  AllergyReactionTypeID: number;
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
  PatientID?: number;
  AllergyTypeID: number;
  AllergyReactionTypeID: number;
  CreatedById?: string;
  ModifiedById?: string;
}

export const convertToAllergyTD = (allergies: Allergy[]): AllergyTD[] => {
  if (!Array.isArray(allergies)) {
    console.log("allergies is not an array", allergies);
    return [];
  }

  return allergies
    .filter((a) => a.IsDeleted === "0")
    .sort((a, b) => b.Patient_AllergyID - a.Patient_AllergyID) // Descending order
    .map((a) => ({
      id: a.Patient_AllergyID,
      allergicTo: a.AllergyTypeValue?.toUpperCase(),
      reaction: a.AllergyReactionTypeValue?.toUpperCase(),
      notes: a.AllergyRemarks || "",
    }));
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
        console.warn("GET all dementia List/ patient assigned dementia", error);
        return [];
      }
    }
    console.error("GET all dementia List/ patient assigned dementia", error);
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

// not working atm, backend api does not update isDeleted to 1'
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
