import { TableRowData } from "@/components/Table/DataTable";

export interface AdhocActivityData extends TableRowData {
  updatedTime: string;
  patientId: number;
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
    updatedTime: "11 Mar 2024 06:04",
    patientId: 1,
    startDate: "11 Mar 2024",
    endDate: "11 Mar 2024",
    oldActivityTitle: "Origami",
    oldActivityDescription: "origami",
    newActivityTitle: "Picture Coloring",
    newActivityDescription: "picture coloring",
  },
  {
    id: 2,
    updatedTime: "17 Apr 2024 17:03",
    patientId: 5,
    startDate: "18 Apr 2024",
    endDate: "18 Apr 2024",
    oldActivityTitle: "Brisk Walking",
    oldActivityDescription: "brisk walking",
    newActivityTitle: "Leslie geography routine",
    newActivityDescription:
      "Leslie wants to recall geography facts on Tue, Thu 3pm",
  },
];
