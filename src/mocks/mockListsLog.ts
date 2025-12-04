import { TableRowData } from "@/components/Table/DataTable";

export type ListAction = "Add" | "Update" | "Delete";
export type LogStatus = "Pending approval" | "Committed" | "Rejected" | "None";

export type ListsLogRow = TableRowData & {
  tableAffected: string;
  listType: string;
  actionType: ListAction;
  status: LogStatus;
  createdDateTime: string;
  userId: string;
  userName: string;
  formattedData1?: string[];
  formattedData2?: string[];
};

export const ACTION_OPTIONS: ListAction[] = ["Add", "Update", "Delete"];
export const STATUS_OPTIONS: LogStatus[] = [
  "Pending approval",
  "Committed",
  "Rejected",
  "None",
];

export const LIST_TYPES = [
  "Allergy",
  "Languages",
  "MobilityAid",
  "DementiaType",
  "Prescription",
];

export const MOCK_USERS = [
  { id: "u1", name: "Daniel Lee" },
  { id: "u2", name: "Amanda Tan" },
  { id: "u3", name: "System Admin" },
];

export const MOCK_LISTS_LOG: ListsLogRow[] = [
  {
    id: 1,
    tableAffected: "List_Allergy",
    listType: "Allergy",
    actionType: "Add",
    status: "Pending approval",
    createdDateTime: "2025-10-12T09:40:00Z",
    userId: "u1",
    userName: "Daniel Lee",
    formattedData1: ["Value: Sesame", "IsDeleted: 0"],
  },
  {
    id: 2,
    tableAffected: "List_Languages",
    listType: "Languages",
    actionType: "Update",
    status: "Committed",
    createdDateTime: "2025-10-10T07:05:00Z",
    userId: "u2",
    userName: "Amanda Tan",
    formattedData1: ["Value: Bahasa Indonesia", "IsDeleted: 0"],
  },
  {
    id: 3,
    tableAffected: "List_MobilityAid",
    listType: "MobilityAid",
    actionType: "Update",
    status: "Committed",
    createdDateTime: "2025-10-09T11:30:00Z",
    userId: "u3",
    userName: "System Admin",
    formattedData1: ["Value: Cane", "IsDeleted: 0"],
    formattedData2: ["Value: Walking Cane", "IsDeleted: 0"],
  },
  {
    id: 4,
    tableAffected: "List_DementiaType",
    listType: "DementiaType",
    actionType: "Delete",
    status: "Rejected",
    createdDateTime: "2025-10-08T14:15:00Z",
    userId: "u1",
    userName: "Daniel Lee",
    formattedData1: ["Value: Lewy Body (Severe)", "IsDeleted: 1"],
  },
  {
    id: 5,
    tableAffected: "List_Prescription",
    listType: "Prescription",
    actionType: "Add",
    status: "None",
    createdDateTime: "2025-10-07T16:00:00Z",
    userId: "u2",
    userName: "Amanda Tan",
    formattedData1: ["Value: Donepezil", "IsDeleted: 0"],
  },
];
