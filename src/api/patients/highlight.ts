import { TableRowData } from "@/components/Table/DataTable";
import { highlightsAPI, highlightTypesAPI } from "../apiConfig";
import { mockHighlightTableData } from "@/mocks/mockHighlightTableData";

interface Highlight {
  PatientId: Number;
  Type: string;
  HighlightJSON: string;
  StartDate: string;
  EndDate: string;
  IsDeleted: Number;
  Id: Number;
  ModifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface HighlightTableData extends TableRowData {
  patientId: Number;
  patientName: string;
  patientNric: string;
  patientProfilePicture: string;
  caregiverId: Number;
  caregiverName: string;
  caregiverNric: string;
  caregiverProfilePicture: string;
  highlights: {
    id: string;
    type: string;
    value: string;
  }[][];
}

interface HighlightType {
  Value: string;
  IsDeleted: string;
  HighlightTypeID: Number;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface HighlightTypeList {
  id: Number;
  value: string;
}

export const fetchHighlights = async (): Promise<HighlightTableData[]> => {
  try {
    const res = await highlightsAPI.get<Highlight[]>("?require_auth=false");
    console.log("GET all Highlights", res.data);

    return mockHighlightTableData;
  } catch (error) {
    console.error("GET all Highlights", error);
    throw error;
  }
};

export const fetchHighlightTypes = async (): Promise<HighlightTypeList[]> => {
  try {
    const res = await highlightTypesAPI.get<HighlightType[]>(
      "?require_auth=false"
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
