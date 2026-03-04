import { TableRowData } from "@/components/Table/DataTable"; 
import {
  createHighlightTypesAPI,
  deleteHighlightTypesAPI,
  highlightsAPI,
  highlightTypesAPI,
  updateHighlightTypesAPI,
} from "../apiConfig";
import { mockCaregiverNameList } from "@/mocks/mockHighlightTableData";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { fetchPatientInfo } from "./patients";
import { getUserDetails } from "../users/user";
import { patientsAPI } from "../apiConfig";

interface Highlight {
  PatientId: number;
  Type: string; //old?
  HighlightJSON: string; //old?
  StartDate: string; //old?
  EndDate: string; //old?

   // new backend fields
  HighlightTypeId: number;
  HighlightText: string;
  SourceTable: string;
  SourceRecordId: number;

  highlight_type_name: string;
  highlight_type_code: string;
  source_remarks: string;

  additional_fields?: any;  

  IsDeleted: number;
  Id: number;
  CreatedDate: string;
  ModifiedDate: string; 
  CreatedById: string; 
  ModifiedById: string;
}

export interface HighlightTableData extends TableRowData {
  patientId: number;
  patientName: string;
  patientNric: string;
  patientProfilePicture: string;
  caregiverId: number;
  caregiverName: string;
  caregiverNric: string;
  caregiverProfilePicture: string;
  type: string;
  value: string;

  highlightJSON: string;
  parsedHighlight: any;

  showPatientDetails?: boolean;
  showCaregiverDetails?: boolean;
  showType?: boolean;
}

export interface HighlightType {
  TypeName: string;
  TypeCode: string;
  IsDeleted: string;
  IsEnabled: boolean;
  Description: string;
  Id: number;
  CreatedDate: string;
  ModifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface ViewHighlightTypeList {
  data: HighlightType[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
 //for consistency with supervisor
export interface HighlightTypeList {
  id: number;
  value: string; // what HighlightTable expects to display + select
}

export const fetchHighlights = async (
  showAllPatients: boolean = false
): Promise<HighlightTableData[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const currentUser = await getUserDetails();

    // 1️⃣ Fetch all highlights
    const highlightRes = await highlightsAPI.get<Highlight[]>(
      "?require_auth=true",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    let filteredHighlights = highlightRes.data;

    // 2️⃣ Only filter if supervisor and toggle is false
    if (currentUser.roleName?.toUpperCase() === "SUPERVISOR" && !showAllPatients) {
      const patientRes = await patientsAPI.get(
        `/by-supervisor/${currentUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const supervisorPatientIds = new Set(
        (patientRes.data?.data ?? []).map((p: any) => Number(p.id))
      );

      filteredHighlights = filteredHighlights.filter((h) =>
        supervisorPatientIds.has(Number(h.PatientId))
      );
    }

    // 3️⃣ Map to HighlightTableData (same as your current logic)
    const highlights: HighlightTableData[] = [];

    const uniquePatientIds = [...new Set(filteredHighlights.map((h) => h.PatientId))];
    const patientInfoMap: Record<number, { name: string; nric: string; profilePicture: string }> = {};

    await Promise.all(
      uniquePatientIds.map(async (patientId) => {
        const info = await fetchPatientInfo(patientId);
        patientInfoMap[patientId] = info;
      })
    );

    for (const highlight of filteredHighlights) {
      const patientId = highlight.PatientId;
      const patientInfo = patientInfoMap[patientId];

      const { id: caregiverId, name: caregiverName, nric: caregiverNric, profilePicture: caregiverProfilePicture } =
        mockCaregiverNameList[patientId % mockCaregiverNameList.length];

      const parsedHighlight = highlight.additional_fields ?? null;
      if (!parsedHighlight) continue;

      highlights.push({
        id: `${patientId}-${highlight.highlight_type_code}-${highlight.Id}`,
        patientId,
        patientName: patientInfo?.name ?? "Unknown",
        patientNric: patientInfo?.nric ?? "-",
        patientProfilePicture: patientInfo?.profilePicture ?? "",
        caregiverId,
        caregiverName,
        caregiverNric,
        caregiverProfilePicture,
        type: highlight.highlight_type_name,
        value: highlight.HighlightText ?? "",
        highlightCreatedDate: highlight.CreatedDate ?? "-", // new field
        highlightJSON: JSON.stringify(parsedHighlight),
        parsedHighlight,
        sourceRemarks: highlight.source_remarks ?? "-",
        showPatientDetails: false,
        showCaregiverDetails: false,
        showType: false,
      });
    }

    return highlights.sort((a, b) => {
      if (a.patientName !== b.patientName) return a.patientName.localeCompare(b.patientName);
      return a.type.localeCompare(b.type);
    });
  } catch (error) {
    console.error("fetchHighlights error:", error);
    throw error;
  }
};

export const fetchHighlightTypes = async (): Promise<HighlightType[]> => {
  console.log("ss")
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    console.log("ssdfsdf7854s")
    const res = await highlightTypesAPI.get<HighlightType[]>(
      "",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET all Highlight Types", res.data);

    return res.data;
  } catch (error) {
    console.error("GET all highlight types", error);
    throw error;
  }
};

export const addHighlightType = async (payload: {
  TypeName: string;
  TypeCode: string;
  Description: string;
  IsEnabled: boolean;
}) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const res = await createHighlightTypesAPI.post(
      "",
      {
        TypeName: payload.TypeName,
        TypeCode: payload.TypeCode,
        Description: payload.Description,
        IsEnabled: payload.IsEnabled,
        IsDeleted: "0", // or "0" depending on what backend expects
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("POST add highlight type", res.data);
    return res.data;
  } catch (error) {
    console.error("POST add highlight type", error);
    throw error;
  }
};

export const updateHighlightType = async (id: number, payload: {
    TypeName: string;
    TypeCode: string;
    Description: string;
    IsEnabled: boolean;
  }
) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const res = await updateHighlightTypesAPI.put(
      `/${id}`,
      {
        TypeName: payload.TypeName,
        TypeCode: payload.TypeCode,
        Description: payload.Description,
        IsEnabled: payload.IsEnabled,
        IsDeleted: "0", // or "0" depending on what backend expects
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT update highlight type", res.data);

    return res.data;
  } catch (error) {
    console.error("PUT update highlight type", error);
    throw error;
  }
};

export const deleteHighlightType = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const res = await deleteHighlightTypesAPI.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DELETE highlight type", res.data);

    return res.data;
  } catch (error) {
    console.error("DELETE highlight type", error);
    throw error;
  }
};
