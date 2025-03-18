import { PreferredLanguage } from "@/api/patients/preferredLanguage";
import {
  PrescriptionList,
  PrescriptionTDServer,
} from "@/api/patients/prescription";
import { SocialHistoryTD } from "@/api/patients/socialHistory";
import { VitalCheckTD } from "@/api/patients/vital";
import { TableRowData } from "@/components/Table/DataTable";

export interface ProfilePhotoAndName {
  profilePicture: string;
  name: string;
  preferredName: string;
}

export interface PatientInformation extends TableRowData {
  name: string;
  nric: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  inactiveDate: string;
  tempAddress: string;
  homeNo: string;
  handphoneNo: string;
  preferredName: string;
  preferredLanguage: string;
  underRespiteCare: string;
  startDate: string;
  endDate: string;
  profilePicture: string;
}

export interface DiagnosedDementiaTD extends TableRowData {
  dementiaType: string;
  dementiaDate: string;
}

export interface MedicalDetails extends TableRowData {
  medicalDetails: string;
  informationSource: string;
  medicalEstimatedDate: string;
  notes: string;
}

export interface StaffAllocation extends TableRowData {
  staffRole: string;
  staffName: string;
}

export interface PersonalPreference extends TableRowData {
  dateCreated: string;
  authorName: string;
  description: string;
}

export interface ProblemLog extends TableRowData {
  author: string;
  description: string;
  remark: string;
}

export interface ActivityPreference extends TableRowData {
  activityName: string;
  activityDescription: string;
  likeOrDislike: string;
}

export interface Routine extends TableRowData {
  activityName: string;
  routineIssue: string;
  routineTimeSlots: string;
  includeInSchedule: string;
}

export interface GuardianTD extends TableRowData {
  guardianType: string;
  guardianName: string;
  preferredName: string;
  nric: string;
  relationshipWithPatient: string;
  contractNo: string;
  address: string;
  email: string;
}

export interface ActivityExclusion extends TableRowData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  remark: string;
}

export const mockProfilePhotoAndName: ProfilePhotoAndName = {
  profilePicture:
    "https://images.unsplash.com/photo-1488820098099-8d4a4723a490?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  name: "BOB SMITH",
  preferredName: "BOB",
};

export const mockPatientInformation: PatientInformation = {
  id: 1,
  name: "BOB SMITH",
  nric: "SXXXX123A",
  dateOfBirth: "1 JAN 1955",
  gender: "MALE",
  address: "BLK 123 SUMMER STREET 102, #05-123, SINGAPORE 35123",
  inactiveDate: "12 OCT 2024",
  tempAddress: "-",
  homeNo: "12345678",
  handphoneNo: "23456789",
  preferredName: "BOB",
  preferredLanguage: "ENGLISH",
  underRespiteCare: "NO",
  startDate: "15 JUL 2024",
  endDate: "30 AUG 2024",
  profilePicture: "",
};

export const mockMaskedNRIC = "SXXXX123A";

export const mockUnmaskedNRIC = "S1234123A";

export const mockPreferredLanguageList: PreferredLanguage[] = [
  {
    id: 1,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Cantonese",
  },
  {
    id: 2,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "English",
  },
  {
    id: 3,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Hainanese",
  },
  {
    id: 4,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Hakka",
  },
  {
    id: 5,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Hindi",
  },
  {
    id: 6,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Hokkien",
  },
  {
    id: 7,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Malay",
  },
  {
    id: 8,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Mandarin",
  },
  {
    id: 9,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Tamil",
  },
  {
    id: 10,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Teochew",
  },
  {
    id: 11,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Japanese",
  },
  {
    id: 12,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Spanish",
  },
  {
    id: 13,
    isDeleted: "0",
    createdDate: "2024-10-05 21:46:52.133",
    modifiedDate: "2024-10-05 21:46:52.133",
    value: "Korean",
  },
  {
    id: 14,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Cantonese",
  },
  {
    id: 15,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "English",
  },
  {
    id: 16,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Hainanese",
  },
  {
    id: 17,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Hakka",
  },
  {
    id: 18,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Hindi",
  },
  {
    id: 19,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Hokkien",
  },
  {
    id: 20,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Malay",
  },
  {
    id: 21,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Mandarin",
  },
  {
    id: 22,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Tamil",
  },
  {
    id: 23,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Teochew",
  },
  {
    id: 24,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Japanese",
  },
  {
    id: 25,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Spanish",
  },
  {
    id: 26,
    isDeleted: "0",
    createdDate: "2024-10-05 21:49:04.863",
    modifiedDate: "2024-10-05 21:49:04.863",
    value: "Korean",
  },
];

export const mockDiagnosedDementiaList: DiagnosedDementiaTD[] = [
  {
    id: 1,
    dementiaType: "ALZHEIMER'S DISEASE",
    dementiaDate: "12 JUN 2024",
  },
];

export const mockMedicalDetails: MedicalDetails[] = [
  {
    id: 1,
    medicalDetails: "1",
    informationSource: "1",
    medicalEstimatedDate: "12 JUN 2024",
    notes: "Notes",
  },
];

export const mockStaffAllocation: StaffAllocation[] = [
  {
    id: 1,
    staffRole: "DOCTOR",
    staffName: "DANIEL LEE",
  },
  {
    id: 2,
    staffRole: "GAME THERAPIST",
    staffName: "ALAN TAN",
  },
  {
    id: 3,
    staffRole: "SUPERVISOR",
    staffName: "JESSICA SIM",
  },
  {
    id: 4,
    staffRole: "CAREGIVER",
    staffName: "JESSICA SIM",
  },
];

