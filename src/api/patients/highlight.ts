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

  // 👇 ADD THESE TWO LINES J1
  highlightJSON: string;
  parsedHighlight: any;

  showPatientDetails?: boolean;
  showCaregiverDetails?: boolean;
  showType?: boolean;
}

interface HighlightType {
  Value: string;
  IsDeleted: string;
  HighlightTypeID: number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface HighlightTypeList {
  id: number;
  value: string;
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

      // ✅ ADD THIS LINE (this is what you are missing)
      //const parsedHighlight = JSON.parse(highlight.HighlightJSON);
      // ✅ Add parsing here
      let parsedHighlight = null;
      try {
        parsedHighlight = JSON.parse(highlight.HighlightJSON);
        console.log("Parsed highlight for id", highlight.Id, parsedHighlight);
      } catch (e) {
        console.error("Failed to parse HighlightJSON for id", highlight.Id, e);
      }

      // ✅ Skip rows where parsedHighlight is null
      if (!parsedHighlight) {
        console.warn("Skipping highlight with null parsedHighlight", highlight.Id);
        continue; // skip this iteration
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
        value: parsedHighlight?.value ?? "", // use optional chaining
        highlightJSON: highlight.HighlightJSON,
        parsedHighlight: parsedHighlight, // now it is assigned
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

export const fetchHighlightTypes = async (): Promise<HighlightTypeList[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const res = await highlightTypesAPI.get<HighlightType[]>(
      "?require_auth=true",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("GET all Highlight Types", res.data);

    return res.data.reduce<HighlightTypeList[]>((highlights, curr) => {
      if (curr.IsDeleted === "0") {
        return highlights.concat({
          id: curr.HighlightTypeID,
          value: curr.Value,
        });
      }

      return highlights;
    }, []);
  } catch (error) {
    console.error("GET all highlight types", error);
    throw error;
  }
};

export const addHighlightType = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const res = await createHighlightTypesAPI.post(
      "",
      {
        Value: value,
        IsDeleted: "0",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("POST add highlight type", res.data);

    return res.data;
  } catch (error) {
    console.error("POST add highlight type", error);
    throw error;
  }
};

export const updateHighlightType = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const res = await updateHighlightTypesAPI.put(
      `/${id}`,
      {
        Value: value,
        IsDeleted: "0",
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
