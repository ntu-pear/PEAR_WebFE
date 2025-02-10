import { PatientTableData } from '@/mocks/mockPatientTableData';
import { patientsAPI } from '../apiConfig';
import { formatDateString } from '@/utils/formatDate';
import {
  PatientInformation,
  ProfilePhotoAndName,
  mockPreferredLanguageList,
} from '@/mocks/mockPatientDetails';
import { convertToYesNo } from '@/utils/convertToYesNo';

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
  createdById: number;
  modifiedById: number;
}

const convertToPatientTD = (patients: PatientBase[]): PatientTableData[] => {
  if (!Array.isArray(patients)) {
    console.error('patients is not an array', patients);
    return []; // Return an empty array if patients is not an array
  }

  return patients
    .filter((p) => !p.isDeleted)
    .map((p) => ({
      id: p.id,
      name: p.name?.toUpperCase(),
      preferredName: p.preferredName ? p.preferredName?.toUpperCase() : '',
      nric: p.nric?.toUpperCase(),
      status: parseInt(p.isActive) > 0 ? 'Active' : 'Inactive',
      startDate: p.startDate ? formatDateString(p.startDate) : '',
      endDate: p.endDate ? formatDateString(p.endDate) : '',
      inactiveDate: p.inActiveDate ? formatDateString(p.inActiveDate) : '',
      supervisorId: 2,
      image: p.profilePicture,
    }));
};

const toUpperCasePatient = (patient: PatientBase): PatientBase => {
  return {
    name: patient.name?.toUpperCase() || '',
    nric: patient.nric?.toUpperCase() || '',
    address: patient.address?.toUpperCase() || '',
    tempAddress: patient.tempAddress?.toUpperCase() || '',
    homeNo: patient.homeNo,
    handphoneNo: patient.handphoneNo,
    gender: patient.gender?.toUpperCase() || '',
    dateOfBirth: patient.dateOfBirth,
    guardianId: patient.guardianId,
    isApproved: patient.isApproved,
    preferredName: patient.preferredName?.toUpperCase() || '',
    preferredLanguageId: patient.preferredLanguageId,
    updateBit: patient.updateBit,
    autoGame: patient.autoGame,
    startDate: patient.startDate,
    endDate: patient.endDate,
    isActive: patient.isActive,
    isRespiteCare: patient.isRespiteCare,
    privacyLevel: patient.privacyLevel,
    terminationReason: patient.terminationReason?.toUpperCase() || '',
    inActiveReason: patient.inActiveReason?.toUpperCase() || '',
    inActiveDate: patient.inActiveDate,
    profilePicture: patient.profilePicture,
    isDeleted: patient.isDeleted,
    id: patient.id,
    createdDate: patient.createdDate,
    modifiedDate: patient.modifiedDate,
    createdById: patient.createdById,
    modifiedById: patient.modifiedById,
  };
};

//Get All Patients with skip and limit
export const fetchAllPatientTD = async (
  skip: number = 0,
  limit: number = 10
): Promise<PatientTableData[]> => {
  try {
    const response = await patientsAPI.get<PatientBase[]>(
      `/?skip=${skip}&limit=${limit}`
    );
    console.log('GET all Patients', response.data);
    return convertToPatientTD(response.data);
  } catch (error) {
    console.error('GET all Patients', error);
    throw error;
  }
};

// for edit patient modal
export const fetchPatientById = async (
  id: number,
  isNRICMasked: boolean = false
): Promise<PatientBase> => {
  try {
    const response = await patientsAPI.get<PatientBase>(
      `/${id}?mask=${isNRICMasked}`
    );
    console.log('GET Patient', response.data);
    return toUpperCasePatient(response.data);
  } catch (error) {
    console.error('GET Patient', error);
    throw error;
  }
};

export const fetchProfilePhotoAndName = async (
  id: number
): Promise<ProfilePhotoAndName> => {
  try {
    const response = await patientsAPI.get<PatientBase>(`/${id}`);
    const patient = response.data;
    console.log('GET Profile Photo and Name', patient);
    return {
      profilePicture: patient.profilePicture || '',
      name: patient.name?.toUpperCase(),
      preferredName: patient.preferredName?.toUpperCase() || '',
    };
  } catch (error) {
    console.error('GET Profile Photo and Name', error);
    throw error;
  }
};

//for patient info card
export const fetchPatientInfo = async (
  id: number
): Promise<PatientInformation> => {
  try {
    const response = await patientsAPI.get<PatientBase>(`/${id}`);
    const p = response.data;
    console.log('GET Patient Info', p);
    return {
      id: id,
      name: p.name?.toUpperCase(),
      preferredName: p.preferredName?.toUpperCase() || '-',
      nric: p.nric?.toUpperCase(),
      dateOfBirth: p.dateOfBirth ? formatDateString(p.dateOfBirth) : '-',
      gender:
        p.gender?.toUpperCase() === 'F'
          ? 'FEMALE'
          : p.gender?.toUpperCase() === 'M'
          ? 'MALE'
          : '',
      address: p.address?.toUpperCase(),
      tempAddress: p.tempAddress?.toUpperCase() || '-',
      homeNo: p.homeNo || '-',
      handphoneNo: p.handphoneNo || '-',
      preferredLanguage:
        mockPreferredLanguageList
          .find((pl) => pl.id === p.preferredLanguageId)
          ?.value.toUpperCase() || '-',
      privacyLevel: p.privacyLevel,
      underRespiteCare: convertToYesNo(p.isRespiteCare),
      startDate: p.startDate ? formatDateString(p.startDate) : '',
      endDate: p.endDate ? formatDateString(p.endDate) : '',
      inactiveDate: p.inActiveDate ? formatDateString(p.inActiveDate) : '-',
    };
  } catch (error) {
    console.error('GET Patient Info', error);
    throw error;
  }
};

//toggle for nric in patient info card
export const fetchPatientNRIC = async (
  id: number,
  isNRICMasked: boolean
): Promise<string> => {
  const response = await patientsAPI.get<PatientBase>(
    `/${id}?mask=${isNRICMasked}`
  );
  const nric = response.data?.nric;
  console.log('GET Patient NRIC', nric);

  return nric?.toUpperCase();
};

export const updatePatient = async (
  id: number,
  patient: PatientBase
): Promise<PatientBase> => {
  try {
    const response = await patientsAPI.put<PatientBase>(`/${id}`, patient);
    console.log('PUT update Patient Info', response.data);
    return response.data;
  } catch (error) {
    console.error('PUT update Patient Info', error);
    throw error;
  }
};
