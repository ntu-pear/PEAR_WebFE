import { vitalAPI } from "../apiConfig";
import { formatDateString, formatTimeString } from "@/utils/formatDate";
import { convertToYesNo } from "@/utils/convertToYesNo";
import { TableRowData } from "@/components/Table/DataTable";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface VitalCheckBase {
  IsDeleted: string;
  PatientId: number;
  IsAfterMeal: string;
  Temperature: number;
  SystolicBP: number;
  DiastolicBP: number;
  HeartRate: number;
  SpO2: number;
  BloodSugarLevel: number;
  Height: number;
  Weight: number;
  VitalRemarks?: string;
  Id: number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

// vital response body format from api
export interface ViewVitalCheckList {
  data: VitalCheckBase[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ViewVitalCheck {
  data: VitalCheckBase;
}

// vital table data base
export interface VitalCheckTD extends TableRowData {
  patientId: number;
  date: string;
  time: string;
  temperature: number;
  weight: number;
  height: number;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  spO2: number;
  bloodSugarLevel: number;
  afterMeal: string;
  remark: string;
}

// vital table data with server pagination
export interface VitalCheckTDServer {
  vitals: VitalCheckTD[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface VitalFormData {
  PatientId?: number;
  IsAfterMeal: string;
  Temperature: number;
  SystolicBP: number;
  DiastolicBP: number;
  HeartRate: number;
  SpO2: number;
  BloodSugarLevel: number;
  Height: number;
  Weight: number;
  VitalRemarks?: string;
  CreatedById?: string;
  ModifiedById?: string;
}

const convertToVitalTDServer = (
  viewVitalCheck: ViewVitalCheckList
): VitalCheckTDServer => {
  if (!Array.isArray(viewVitalCheck.data)) {
    console.error("viewVitalCheck is not an array", viewVitalCheck.data);
    return {
      vitals: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    };
  }
  const vitalsTransformed = viewVitalCheck.data
    .filter((v) => v.IsDeleted === "0")
    .map((v) => ({
      id: v.Id,
      patientId: v.PatientId,
      date: formatDateString(v.CreatedDateTime),
      time: formatTimeString(v.CreatedDateTime),
      temperature: parseFloat(v.Temperature.toFixed(1)),
      weight: parseFloat(v.Weight.toFixed(1)),
      height: parseFloat(v.Height.toFixed(2)),
      systolicBP: parseFloat(v.SystolicBP.toFixed(0)),
      diastolicBP: parseFloat(v.DiastolicBP.toFixed(0)),
      heartRate: parseFloat(v.HeartRate.toFixed(0)),
      spO2: parseFloat(v.SpO2.toFixed(0)),
      bloodSugarLevel: parseFloat(v.BloodSugarLevel.toFixed(0)),
      afterMeal: convertToYesNo(v.IsAfterMeal)?.toUpperCase(),
      remark: v.VitalRemarks || "",
    }));

  const UpdatedTD = {
    vitals: vitalsTransformed,
    pagination: {
      pageNo: viewVitalCheck.pageNo,
      pageSize: viewVitalCheck.pageSize,
      totalRecords: viewVitalCheck.totalRecords,
      totalPages: viewVitalCheck.totalPages,
    },
  };

  console.log("convertToVitalTDServer: ", UpdatedTD);

  return UpdatedTD;
};

export const fetchVitals = async (
  id: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<VitalCheckTDServer> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await vitalAPI.get<ViewVitalCheckList>(
      `/list?patient_id=${id}&pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET all Vitals for a patient", response.data);
    return convertToVitalTDServer(response.data);
  } catch (error) {
    console.error("GET all Vitals for a patient", error);
    throw error;
  }
};

export const addVital = async (
  formData: VitalFormData
): Promise<ViewVitalCheck> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await vitalAPI.post<ViewVitalCheck>(`/add`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("POST Add Vital for a patient", response.data);
    return response.data;
  } catch (error) {
    console.error("POST Add Vital for a patient", error);
    throw error;
  }
};

export const updateVital = async (
  vitalId: number,
  formData: VitalFormData
): Promise<ViewVitalCheck> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await vitalAPI.put<ViewVitalCheck>(
      `/update/${vitalId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT Update Vital for a patient", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT Update Vital for a patient", error);
    throw error;
  }
};

export const deleteVital = async (vitalId: number): Promise<ViewVitalCheck> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await vitalAPI.put<ViewVitalCheck>(
      `/delete`,
      {
        Id: vitalId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT Delete Vital for a patient", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT Delete Vital for a patient", error);
    throw error;
  }
};
