import { PatientTableData } from "@/mocks/mockPatientTableData";
import { patientsAPI } from "./apiConfig";
import { formatDateString } from "@/utils/formatDate";

export interface PatientBase {
  firstName: string;
  lastName: string;
  nric: string;
  address?: string;
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
}

const convertToPatientTD = (patients: PatientBase[]): PatientTableData[] => {
  return patients.map((p, index) => ({
    id: index,
    name: p.firstName + " " + p.lastName,
    preferredName: p.preferredName ? p.preferredName : "",
    nric: p.nric[0] + "xxxx" + p.nric.slice(-3),
    status: parseInt(p.isActive) > 0 ? "Active" : "Inactive",
    startDate: p.startDate ? formatDateString(new Date(p.startDate)) : "",
    endDate: p.endDate ? formatDateString(p.endDate) : "",
    inactiveDate: p.inActiveDate ? formatDateString(p.inActiveDate) : "",
    supervisorId: 2,
    image: p.profilePicture,
  }));
};

//Get All Patients
export const fetchAllPatientTD = async (): Promise<PatientTableData[]> => {
  try {
    const response = await patientsAPI.get<PatientBase[]>("");
    //console.log(response.data);
    return convertToPatientTD(response.data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
