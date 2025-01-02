import { PatientTableData } from '@/mocks/mockPatientTableData';
import { patientsAPI } from '../apiConfig';
import { formatDateString } from '@/utils/formatDate';
import {
  PatientInformation,
  ProfilePhotoAndName,
} from '@/mocks/mockPatientDetails';

export interface PatientBase {
  firstName: string;
  lastName: string;
  nric: string;
  address: string;
  tempAddress?: string;
  homeNo?: string;
  handphoneNo?: string;
  gender: string;
  dateOfBirth: Date;
  guardianId?: number;
  isApproved?: string;
  preferredName?: string;
  preferredLanguageId?: number;
  updateBit: string;
  autoGame: string;
  startDate: Date;
  endDate?: Date;
  isActive: string;
  isRespiteCare: string;
  privacyLevel: number;
  terminationReason?: string;
  inActiveReason?: string;
  inActiveDate?: Date;
  profilePicture?: string;
  createdDate: Date;
  modifiedDate: Date;
  createdById: number;
  modifiedById: number;
  id: number;
}

const convertToPatientTD = (patients: PatientBase[]): PatientTableData[] => {
  if (!Array.isArray(patients)) {
    console.error('patients is not an array', patients);
    return []; // Return an empty array if patients is not an array
  }

  return patients.map((p) => ({
    id: p.id,
    name: p.firstName + ' ' + p.lastName,
    preferredName: p.preferredName ? p.preferredName : '',
    nric: p.nric[0] + 'XXXX' + p.nric.slice(-3),
    status: parseInt(p.isActive) > 0 ? 'Active' : 'Inactive',
    startDate: p.startDate ? formatDateString(p.startDate) : '',
    endDate: p.endDate ? formatDateString(p.endDate) : '',
    inactiveDate: p.inActiveDate ? formatDateString(p.inActiveDate) : '',
    supervisorId: 2,
    image: p.profilePicture,
  }));
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
    console.log(response);
    console.log(response.data);
    return convertToPatientTD(response.data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchPatientById = async (id: number): Promise<PatientBase> => {
  try {
    const response = await patientsAPI.get<PatientBase>(`/${id}`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchProfilePhotoAndName = async (
  id: number
): Promise<ProfilePhotoAndName> => {
  try {
    const response = await patientsAPI.get<PatientBase>(`/${id}`);
    const patient = response.data;
    return {
      profilePicture: patient.profilePicture || '',
      name:
        patient.firstName.toUpperCase() + ' ' + patient.lastName.toUpperCase(),
      preferredName: patient.preferredName?.toUpperCase() || '',
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchPatientInfo = async (
  id: number
): Promise<PatientInformation> => {
  try {
    const response = await patientsAPI.get<PatientBase>(`/${id}`);
    const p = response.data;
    return {
      id: id,
      name: p.firstName.toUpperCase() + ' ' + p.lastName.toUpperCase(),
      nric: p.nric[0] + 'XXXX' + p.nric.slice(-3),
      dateOfBirth: p.dateOfBirth ? formatDateString(p.dateOfBirth) : '-',
      gender: p.gender,
      address: p.address,
      inactiveDate: p.inActiveDate ? formatDateString(p.inActiveDate) : '-',
      tempAddress: p.tempAddress || '-',
      homeNo: p.homeNo || '-',
      handphoneNo: p.handphoneNo || '-',
      preferredName: p.preferredName || '-',
      preferredLanguage: '-',
      underRespiteCare: p.isRespiteCare,
      startDate: p.startDate ? formatDateString(p.startDate) : '',
      endDate: p.endDate ? formatDateString(p.endDate) : '',
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
