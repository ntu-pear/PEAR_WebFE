import { patientsAPI } from "../apiConfig";
import { formatDateString } from "@/utils/formatDate";
import {
  PatientInformation,
  mockPreferredLanguageList,
} from "@/mocks/mockPatientDetails";
import { convertToYesNo } from "@/utils/convertToYesNo";
import { TableRowData } from "@/components/Table/DataTable";

export interface PatientBase {
  name: string;
  nric: string;
  address: string;
  tempAddress?: string;
  homeNo?: string;
  handphoneNo?: string;
  gender: string;
  dateOfBirth: string;
  guardianId?: number;
  isApproved?: string;
  preferredName?: string;
  preferredLanguageId?: number;
  updateBit: string;
  autoGame: string;
  startDate: string;
  endDate?: string;
  isActive: string;
  isRespiteCare: string;
  privacyLevel: number;
  terminationReason?: string;
  inActiveReason?: string;
  inActiveDate?: string;
  profilePicture?: string;
  isDeleted: number;
  id: number;
  createdDate: string;
  modifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface ViewPatientList {
  data: PatientBase[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ViewPatient {
  data: PatientBase;
}

// patient table data base
export interface PatientTableData extends TableRowData {
  name: string;
  preferredName: string;
  nric: string;
  status: string;
  startDate: string;
  endDate: string;
  inactiveDate: string;
  supervisorId: number;
  image?: string;
}

// patient table data server pagination
export interface PatientTableDataServer {
  patients: PatientTableData[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

const convertToPatientTDServer = (
  patientPagination: ViewPatientList
): PatientTableDataServer => {
  if (!Array.isArray(patientPagination.data)) {
    console.error("patients is not an array", patientPagination.data);
    return {
      patients: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    }; // Return default pagination values
  }

  const patientsTransformed = patientPagination.data
    .filter((p) => !p.isDeleted)
    .map((p) => ({
      id: p.id,
      name: p.name?.toUpperCase(),
      preferredName: p.preferredName ? p.preferredName?.toUpperCase() : "",
      nric: p.nric?.toUpperCase(),
      status: parseInt(p.isActive) > 0 ? "Active" : "Inactive",
      startDate: p.startDate ? formatDateString(p.startDate) : "",
      endDate: p.endDate ? formatDateString(p.endDate) : "",
      inactiveDate: p.inActiveDate ? formatDateString(p.inActiveDate) : "",
      supervisorId: 2,
      image: p.profilePicture,
    }));

  const UpdatedTD = {
    patients: patientsTransformed,
    pagination: {
      pageNo: patientPagination.pageNo,
      pageSize: patientPagination.pageSize,
      totalRecords: patientPagination.totalRecords,
      totalPages: patientPagination.totalPages,
    },
  };
  console.log("convertToPatientTDServer: ", UpdatedTD);

  return UpdatedTD;
};

const toUpperCasePatient = (patient: PatientBase): PatientBase => {
  return {
    name: patient.name?.toUpperCase() || "",
    nric: patient.nric?.toUpperCase() || "",
    address: patient.address?.toUpperCase() || "",
    tempAddress: patient.tempAddress?.toUpperCase() || "",
    homeNo: patient.homeNo,
    handphoneNo: patient.handphoneNo,
    gender: patient.gender?.toUpperCase() || "",
    dateOfBirth: patient.dateOfBirth,
    guardianId: patient.guardianId,
    isApproved: patient.isApproved,
    preferredName: patient.preferredName?.toUpperCase() || "",
    preferredLanguageId: patient.preferredLanguageId,
    updateBit: patient.updateBit,
    autoGame: patient.autoGame,
    startDate: patient.startDate,
    endDate: patient.endDate,
    isActive: patient.isActive,
    isRespiteCare: patient.isRespiteCare,
    privacyLevel: patient.privacyLevel,
    terminationReason: patient.terminationReason?.toUpperCase() || "",
    inActiveReason: patient.inActiveReason?.toUpperCase() || "",
    inActiveDate: patient.inActiveDate,
    profilePicture: patient.profilePicture,
    isDeleted: patient.isDeleted,
    id: patient.id,
    createdDate: patient.createdDate,
    modifiedDate: patient.modifiedDate,
    CreatedById: patient.CreatedById,
    ModifiedById: patient.ModifiedById,
  };
};

//Get All Patients with skip and limit
export const fetchAllPatientTD = async (
  pageNo: number = 0,
  pageSize: number = 10
): Promise<PatientTableDataServer> => {
  try {
    const response = await patientsAPI.get<ViewPatientList>(
      `?mask=true&pageNo=${pageNo}&pageSize=${pageSize}`
    );
    console.log("GET all Patients", response.data);
    return convertToPatientTDServer(response.data);
  } catch (error) {
    console.error("GET all Patients", error);
    throw error;
  }
};

// for edit patient modal
export const fetchPatientById = async (
  id: number,
  isNRICMasked: boolean = false
): Promise<PatientBase> => {
  try {
    const response = await patientsAPI.get<ViewPatient>(
      `/${id}?mask=${isNRICMasked}`
    );
    console.log("GET Patient", response.data.data);
    return toUpperCasePatient(response.data.data);
  } catch (error) {
    console.error("GET Patient", error);
    throw error;
  }
};

//for patient info card
export const fetchPatientInfo = async (
  id: number
): Promise<PatientInformation> => {
  try {
    const response = await patientsAPI.get<ViewPatient>(`/${id}`);
    const p = response.data.data;
    console.log("GET Patient Info", p);
    return {
      id: id,
      name: p.name?.toUpperCase(),
      preferredName: p.preferredName?.toUpperCase() || "-",
      nric: p.nric?.toUpperCase(),
      dateOfBirth: p.dateOfBirth ? formatDateString(p.dateOfBirth) : "-",
      gender:
        p.gender?.toUpperCase() === "F"
          ? "FEMALE"
          : p.gender?.toUpperCase() === "M"
          ? "MALE"
          : "",
      address: p.address?.toUpperCase(),
      tempAddress: p.tempAddress?.toUpperCase() || "-",
      homeNo: p.homeNo || "-",
      handphoneNo: p.handphoneNo || "-",
      preferredLanguage:
        mockPreferredLanguageList
          .find((pl) => pl.id === p.preferredLanguageId)
          ?.value.toUpperCase() || "-",
      privacyLevel: p.privacyLevel,
      underRespiteCare: convertToYesNo(p.isRespiteCare),
      startDate: p.startDate ? formatDateString(p.startDate) : "",
      endDate: p.endDate ? formatDateString(p.endDate) : "",
      inactiveDate: p.inActiveDate ? formatDateString(p.inActiveDate) : "-",
      profilePicture: p.profilePicture || "",
    };
  } catch (error) {
    console.error("GET Patient Info", error);
    throw error;
  }
};

//toggle for nric in patient info card
export const fetchPatientNRIC = async (
  id: number,
  isNRICMasked: boolean
): Promise<string> => {
  const response = await patientsAPI.get<ViewPatient>(
    `/${id}?mask=${isNRICMasked}`
  );
  const nric = response.data?.data?.nric;
  console.log("GET Patient NRIC", nric);

  return nric?.toUpperCase();
};

export const updatePatient = async (
  id: number,
  patient: PatientBase
): Promise<ViewPatient> => {
  try {
    const response = await patientsAPI.put<ViewPatient>(
      `/update/${id}`,
      patient
    );
    console.log("PUT update Patient Info", response.data.data);
    return response.data;
  } catch (error) {
    console.error("PUT update Patient Info", error);
    throw error;
  }
};

export const updatePatientProfilePhoto = async (
  patientId: number,
  formData: FormData
): Promise<ViewPatient> => {
  try {
    const response = await patientsAPI.put<ViewPatient>(
      `/update/${patientId}/update_patient_profile_picture`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("PUT update Patient Profile Photo", response.data.data);
    return response.data;
  } catch (error) {
    console.error("PUT update Patient Profile Photo", error);
    throw error;
  }
};

export const deletePatientProfilePhoto = async (patientId: number) => {
  console.log(patientId);
};
