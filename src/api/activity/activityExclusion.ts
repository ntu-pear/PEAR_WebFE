import { activityAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie, getCurrentUser } from "../users/auth";

// Activity Exclusion API - Centre Activity Exclusions
export interface CentreActivityExclusion {
  id: number;
  centre_activity_id: number;
  patient_id: number;
  exclusion_remarks?: string | null;
  start_date: string; // date format
  end_date?: string | null; // date format, optional
  is_deleted: boolean;
  created_date: string;
  modified_date: string;
  created_by_id?: string | null;
  modified_by_id?: string | null;
}

export interface CentreActivityExclusionCreate {
  centre_activity_id: number;
  patient_id: number;
  exclusion_remarks?: string | null;
  start_date: string;
  end_date?: string | null;
}

export interface CentreActivityExclusionUpdate {
  centre_activity_id: number;
  patient_id: number;
  exclusion_remarks?: string | null;
  start_date: string;
  end_date?: string | null;
  id: number;
  is_deleted?: boolean;
  modified_by_id: string;
}

// Mock data for development/fallback
const mockExclusions: CentreActivityExclusion[] = [
  {
    id: 1,
    centre_activity_id: 1,
    patient_id: 123,
    exclusion_remarks: "Patient has mobility issues",
    start_date: "2024-01-01",
    end_date: "2024-01-31",
    is_deleted: false,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: "2024-01-01T00:00:00Z",
    created_by_id: "supervisor1",
    modified_by_id: null
  },
  {
    id: 2,
    centre_activity_id: 3,
    patient_id: 456,
    exclusion_remarks: "Doctor's recommendation - avoid during recovery",
    start_date: "2024-01-15",
    end_date: null, // Indefinite exclusion
    is_deleted: false,
    created_date: "2024-01-15T00:00:00Z",
    modified_date: "2024-01-15T00:00:00Z",
    created_by_id: "supervisor2",
    modified_by_id: null
  }
];

// Get all exclusions
export const getAllCentreActivityExclusions = async (): Promise<CentreActivityExclusion[]> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      console.warn("No authentication token found, using mock data");
      return mockExclusions;
    }
    
    const response = await activityAPI.get(
      `/centre_activity_exclusions/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Successfully fetched exclusions:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching exclusions, using mock data:", error);
    return mockExclusions;
  }
};

// Get exclusion by ID
export const getCentreActivityExclusionById = async (id: number): Promise<CentreActivityExclusion> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const response = await activityAPI.get(
      `/centre_activity_exclusions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching exclusion:", error);
    throw error;
  }
};

// Create new exclusion
export const createCentreActivityExclusion = async (
  exclusionData: CentreActivityExclusionCreate
): Promise<CentreActivityExclusion> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await activityAPI.post("/centre_activity_exclusions/", exclusionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating exclusion:", error);
    throw error;
  }
};

// Update exclusion
export const updateCentreActivityExclusion = async (
  exclusionData: CentreActivityExclusionUpdate
): Promise<CentreActivityExclusion> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Get current user to set modified_by_id
    const currentUser = await getCurrentUser();
    
    const updatePayload = {
      ...exclusionData,
      modified_by_id: currentUser.userId.toString(),
    };

    const response = await activityAPI.put(`/centre_activity_exclusions/`, updatePayload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating exclusion:", error);
    throw error;
  }
};

// Delete exclusion
export const deleteCentreActivityExclusion = async (id: number): Promise<CentreActivityExclusion> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await activityAPI.delete(`/centre_activity_exclusions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting exclusion:", error);
    throw error;
  }
};