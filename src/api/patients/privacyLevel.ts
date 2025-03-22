import {
  getPatientPrivacyLevelAPI,
  writePatientPrivacyLevelAPI,
} from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface PatientPrivacyLevel {
  privacyLevelSensitive: number;
  patientId: number;
  active: boolean;
  createdById: string;
  modifiedById: string;
  createdDate: string;
  modifiedDate: string;
}

export interface AddPatientPrivacyLevel {
  privacyLevelSensitive: number;
  active: boolean;
  createdById: string;
  modifiedById: string;
  createdDate: string;
  modifiedDate: string;
}

export interface UpdatePatientPrivacyLevel {
  privacyLevelSensitive: number;
  active: boolean;
  modifiedById: string;
  modifiedDate: string;
}

export const fetchPatientPrivacyLevel = async (
  patientId: number
): Promise<PatientPrivacyLevel> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await getPatientPrivacyLevelAPI.get<PatientPrivacyLevel>(
      `/${patientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET Patient Privacy Level", response.data);
    return response.data;
  } catch (error) {
    console.error("GET Patient Privacy Level", error);
    throw error;
  }
};

export const addPatientPrivacyLevel = async (
  patientId: number,
  addPatientPrivacyLevel: AddPatientPrivacyLevel
): Promise<PatientPrivacyLevel> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response =
      await writePatientPrivacyLevelAPI.post<PatientPrivacyLevel>(
        `/add?patient_id=${patientId}`,
        addPatientPrivacyLevel,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    console.log("POST Patient Privacy Level", response.data);
    return response.data;
  } catch (error) {
    console.error("POST Patient Privacy Level", error);
    throw error;
  }
};

export const updatePatientPrivacyLevel = async (
  patientId: number,
  updatePatientPrivacyLevel: UpdatePatientPrivacyLevel
): Promise<PatientPrivacyLevel> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await writePatientPrivacyLevelAPI.put<PatientPrivacyLevel>(
      `/update/${patientId}`,
      updatePatientPrivacyLevel,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("POST Patient Privacy Level", response.data);
    return response.data;
  } catch (error) {
    console.error("POST Patient Privacy Level", error);
    throw error;
  }
};