export const mockSocialHistoryTD: SocialHistoryTD = {
  id: 1,
  alcoholUse: "",
  caffeineUse: "",
  diet: "",
  drugUse: "",
  education: "",
  exercise: "",
  liveWith: "",
  occupation: "",
  pet: "",
  religion: "",
  secondhandSmoker: "",
  sexuallyActive: "",
  tobaccoUse: "",
};

export const mockVitalCheck: VitalCheckTD[] = [
  {
    id: 1,
    patientId: 1,
    date: "15 AUG 2024",
    time: "09:30 AM",
    temperature: 36.8, // Normal body temperature in Celsius
    weight: 65.2, // Weight in kilograms
    height: 1.65, // Height in meters
    systolicBP: 130, // systolic blood pressure
    diastolicBP: 85, // diastolic blood pressure
    heartRate: 72,
    spO2: 96, // oxygen saturation level
    bloodSugarLevel: 4.5, //blood sugar in mmol/L
    afterMeal: "YES",
    remark:
      "Patient exhibited mild confusion during measurement, but vitals are stable.",
  },
];

export const mockLike: PersonalPreference[] = [
  {
    id: 1,
    dateCreated: "8 AUG 2024",
    authorName: "JANE",
    description: "Enjoys soft and sweet treats, like pudding and applesauce.",
  },
];

export const mockDislike: PersonalPreference[] = [
  {
    id: 1,
    dateCreated: "8 AUG 2024",
    authorName: "JANE",
    description: "Dislikes food with hard textures or strong spices.",
  },
];

export const mockHobby: PersonalPreference[] = [
  {
    id: 1,
    dateCreated: "8 AUG 2024",
    authorName: "JANE",
    description:
      "Enjoys simple crafts like coloring with crayons or making collages with pre-cut shapes.",
  },
];

export const mockHabit: PersonalPreference[] = [
  {
    id: 1,
    dateCreated: "8 AUG 2024",
    authorName: "JANE",
    description:
      "Loves a daily walk in the park during the late afternoon for fresh air.",
  },
];

export const mockProblemLog: ProblemLog[] = [
  {
    id: 1,
    author: "JESSICA SIM",
    description: "COMMUNICATION",
    remark: "1",
  },
];

export const mockActivityPreferences: ActivityPreference[] = [
  {
    id: 1,
    activityName: "MAHJONG",
    activityDescription: "MAHJONG",
    likeOrDislike: "LIKE",
  },
];

export const mockRoutine: Routine[] = [
  {
    id: 1,
    activityName: "MORNING WALK",
    routineIssue:
      "Needs supervision due to wandering and risk of disorientation.",
    routineTimeSlots: "08:00 AM - 08:30 AM",
    includeInSchedule: "YES",
  },
];

export const mockPrescriptionList: PrescriptionList[] = [
  {
    Id: 1,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Acetaminophen",
  },
  {
    Id: 2,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Diphenhydramine",
  },
  {
    Id: 3,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Donepezil",
  },
  {
    Id: 4,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Galantamine",
  },
  {
    Id: 5,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Guaifenesin",
  },
  {
    Id: 6,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Ibuprofen",
  },
  {
    Id: 7,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Memantine",
  },
  {
    Id: 8,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Olanzapine",
  },
  {
    Id: 9,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Paracetamol",
  },
  {
    Id: 10,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Rivastigmine",
  },
  {
    Id: 11,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Salbutamol",
  },
  {
    Id: 12,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Dextromethorphan",
  },
  {
    Id: 13,
    IsDeleted: "0",
    CreatedDateTime: "2025-01-17T20:27:46.063Z",
    UpdatedDateTime: "2025-01-17T20:27:46.063Z",
    Value: "Antihistamines",
  },
];

export const mockPrescriptionListData = {
  data: mockPrescriptionList,
};

export const mockPrescription: PrescriptionTDServer = {
  prescriptions: [
    {
      id: 1,
      drugName: "ANTIHISTAMINES",
      dosage: "2",
      frequencyPerDay: 1,
      instruction: "2 pills 1 times per day, consume after meal",
      startDate: "6 AUG 2024",
      endDate: "21 AUG 2024",
      afterMeal: "YES",
      remark: "1",
      status: "NON-CHRONIC",
    },
  ],
  pagination: {
    pageNo: 0,
    pageSize: 10,
    totalRecords: 1,
    totalPages: 1,
  },
};
export const mockGuardian: GuardianTD[] = [
  {
    id: 1,
    guardianType: "PRIMARY GUARDIAN",
    guardianName: "AZIRUM QWE",
    preferredName: "AZIRUMM",
    nric: "SXXXX061B",
    relationshipWithPatient: "PARENT",
    contractNo: "91111111",
    address: "BLK 123 SUMMER STREET 102, #05-123, SINGAPORE 35123",
    email: "AZIRUMQWE@GMAIL.COM",
  },
];

export const mockActivityExclusion: ActivityExclusion[] = [
  {
    id: 1,
    title: "AVOID UNSUPERVISED OUTDOOR ACTIVITIES",
    description:
      "Patient should not go outside unaccompanied due to risks of wandering or disorientation.",
    startDate: "15 AUG 2024",
    endDate: "31 DEC 2024",
    remark:
      "Recommended by caregiver and physician due to increased episodes of confusion and wandering. Regular review needed.",
  },
];
