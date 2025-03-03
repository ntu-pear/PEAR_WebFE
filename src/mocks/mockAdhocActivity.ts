import { TableRowData } from "@/components/Table/DataTable";

export interface AdhocActivityData extends TableRowData {
  updatedTime: string;
  patientName: string;
  startDate: string;
  endDate: string;
  oldActivityTitle: string;
  oldActivityDescription: string;
  newActivityTitle: string;
  newActivityDescription: string;
}

export const mockAdhocActivityList: AdhocActivityData[] = [
  {
    id: 1,
    updatedTime: "11 MAR 2024 06:04",
    patientName: "ALICE LEE",
    startDate: "11 MAR 2024",
    endDate: "11 MAR 2024",
    oldActivityTitle: "ORIGAMI",
    oldActivityDescription: "origami",
    newActivityTitle: "PICTURE COLOURING",
    newActivityDescription: "picture coloring",
  },
  {
    id: 2,
    updatedTime: "17 APR 2024 17:03",
    patientName: "JELINE MAO",
    startDate: "18 APR 2024",
    endDate: "18 APR 2024",
    oldActivityTitle: "BRISK WALKING",
    oldActivityDescription: "brisk walking",
    newActivityTitle: "LESLIE GEOGRAPHY ROUTINE",
    newActivityDescription:
      "Leslie wants to recall geography facts on Tue, Thu 3pm",
  },
];
