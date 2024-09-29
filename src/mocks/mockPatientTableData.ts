import { TableRowData } from "@/components/Table/DataTable";

export interface PatientTableData extends TableRowData {
  name: string;
  preferredName: string;
  nric: string;
  status: string;
  startDate: string;
  endDate: string;
  inactiveDate: string;
  supervisorId: number;
  image?: string;
}

export const mockCaregiverID: number = 1;

export const mockPatientTDList: PatientTableData[] = [
  {
    id: 1,
    name: "Alice Johnson",
    preferredName: "Alice",
    nric: "Sxxxx123A",
    status: "Active",
    startDate: "12 Jun 2024",
    endDate: "12 Dec 2024",
    inactiveDate: "",
    supervisorId: 1,
  },
  {
    id: 2,
    name: "Bob Smith",
    preferredName: "Bob",
    nric: "Sxxxx456B",
    status: "Inactive",
    startDate: "01 Jul 2021",
    endDate: "01 Jan 2022",
    inactiveDate: "02 Jan 2022",
    supervisorId: 2,
    image:
      "https://images.unsplash.com/photo-1488820098099-8d4a4723a490?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    name: "Carol Lee",
    preferredName: "Carol",
    nric: "Sxxxx789C",
    status: "Inactive",
    startDate: "15 Aug 2022",
    endDate: "15 Feb 2023",
    inactiveDate: "16 Feb 2023",
    supervisorId: 1,
  },
  {
    id: 4,
    name: "David Tan",
    preferredName: "David",
    nric: "Sxxxx052D",
    status: "Active",
    startDate: "22 Sep 2024",
    endDate: "22 Mar 2025",
    inactiveDate: "",
    supervisorId: 2,
    image:
      "https://images.unsplash.com/photo-1509399693673-755307bfc4e1?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    name: "Eva Wong",
    preferredName: "Eva",
    nric: "Sxxxx343E",
    status: "Active",
    startDate: "05 Oct 2024",
    endDate: "05 Apr 2025",
    inactiveDate: "",
    supervisorId: 1,
  },
  {
    id: 6,
    name: "Liam Smith",
    preferredName: "Liam",
    nric: "Sxxxx223A",
    status: "Active",
    startDate: "12 Oct 2024",
    endDate: "12 Apr 2025",
    inactiveDate: "",
    supervisorId: 1,
    image:
      "https://images.unsplash.com/photo-1498558263790-a9555e3d002d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 7,
    name: "Ava Johnson",
    preferredName: "Ava",
    nric: "Sxxxx426B",
    status: "Active",
    startDate: "19 Oct 2024",
    endDate: "19 Apr 2025",
    inactiveDate: "",
    supervisorId: 1,
  },
  {
    id: 8,
    name: "Ethan Brown",
    preferredName: "Ethan",
    nric: "Sxxxx989C",
    status: "Active",
    startDate: "26 Oct 2024",
    endDate: "26 Apr 2025",
    inactiveDate: "",
    supervisorId: 2,
  },
  {
    id: 9,
    name: "Olivia Davis",
    preferredName: "Olivia",
    nric: "Sxxxx012D",
    status: "Active",
    startDate: "02 Nov 2024",
    endDate: "02 May 2025",
    inactiveDate: "",
    supervisorId: 1,
  },
  {
    id: 10,
    name: "Jamie Oliver",
    preferredName: "Jamie",
    nric: "Sxxxx415D",
    status: "Active",
    startDate: "02 Nov 2024",
    endDate: "02 May 2025",
    inactiveDate: "",
    supervisorId: 1,
  },
  {
    id: 11,
    name: "John Cena",
    preferredName: "John",
    nric: "Sxxxx512F",
    status: "Active",
    startDate: "02 Nov 2024",
    endDate: "02 May 2025",
    inactiveDate: "",
    supervisorId: 1,
  },
];

const getPatientNameList = (): string[] => {
  return mockPatientTDList.map((patient) => patient.name);
};

export const mockPatientNameList = getPatientNameList();
