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

interface Highlight {
  PatientId: number;
  Type: string;
  HighlightJSON: string;
  StartDate: string;
  EndDate: string;
  IsDeleted: number;
  Id: number;
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

export const fetchHighlights = async (): Promise<HighlightTableData[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const res = await highlightsAPI.get<Highlight[]>("?require_auth=true", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("GET all Highlights", res.data);

    const highlights: HighlightTableData[] = [];
    const grouped: {
      [id: number]: Omit<HighlightTableData, "id" | "type" | "value">;
    } = {};

    for (const highlight of res.data) {
      const patientId = highlight.PatientId;
      console.log("Processing highlight id", highlight.Id, "HighlightJSON:", highlight.HighlightJSON);


      if (!grouped[patientId]) {
        const {
          name: patientName,
          nric: patientNric,
          profilePicture: patientProfilePicture,
        } = await fetchPatientInfo(patientId);

        // TBD: Replace when caregiver data is available
        const {
          id: caregiverId,
          name: caregiverName,
          nric: caregiverNric,
          profilePicture: caregiverProfilePicture,
        } = mockCaregiverNameList[patientId % mockCaregiverNameList.length];

        grouped[patientId] = {
          patientId,
          patientName,
          patientNric,
          patientProfilePicture,
          caregiverId,
          caregiverName,
          caregiverNric,
          caregiverProfilePicture,
        };
      }

      let parsedHighlight = null;
      try {
        parsedHighlight = JSON.parse(highlight.HighlightJSON);
        console.log("Parsed highlight for id", highlight.Id, parsedHighlight);
      } catch (e) {
        console.error("Failed to parse HighlightJSON for id", highlight.Id, e);
      }

      if (!parsedHighlight) {
        console.warn("Skipping highlight with null parsedHighlight", highlight.Id);
        continue; 
      }
      
      // Push only valid highlights
      highlights.push({
        id: `${patientId}-${highlight.Type}-${highlight.Id}`,
        patientId: grouped[patientId].patientId,
        patientName: grouped[patientId].patientName,
        patientNric: grouped[patientId].patientNric,
        patientProfilePicture: grouped[patientId].patientProfilePicture,
        caregiverId: grouped[patientId].caregiverId,
        caregiverName: grouped[patientId].caregiverName,
        caregiverNric: grouped[patientId].caregiverNric,
        caregiverProfilePicture: grouped[patientId].caregiverProfilePicture,
        type: highlight.Type,
        value: parsedHighlight?.value ?? "", 
        highlightJSON: highlight.HighlightJSON,
        parsedHighlight: parsedHighlight, 
        showPatientDetails: false,
        showCaregiverDetails: false,
        showType: false,
      });
    }

    return highlights.sort((a, b) => {
      if (a.patientName !== b.patientName)
        return a.patientName.localeCompare(b.patientName);
      return a.type.localeCompare(b.type);
    });
  } catch (error) {
    console.error("GET all Highlights", error);
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
