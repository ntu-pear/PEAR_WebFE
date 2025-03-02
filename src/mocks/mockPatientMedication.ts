import { TableRowData } from "@/components/Table/DataTable";

export interface PatientMedicationData extends TableRowData {
  patientId: number;
  patientName: string;
  preferredName: string;
  nric: string;
  startDate: string;
  endDate: string;
  patientStatusInActiveDate: string;
  prescription?: {
    prescriptionId: number;
    prescriptionName: string;
    dosage: string;
    allocatedTime: string;
    startDate: string;
    endDate: string;
    status: boolean;
    prescriptionRemarks: string;
    administredBy: string;
  };
}

export const mockPatientMedicationList: PatientMedicationData[] = [
  {
    id: 1,
    patientId: 1,
    patientName: "Jack Lim",
    preferredName: "Jack",
    nric: "S12345678A",
    startDate: "18 Apr 2024",
    endDate: "18 Apr 2024",
    patientStatusInActiveDate: "17 Apr 2024",
    prescription: {
      prescriptionId: 1,
      prescriptionName: "Panadol",
      dosage: "20mg",
      allocatedTime: "17:03",
      startDate: "17 Apr 2024",
      endDate: "17 Apr 2024",
      status: true,
      prescriptionRemarks: "NIL",
      administredBy: "Guardian 1",
    },
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Missy Low",
    preferredName: "Missy",
    nric: "S12345678A",
    startDate: "18 Apr 2024",
    endDate: "18 Apr 2024",
    patientStatusInActiveDate: "17 Apr 2024",
  },
];
