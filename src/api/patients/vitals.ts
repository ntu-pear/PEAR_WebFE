import { VitalCheckTD } from '@/mocks/mockPatientDetails';
import { vitalsAPI } from '../apiConfig';
import { formatDateString } from '@/utils/formatDate';

export interface VitalCheck {
  active: string;
  patientId: number;
  afterMeal: string;
  temperature: number;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  spO2: number;
  bloodSugarLevel: number;
  height: number;
  weight: number;
  vitalRemarks?: string;
  id: number;
  createdDateTime: string;
  modifiedDateTime: string;
  createdById: number;
  modifiedById: number;
}

export interface VitalFormData {
  patientId?: number;
  temperature: number;
  weight: number;
  height: number;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  spO2: number;
  bloodSugarLevel: number;
  vitalRemarks?: string;
  afterMeal: string;
  createdById?: number;
  modifiedById?: number;
}

const convertToVitalTD = (vitals: VitalCheck[]): VitalCheckTD[] => {
  if (!Array.isArray(vitals)) {
    console.error('vitals is not an array', vitals);
    return []; // Return an empty array if vitals is not an array
  }

  return vitals
    .filter((v) => v.active === '1')
    .map((v) => ({
      id: v.id,
      date: formatDateString(new Date(v.createdDateTime)),
      time: new Date(v.createdDateTime).toLocaleTimeString(),
      temperature: parseFloat(v.temperature.toFixed(1)),
      weight: parseFloat(v.weight.toFixed(1)),
      height: parseFloat(v.height.toFixed(2)),
      systolicBP: parseFloat(v.systolicBP.toFixed(0)),
      diastolicBP: parseFloat(v.diastolicBP.toFixed(0)),
      heartRate: parseFloat(v.heartRate.toFixed(0)),
      spO2: parseFloat(v.spO2.toFixed(0)),
      bloodSugarLevel: parseFloat(v.bloodSugarLevel.toFixed(0)),
      afterMeal: v.afterMeal,
      remark: v.vitalRemarks || '',
    }));
};

export const fetchVitalTD = async (
  id: number,
  skip: number = 0,
  limit: number = 10
): Promise<VitalCheckTD[]> => {
  try {
    const response = await vitalsAPI.get<VitalCheck[]>(
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
    const response = await vitalsAPI.post<VitalCheck>(`/add`, formData);
    console.log('POST Add Vital for a patient', response.data);
    return response.data;
  } catch (error) {
    console.error('POST Add Vital for a patient', error);
    throw error;
  }
};

export const deleteVital = async (vitalId: number): Promise<VitalCheck> => {
  try {
    const response = await vitalsAPI.put<VitalCheck>(`/delete`, {
      id: vitalId,
    });
    console.log('PUT Delete Vital for a patient', response.data);
    return response.data;
  } catch (error) {
    console.error('PUT Delete Vital for a patient', error);
    throw error;
  }
};
