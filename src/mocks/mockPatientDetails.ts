import { TableRowData } from '@/components/Table/DataTable';

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
}

export interface DiagnosedDementia extends TableRowData {
  dementiaType: string;
  dementiaDate: string;
}

export interface MedicalDetails extends TableRowData {
  medicalDetails: string;
  informationSource: string;
  medicalEstimatedDate: string;
  notes: string;
}

export interface MobilityAids extends TableRowData {
  mobilityAids: string;
  remark: string;
  condition: string;
  date: string;
}

export interface DoctorNotes extends TableRowData {
  date: string;
  doctorName: string;
  notes: string;
}

export interface StaffAllocation extends TableRowData {
  staffRole: string;
  staffName: string;
}

export interface SocialHistory extends TableRowData {
  alcoholUse: string;
  caffeineUse: string;
  diet: string;
  drugUse: string;
  education: string;
  exercise: string;
  liveWith: string;
  occupation: string;
  pet: string;
  religion: string;
  secondhandSmoker: string;
  sexuallyActive: string;
  tobaccoUse: string;
}

export interface AllergyTD extends TableRowData {
  allergicTo: string;
  reaction: string;
  notes: string;
}

export interface VitalCheckTD extends TableRowData {
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

export interface Prescription extends TableRowData {
  drugName: string;
  dosage: number;
  frequencyPerDay: number;
  instruction: string;
  startDate: string;
  endDate: string;
  afterMeal: string;
  remark: string;
  chronic: string;
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
    'https://images.unsplash.com/photo-1488820098099-8d4a4723a490?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  name: 'BOB SMITH',
  preferredName: 'BOB',
};

export const mockPatientInformation: PatientInformation = {
  id: 1,
  name: 'Bob Smith',
  nric: 'Sxxxx123A',
  dateOfBirth: '1 Jan 1955',
  gender: 'Male',
  address: 'Blk 123 Summer Street 102, #05-123, Singapore 35123',
  inactiveDate: '12 Oct 2024',
  tempAddress: '-',
  homeNo: '12345678',
  handphoneNo: '23456789',
  preferredName: 'Bob',
  preferredLanguage: 'English',
  underRespiteCare: 'No',
  startDate: '15 Jul 2024',
  endDate: '30 Aug 2024',
};

export const mockMaskedNRIC = 'Sxxxx123A';

export const mockUnmaskedNRIC = 'S1234123A';

export const mockDiagnosedDementiaList: DiagnosedDementia[] = [
  {
    id: 1,
    dementiaType: "Alzheimer's disease",
    dementiaDate: '12 Jun 2024',
  },
];

export const mockMediclaDetails: MedicalDetails[] = [
  {
    id: 1,
    medicalDetails: '1',
    informationSource: '1',
    medicalEstimatedDate: '12 Jun 2024',
    notes: 'notes',
  },
];

export const mockMobilityAids: MobilityAids[] = [
  {
    id: 1,
    mobilityAids: 'Crutches',
    remark: '1',
    condition: 'Fully Recovered',
    date: '5 Aug 2024',
  },
];

export const mockDoctorNotes: DoctorNotes[] = [
  {
    id: 1,
    date: '12 Aug 2024',
    doctorName: 'Daniel Lee',
    notes: "Patient's condition is improving",
  },
];

export const mockStaffAllocation: StaffAllocation[] = [
  {
    id: 1,
    staffRole: 'Doctor',
    staffName: 'Daniel Lee',
  },
  {
    id: 2,
    staffRole: 'Game Therapist',
    staffName: 'Alan Tan',
  },
  {
    id: 3,
    staffRole: 'Supervisor',
    staffName: 'Jessica Sim',
  },
  {
    id: 4,
    staffRole: 'Caregiver',
    staffName: 'Jessica Sim',
  },
];

export const mockSocialHistory: SocialHistory = {
  id: 1,
  alcoholUse: '',
  caffeineUse: '',
  diet: '',
  drugUse: '',
  education: '',
  exercise: '',
  liveWith: '',
  occupation: '',
  pet: '',
  religion: '',
  secondhandSmoker: '',
  sexuallyActive: '',
  tobaccoUse: '',
};

export const mockAllergy: AllergyTD[] = [
  {
    id: 1,
    allergicTo: 'Fish',
    reaction: 'Rashes',
    notes: 'SICK',
  },
  {
    id: 2,
    allergicTo: 'Corns',
    reaction: 'Nausea',
    notes: '1',
  },
  {
    id: 3,
    allergicTo: 'Eggs',
    reaction: 'Vomitting',
    notes: 'Test allergy, added at 1642 using webapp',
  },
];

export const mockVitalCheck: VitalCheckTD[] = [
  {
    id: '1', // Assuming `TableRowData` includes an `id` field
    date: '15 Aug 2024',
    time: '09:30 AM',
    temperature: 36.8, // Normal body temperature in Celsius
    weight: 65.2, // Weight in kilograms
    height: 1.65, // Height in centimeters
    systolicBP: 130, // Slightly elevated systolic blood pressure
    diastolicBP: 85, // Slightly elevated diastolic blood pressure
    heartRate: 72, // Normal heart rate
    spO2: 96, // Normal oxygen saturation level
    bloodSugarLevel: 120, // Blood sugar in mg/dL (mildly elevated)
    afterMeal: 'Yes', // Indicates the reading was taken after a meal
    remark:
      'Patient exhibited mild confusion during measurement, but vitals are stable.', // Contextual remark
  },
];

export const mockLike: PersonalPreference[] = [
  {
    id: '1',
    dateCreated: '8 Aug 2024',
    authorName: 'Jane',
    description: 'Enjoys soft and sweet treats, like pudding and applesauce.',
  },
];

export const mockDislike: PersonalPreference[] = [
  {
    id: '1',
    dateCreated: '8 Aug 2024',
    authorName: 'Jane',
    description: 'Dislikes food with hard textures or strong spices.',
  },
];

export const mockHobby: PersonalPreference[] = [
  {
    id: '1',
    dateCreated: '8 Aug 2024',
    authorName: 'Jane',
    description:
      'Enjoys simple crafts like coloring with crayons or making collages with pre-cut shapes.',
  },
];

export const mockHabit: PersonalPreference[] = [
  {
    id: '1',
    dateCreated: '8 Aug 2024',
    authorName: 'Jane',
    description:
      'Loves a daily walk in the park during the late afternoon for fresh air.',
  },
];

export const mockProblemLog: ProblemLog[] = [
  {
    id: 1,
    author: 'Jessica Sim',
    description: 'Communication',
    remark: '1',
  },
];

export const mockActivityPreferences: ActivityPreference[] = [
  {
    id: 1,
    activityName: 'Mahjong',
    activityDescription: 'mahjong',
    likeOrDislike: 'Like',
  },
];

export const mockRoutine: Routine[] = [
  {
    id: '1',
    activityName: 'Morning Walk',
    routineIssue:
      'Needs supervision due to wandering and risk of disorientation.',
    routineTimeSlots: '08:00 AM - 08:30 AM',
    includeInSchedule: 'Yes',
  },
];

export const mockPrescription: Prescription[] = [
  {
    id: 1,
    drugName: 'Antihistamines',
    dosage: 2,
    frequencyPerDay: 1,
    instruction: '2 pills 1 times per day, Consume after meal',
    startDate: '6 Aug 2024',
    endDate: '21 Aug 2024',
    afterMeal: 'Yes',
    remark: '1',
    chronic: 'Yes',
  },
];

export const mockGuardian: GuardianTD[] = [
  {
    id: 1,
    guardianType: 'Primary Guardian',
    guardianName: 'AZIRUM QWE',
    preferredName: 'AZIRUMM',
    nric: 'Sxxxx061B',
    relationshipWithPatient: 'Parent',
    contractNo: '91111111',
    address: 'Blk 123 Summer Street 102, #05-123, Singapore 35123',
    email: 'azirumqwe@gmail.com',
  },
];

export const mockActivityExclusion: ActivityExclusion[] = [
  {
    id: '1',
    title: 'Avoid Unsupervised Outdoor Activities',
    description:
      'Patient should not go outside unaccompanied due to risks of wandering or disorientation.',
    startDate: '15 Aug 2024',
    endDate: '31 Dec 2024',
    remark:
      'Recommended by caregiver and physician due to increased episodes of confusion and wandering. Regular review needed.',
  },
];
