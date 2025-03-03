import { formatDateString } from "@/utils/formatDate";
import { doctorNoteAPI } from "../apiConfig";
import { TableRowData } from "@/components/Table/DataTable";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface DoctorNote {
  isDeleted: string;
  patientId: number;
  doctorId: number | string;
  doctorRemarks: string;
  id: number;
  createdDate: string;
  modifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

interface DoctorNoteViewList {
  data: DoctorNote[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface DoctorNoteTD extends TableRowData {
  date: string;
  doctorName: string;
  notes: string;
}

export interface DoctorNoteTDServer {
  doctornotes: DoctorNoteTD[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export const convertToDoctorNotesTD = (
  doctorNoteViewList: DoctorNoteViewList
): DoctorNoteTDServer => {
  if (!Array.isArray(doctorNoteViewList.data)) {
    console.error(
      "doctorNoteViewList.data is not an array",
      doctorNoteViewList.data
    );
    return {
      doctornotes: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    };
  }

  const doctorNotesTransformed = doctorNoteViewList.data
    .filter((dn) => dn.isDeleted === "0")
    .map((dn) => ({
      id: dn.id,
      date: dn.createdDate ? formatDateString(dn.createdDate) : "",
      doctorName: dn.doctorId.toString().toUpperCase(), //temporary use doctorId for now
      notes: dn.doctorRemarks || "",
    }));

  const updatedTD = {
    doctornotes: doctorNotesTransformed,
    pagination: {
      pageNo: doctorNoteViewList.pageNo,
      pageSize: doctorNoteViewList.pageSize,
      totalRecords: doctorNoteViewList.totalRecords,
      totalPages: doctorNoteViewList.totalPages,
    },
  };

  console.log("convertToDoctorNotesTD: ", updatedTD);
  return updatedTD;
};

export const fetchDoctorNotes = async (
  patientId: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<DoctorNoteTDServer> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await doctorNoteAPI.get<DoctorNoteViewList>(
      `GetDoctorNotesByPatient?patient_id=${patientId}&pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET Patient Doctor Notes", response.data);
    return convertToDoctorNotesTD(response.data);
  } catch (error) {
    console.error("GET Patient Doctor Notes", error);
    throw error;
  }
};
