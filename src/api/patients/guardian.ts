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

export interface IGuardianUpdateFormData {
  active: "Y" | "N";
  firstName: string;
  lastName: string;
  preferredName?: string;
  gender: "M" | "F";
  contactNo: string;
  nric: string;
  email?: string | null;
  dateOfBirth: string;
  address: string;
  tempAddress?: string;
  status: string;
  isDeleted: string;
  guardianApplicationUserId: string | null;
  modifiedDate: string;
  ModifiedById: string;
  patientId: number;
  relationshipName: string;
}

export interface IGuardianAssignData {
  patientId: number;
  guardianId: number;
  relationshipName: string;
  CreatedById: string;
  ModifiedById: string;
}

export const fetchGuardianByNRIC = async (nric: string): Promise<IGuardian | null> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await guardianAPI.get("/GetPatientGuardianByNRIC", {
      params: { nric },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      patient_guardian: response.data.patient_guardian,
      relationshipName: response.data.patients?.[0]?.relationshipName ?? "",
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return null;
    }
    console.error("GET guardian by NRIC", error);
    throw error;
  }
};

export const assignExistingGuardian = async (data: IGuardianAssignData) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await guardianAPI.post("/assign", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("POST assign existing guardian", response.data);
    return response.data;
  } catch (error) {
    console.error("POST assign existing guardian", error);
    throw error;
  }
};

export const unassignGuardian = async (patientId: number, guardianId: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await guardianAPI.delete("/unassign", {
      params: { patient_id: patientId, guardian_id: guardianId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("DELETE unassign guardian", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE unassign guardian", error);
    throw error;
  }
};

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

export const updatePatientGuardian = async (
  guardianId: number,
  data: IGuardianUpdateFormData
) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await guardianAPI.put(
      `/update?guardian_id=${guardianId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PUT update Patient Guardian", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update Patient Guardian", error);
    throw error;
  }
};

export const deletePatientGuardian = async (guardianId: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await guardianAPI.delete(
      `/delete?guardian_id=${guardianId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("DELETE Patient Guardian", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE Patient Guardian", error);
    throw error;
  }
};
