import { MobilityAidTD } from '@/mocks/mockPatientDetails';
import { formatDateString } from '@/utils/formatDate';
import { mobilityAPI } from '../apiConfig';

export interface MobilityAid {
  active: number;
  patient_id: number;
  mobilityListId: number;
  status: string;
  id: number;
  createdDate: string;
  modifiedDate: string;
  createdById: number;
  modifiedById: number;
}

export const convertToMobilityAidTD = (
  mobilityAids: MobilityAid[]
): MobilityAidTD[] => {
  if (!Array.isArray(mobilityAids)) {
    console.error('mobilityAids is not asn array', mobilityAids);
    return []; // Return an empty array if mobilityAids is not an array
  }

  //tbc
  return mobilityAids
    .filter((ma) => ma.active === 1)
    .map((ma) => ({
      id: ma.id,
      mobilityAids: ma.mobilityListId.toString().toUpperCase(),
      remark: '',
      condition: '',
      date: ma.createdDate ? formatDateString(new Date(ma.createdDate)) : '',
    }));
};

export const fetchMobilityAids = async (
  patientId: number
): Promise<MobilityAidTD[]> => {
  try {
    const response = await mobilityAPI.get<MobilityAid[]>(
      `PatientMobility?patient_id=${patientId}`
    );
    console.log('GET Patient Mobility Aids', response.data);
    return convertToMobilityAidTD(response.data);
  } catch (error) {
    console.error('GET Patient Mobility Aids', error);
    throw error;
  }
};
