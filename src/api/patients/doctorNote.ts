import { DoctorNoteTD } from '@/mocks/mockPatientDetails';
import { formatDateString } from '@/utils/formatDate';
import { doctorNoteAPI } from '../apiConfig';

export interface DoctorNote {
  isDeleted: string;
  patientId: number;
  doctorId: number;
  doctorRemarks: string;
  id: number;
  createdDate: string;
  modifiedDate: string;
  createdById: number;
  modifiedById: number;
}

export const convertToDoctorNotesTD = (
  doctorNotes: DoctorNote[]
): DoctorNoteTD[] => {
  if (!Array.isArray(doctorNotes)) {
    console.log('doctorNotes is not an array', doctorNotes);
    return [];
  }

  return doctorNotes
    .filter((dn) => dn.isDeleted === '0')
    .map((dn) => ({
      id: dn.id,
      date: dn.createdDate ? formatDateString(dn.createdDate) : '',
      doctorName: dn.doctorId.toString().toUpperCase(), //temporary use doctorId for now
      notes: dn.doctorRemarks || '',
    }));
};

export const fetchDoctorNotes = async (
  patientId: number
): Promise<DoctorNoteTD[]> => {
  try {
    const response = await doctorNoteAPI.get<DoctorNote[]>(
      `GetDoctorNotesByPatient?patient_id=${patientId}`
    );
    console.log('GET Patient Doctor Notes', response.data);
    return convertToDoctorNotesTD(response.data);
  } catch (error) {
    console.error('GET Patient Doctor Notes', error);
    throw error;
  }
};
