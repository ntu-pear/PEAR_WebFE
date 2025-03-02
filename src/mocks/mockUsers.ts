import { TableRowData } from "@/components/Table/DataTable";

export interface UsersData extends TableRowData {
  name: string;
}

export const usersList: UsersData[] = [
  {
    id: "1",
    name: "Ms Janice",
  },
  {
    id: "2",
    name: "Adea",
  },
  {
    id: "3",
    name: "Daniel",
  },
  {
    id: "4",
    name: "Alan",
  },
  {
    id: "5",
    name: "Dawn",
  },
  {
    id: "6",
    name: "JESS",
  },
];
