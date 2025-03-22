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
import { TableRowData } from "@/components/Table/DataTable";

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

export interface ViewAllergyTypeList {
  data: AllergyType[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ViewAllergyReactionTypeList {
  data: AllergyReactionType[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ViewAllergyList {
  data: Allergy[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface AllergyTD extends TableRowData {
  allergicTo: string;
  reaction: string;
  notes: string;
}

export interface AllergyTDServer {
  allergies: AllergyTD[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
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

export const convertToAllergyTD = (
  viewAllergyList: ViewAllergyList
): AllergyTDServer => {
  if (!Array.isArray(viewAllergyList.data)) {
    console.log("viewAllergyList.data is not an array", viewAllergyList.data);
    return {
      allergies: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    };
  }
  const allergiesTransformed = viewAllergyList.data
    .filter((a) => a.IsDeleted === "0")
    .map((a) => ({
      id: a.Patient_AllergyID,
      allergicTo: a.AllergyTypeValue?.toUpperCase(),
      reaction: a.AllergyReactionTypeValue?.toUpperCase(),
      notes: a.AllergyRemarks || "",
    }));

  const updatedTD = {
    allergies: allergiesTransformed,
    pagination: {
      pageNo: viewAllergyList.pageNo,
      pageSize: viewAllergyList.pageSize,
      totalRecords: viewAllergyList.totalRecords,
      totalPages: viewAllergyList.totalPages,
    },
  };

  return updatedTD;
};

export const convertToAllergyAutoFill = (
  allergyTD: AllergyTD,
  viewAllergyTypeList: ViewAllergyTypeList,
  ViewAllergyReactionTypeList: ViewAllergyReactionTypeList
): AllergyAutoFill => {
  if (!Array.isArray(viewAllergyTypeList.data)) {
    console.error(
      "viewAllergyTypeList.data is not an array",
      viewAllergyTypeList.data
    );
  }

  if (!Array.isArray(ViewAllergyReactionTypeList.data)) {
    console.error(
      "ViewAllergyReactionTypeList.data is not an array",
      ViewAllergyReactionTypeList.data
    );
  }

  return {
    AllergyRemarks: allergyTD.notes,
    AllergyTypeID: viewAllergyTypeList.data.find(
      (at) => at.Value.toUpperCase() === allergyTD?.allergicTo.toUpperCase()
    )?.AllergyTypeID,
    AllergyReactionTypeID: ViewAllergyReactionTypeList.data.find(
      (art) => art.Value.toUpperCase() === allergyTD?.reaction.toUpperCase()
    )?.AllergyReactionTypeID,
  };
};

export const fetchPatientAllergy = async (
  patient_id: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<AllergyTDServer> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await patientAllergyAPI.get<ViewAllergyList>(
      `/${patient_id}?pageNo=${pageNo}&pageSize=${pageSize}`,
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
        return {
          allergies: [],
          pagination: {
            pageNo: 0,
            pageSize: 0,
            totalRecords: 0,
            totalPages: 0,
          },
        };
      }
      console.error("Get Patient Allergy", error);
    }
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

    const filteredR1 = r1.allergies.filter((p) => p.id === allergy_id)[0];
    return convertToAllergyAutoFill(filteredR1, r2, r3);
  } catch (error) {
    console.error("Get Patient Allergy", error);
    throw error;
  }
};

export const fetchAllAllergyTypes = async (
  pageNo: number = 0,
  pageSize: number = 25
): Promise<ViewAllergyTypeList> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await allergyTypeAPI.get<ViewAllergyTypeList>(
      `?pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET all Allergy Reaction Types", response.data.data);
    return response.data;
  } catch (error) {
    console.error("GET all Allergy Reaction Types", error);
    throw error;
  }
};

export const fetchAllAllergyReactionTypes = async (
  pageNo: number = 0,
  pageSize: number = 25
): Promise<ViewAllergyReactionTypeList> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response =
      await allergyReactionTypeAPI.get<ViewAllergyReactionTypeList>(
        `?pageNo=${pageNo}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    console.log("GET all Allergy Reaction Types", response.data);
    return response.data;
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
