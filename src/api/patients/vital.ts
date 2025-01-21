import { VitalCheckTD } from '@/mocks/mockPatientDetails';
import { vitalAPI } from '../apiConfig';
import { formatDateString, formatTimeString } from '@/utils/formatDate';

export interface VitalCheck {
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
  CreatedById: number;
  UpdatedById: number;
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
  CreatedById?: number;
  UpdatedById?: number;
}

const convertToVitalTD = (vitals: VitalCheck[]): VitalCheckTD[] => {
  if (!Array.isArray(vitals)) {
    console.error('vitals is not asn array', vitals);
    return []; // Return an empty array if vitals is not an array
  }

  return vitals
    .filter((v) => v.IsDeleted === '0')
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
      afterMeal: v.IsAfterMeal?.toUpperCase(),
      remark: v.VitalRemarks || '',
    }));
};

export const fetchVitals = async (
  id: number,
  skip: number = 0,
  limit: number = 10
): Promise<VitalCheckTD[]> => {
  try {
    const response = await vitalAPI.get<VitalCheck[]>(
      `/list?patient_id=${id}&skip=${skip}&limit=${limit}`
    );
    console.log('GET all Vitals for a patient', response.data);
    return convertToVitalTD(response.data);
  } catch (error) {
    console.error('GET all Vitals for a patient', error);
    throw error;
  }
};

export const addVital = async (
  formData: VitalFormData
): Promise<VitalCheck> => {
  try {
    const response = await vitalAPI.post<VitalCheck>(`/add`, formData);
    console.log('POST Add Vital for a patient', response.data);
    return response.data;
  } catch (error) {
    console.error('POST Add Vital for a patient', error);
    throw error;
  }
};

export const updateVital = async (
  vitalId: number,
  formData: VitalFormData
): Promise<VitalCheck> => {
  try {
    const response = await vitalAPI.put<VitalCheck>(
      `/update/${vitalId}`,
      formData
    );
    console.log('PUT Update Vital for a patient', response.data);
    return response.data;
  } catch (error) {
    console.error('PUT Update Vital for a patient', error);
    throw error;
  }
};

export const deleteVital = async (vitalId: number): Promise<VitalCheck> => {
  try {
    const response = await vitalAPI.put<VitalCheck>(`/delete`, {
      Id: vitalId,
    });
    console.log('PUT Delete Vital for a patient', response.data);
    return response.data;
  } catch (error) {
    console.error('PUT Delete Vital for a patient', error);
    throw error;
  }
};
