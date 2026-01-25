import { guardianAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface IGuardian {
  patient_guardian: {
    id: number;
    active: "Y" | "N";
    firstName: string;
    lastName: string;
    preferredName?: string;
    gender: "M" | "F";
    contactNo: string;
    nric: string;
    email: string;
    dateOfBirth: string;
    address: string;
    tempAddress?: string;
    status: string;
    isDeleted: string;
    guardianApplicationUserId: string | null;
    createdDate: string;
    modifiedDate: string;
    CreatedById: string;
    ModifiedById: string;
  };
  relationshipName: string;
}

export interface IGuardianFormData {
  active: "Y" | "N";
  firstName: string;
  lastName: string;
  preferredName?: string;
  gender: "M" | "F";
  contactNo: string;
  nric: string;
  email?: string|null;
  dateOfBirth: string;
  address: string;
  tempAddress?: string;
  status: string;
  isDeleted: string;
  guardianApplicationUserId: string | null;
  createdDate: string;
  modifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
  patientId: number;
  relationshipName: string;
}

export const fetchGuardianByPatientId = async (patientId: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await guardianAPI.get("/GetPatientGuardianByPatientId", {
      params: { patient_id: patientId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("GET guardians by patientId", response.data);
    return response.data.patient_guardians;
  } catch (error) {
    console.error("GET guardians by patientId", error);
    throw error;
  }
};

export const addPatientGuardian = async (data: IGuardianFormData) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await guardianAPI.post("/add", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("POST add Patient Guardian", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add Patient Guardian", error);
    throw error;
  }
};
