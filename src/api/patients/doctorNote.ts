import { formatDateString } from "@/utils/formatDate";
import { doctorNoteAPI } from "../apiConfig";
import { TableRowData } from "@/components/Table/DataTable";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { getDoctorNameById } from "../users/user";

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

export const convertToDoctorNotesTD = async (
  doctorNoteViewList: DoctorNoteViewList
): Promise<DoctorNoteTDServer> => {
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

  const filteredNotes = doctorNoteViewList.data.filter(
    (dn) => dn.isDeleted === "0"
  );

  // Extract all doctorIds from filteredNotes
  const doctorIds = filteredNotes.map((dn) => dn.doctorId);

  //get only unique doctorIds by creating a Set
  const uniqueDoctorIds = [...new Set(doctorIds)];

  // Fetch doctor names concurrently and pair with the original unique doctorId
  const doctorNameResults = await Promise.all(
    uniqueDoctorIds.map(async (doctorId) => {
      try {
        const name = await getDoctorNameById(doctorId.toString());
        return { doctorId: doctorId, doctorName: name };
      } catch (error) {
        console.error(`Error fetching doctor name for ID ${doctorId}`, error);
        return { doctorId: doctorId, doctorName: "-" };
      }
    })
  );

  //convert array of doctorId,doctorName into map
  const doctorNameMap = new Map(
    doctorNameResults.map((dn) => [dn.doctorId, dn.doctorName])
  );

  console.log("doctorNameMap", doctorNameMap);

  const doctorNotesTransformed = filteredNotes.map((dn) => ({
    id: dn.id,
    date: dn.createdDate ? formatDateString(dn.createdDate) : "",
    doctorName: doctorNameMap.get(dn.doctorId.toString()) || "-",
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
    return await convertToDoctorNotesTD(response.data);
  } catch (error) {
    console.error("GET Patient Doctor Notes", error);
    throw error;
  }
};
