import { formatDateString } from "@/utils/formatDate";
import { doctorNoteAPI } from "../apiConfig";
import { TableRowData } from "@/components/Table/DataTable";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { retrieveStaffNRICName } from "./staffAllocation";

export interface DoctorNote {
  isDeleted: string;
  patientId: number;
  doctorId: string;
  doctorRemarks: string;
  id: number;
  createdDate: string;
  modifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

interface ViewDoctorNote {
  data: DoctorNote;
}

interface DoctorNoteViewList {
  data: DoctorNote[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface DoctorNoteTD extends TableRowData {
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

export interface AddDoctorNoteForm {
  isDeleted: string;
  patientId: number;
  doctorId: string;
  doctorRemarks: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface UpdateDoctorNoteForm {
  isDeleted: string;
  patientId: number;
  doctorId: string;
  doctorRemarks: string;
  ModifiedById: string;
}

export const convertToDoctorNotesTD = async (
  doctorNoteViewList: DoctorNoteViewList,
  roleName: string
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
        const response = await retrieveStaffNRICName(doctorId.toString());
        const name = response.nric_FullName
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
  roleName: string,
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
    return await convertToDoctorNotesTD(response.data, roleName);
  } catch (error) {
    console.error("GET Patient Doctor Notes", error);
    throw error;
  }
};

export const fetchDoctorNoteById = async (
  noteId: number
): Promise<ViewDoctorNote> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await doctorNoteAPI.get<ViewDoctorNote>(
      `?note_id=${noteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET get doctor note", response.data);
    return response.data;
  } catch (error) {
    console.error("GET get doctor note", error);
    throw error;
  }
};

export const addDoctorNote = async (
  formData: AddDoctorNoteForm
): Promise<ViewDoctorNote> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await doctorNoteAPI.post<ViewDoctorNote>(
      "/add",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("POST add doctor note", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add doctor note", error);
    throw error;
  }
};

export const updateDoctorNote = async (
  noteId: number,
  formData: UpdateDoctorNoteForm
): Promise<ViewDoctorNote> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await doctorNoteAPI.put<ViewDoctorNote>(
      `/update?note_id=${noteId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT update doctor note", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update doctor note", error);
    throw error;
  }
};

export const deleteDoctorNote = async (
  noteId: number
): Promise<ViewDoctorNote> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await doctorNoteAPI.delete<ViewDoctorNote>(
      `/delete?note_id=${noteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("DELETE delete doctor note", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE delete doctor note", error);
    throw error;
  }
};
