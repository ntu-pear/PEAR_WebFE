import {
  mockPrescriptionListData,
  PrescriptionTD,
} from '@/mocks/mockPatientDetails';
import {
  convertIsAfterMeal,
  getStatusDescription,
} from '@/utils/convertToYesNo';
import { formatDateString } from '@/utils/formatDate';
import { patientPrescriptionAPI, prescriptionAPI } from '../apiConfig';

export interface Prescription {
  IsDeleted: string;
  PatientId: number;
  PrescriptionListId: number;
  Dosage: string;
  FrequencyPerDay: number;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  IsAfterMeal: string;
  PrescriptionRemarks: string;
  Status: string;
  Id: number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: number;
  UpdatedById: number;
}

export interface PrescriptionList {
  Id: number;
  IsDeleted: string;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  Value: string;
}

export interface PrescriptionFormData {
  PatientId: number;
  PrescriptionListId: number;
  Dosage: string;
  FrequencyPerDay: number;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  IsAfterMeal: string;
  PrescriptionRemarks: string;
  Status: string;
  CreatedById: number;
  UpdatedById: number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
}

export interface PrescriptionDelete {
  PatientId: number;
  PrescriptionListId: number;
  Dosage: string;
  FrequencyPerDay: number;
  Instruction: string;
  StartDate: string;
  PrescriptionRemarks: string;
  UpdatedDateTime: string;
  UpdatedById: number;
}

export interface PrescriptionUpdate {
  PatientId: number;
  PrescriptionListId: number;
  Dosage: string;
  FrequencyPerDay: number;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  IsAfterMeal: string;
  PrescriptionRemarks: string;
  Status: string;
  UpdatedDateTime: string;
  UpdatedById: number;
}

const convertToPrescriptionTD = (
  prescriptionList: PrescriptionList[],
  prescriptions: Prescription[]
): PrescriptionTD[] => {
  if (!Array.isArray(prescriptionList)) {
    console.error('prescriptionList is not an array', prescriptionList);
    return [];
  }

  if (!Array.isArray(prescriptions)) {
    console.error('prescriptions is not an array', prescriptions);
    return [];
  }

  return prescriptions
    .filter((p) => p.IsDeleted === '0')
    .sort((a, b) => b.Id - a.Id) // Descending order
    .map((p) => ({
      id: p.Id,
      drugName:
        prescriptionList
          .find((pl) => pl.Id === p.PrescriptionListId)
          ?.Value.toUpperCase() || '',
      dosage: p.Dosage.toUpperCase(),
      frequencyPerDay: p.FrequencyPerDay,
      instruction: p.Instruction,
      startDate: formatDateString(p.StartDate),
      endDate: formatDateString(p.EndDate),
      afterMeal: convertIsAfterMeal(p.IsAfterMeal)?.toUpperCase(),
      remark: p.PrescriptionRemarks,
      status: getStatusDescription(p.Status)?.toUpperCase(),
    }));
};

export const fetchPatientPrescription = async (
  patientId: number,
  skip: number = 0,
  limit: number = 100
): Promise<PrescriptionTD[]> => {
  try {
    const dlResponse = mockPrescriptionListData;
    console.log('GET all prescription List', dlResponse.data);

    const ddResponse = await patientPrescriptionAPI.get<Prescription[]>(
      `/?patient_id=${patientId}&skip=${skip}&limit=${limit}`
    );

    console.log('GET all patient prescriptions', ddResponse.data);

    return convertToPrescriptionTD(dlResponse.data, ddResponse.data);
  } catch (error) {
    console.error('GET all prescription List/ patient prescriptions', error);
    throw error;
  }
};

export const fetchPrescriptionById = async (
  prescriptionId: number
): Promise<Prescription> => {
  try {
    const response = await prescriptionAPI.get<Prescription>(
      `/${prescriptionId}`
    );
    console.log('GET prescription by prescriptionId', response.data);
    return response.data;
  } catch (error) {
    console.error('GET prescription by prescriptionId', error);
    throw error;
  }
};

export const addPatientPrescription = async (
  formData: PrescriptionFormData
): Promise<Prescription> => {
  try {
    const response = await prescriptionAPI.post<Prescription>(`/add`, formData);

    console.log('ADD patient prescription', response.data);

    return response.data;
  } catch (error) {
    console.error('ADD patient prescription', error);
    throw error;
  }
};

export const deletePatientPrescription = async (
  prescriptionId: number,
  prescriptionDelete: PrescriptionDelete
): Promise<Prescription> => {
  try {
    const response = await prescriptionAPI.put<Prescription>(
      `/delete/${prescriptionId}`,
      prescriptionDelete
    );

    console.log('PUT Delete patient prescription', response.data);

    return response.data;
  } catch (error) {
    console.error('PUT Delete patient prescription', error);
    throw error;
  }
};

export const updatePatientPrescription = async (
  prescriptionId: number,
  prescriptionUpdate: PrescriptionUpdate
): Promise<Prescription> => {
  try {
    const response = await prescriptionAPI.put<Prescription>(
      `/update/${prescriptionId}`,
      prescriptionUpdate
    );

    console.log('PUT Update patient prescription', response.data);

    return response.data;
  } catch (error) {
    console.error('PUT Update patient prescription', error);
    throw error;
  }
};
