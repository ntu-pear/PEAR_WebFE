import { TableRowData } from "@/components/Table/DataTable";

export interface AccountData extends TableRowData {
  id: string;
  name: string;
  status: string;
  email: string;
  createdDate: string;
  role: string;
}

export const mockAccountsList: AccountData[] = [
  {
    id: "U01d447fkcfe",
    name: "ADELINE TAN",
    status: "ACTIVE",
    email: "adeline@gmail.com",
    createdDate: "2025-02-17 15:21:00",
    role: "CAREGIVER"
  },
]

// export type UserRole = 'administrator' | 'caregiver' | 'doctor' | 'gameTherapist' | 'guardian' | 'supervisor'

// export const mockUsersOfRoles = {
//   administrator: ['Ms Janice'],
//   caregiver: ['Adea'],
//   doctor: ['Daniel'],
//   gameTherapist: ['Alan'],
//   guardian: ['Dawn'],
//   supervisor: ['JESS'],
// }