import { TableRowData } from "@/components/Table/DataTable";

export interface ActivityTableData extends TableRowData {
  active: boolean;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isCompulsory: boolean;
  isFixed: boolean;
  isGroup: boolean;
  fixedTimeSlots?: string;
}

export const mockActivitiesList: ActivityTableData[] = [
  {
    id: 1,
    active: true,
    title: "Lunch",
    description: "Daily Lunch",
    startDate: "2025-03-27",
    endDate: "2025-03-27",
    isCompulsory: true,
    isFixed: true,
    isGroup: true,
    fixedTimeSlots: "0-3,1-3,2-3,3-3,4-3",
  },
  {
    id: 2,
    active: true,
    title: "Breathing+Vital Check",
    description: "breathing and vital check",
    startDate: "2025-03-27",
    endDate: "2025-03-27",
    isCompulsory: true,
    isFixed: true,
    isGroup: true,
    fixedTimeSlots: "0-0,1-0,2-0,3-0,4-0",
  },
  {
    id: 3,
    active: true,
    title: "Board Games",
    description: "Board Games",
    startDate: "2025-03-27",
    endDate: "2025-03-27",
    isCompulsory: false,
    isFixed: false,
    isGroup: true,
  },
  {
    id: 4,
    active: true,
    title: "Movie Screening",
    description: "movie screening",
    startDate: "2025-03-27",
    endDate: "2025-03-27",
    isCompulsory: false,
    isFixed: false,
    isGroup: true,
  },
  {
    id: 5,
    active: true,
    title: "Brisk Walking",
    description: "brisk walking",
    startDate: "2025-03-27",
    endDate: "2025-03-27",
    isCompulsory: false,
    isFixed: true,
    isGroup: true,
    fixedTimeSlots: "0-3,1-3,2-3,3-3,4-3",
  },
];
