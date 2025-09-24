import { activityAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie, getCurrentUser } from "../users/auth";

// Activity Preference API - Centre Activity Preferences only
export interface CentreActivityPreference {
  id: number;
  centre_activity_id: number;
  patient_id: number;
  is_like: boolean;
  is_deleted: boolean;
  created_date: string;
  modified_date?: string | null;
  created_by_id: string;
  modified_by_id?: string | null;
}

export interface Activity {
  id: number;
  title: string;
  description?: string | null;
  is_deleted: boolean;
  created_date: string;
  modified_date: string;
  created_by_id?: string | null;
  modified_by_id?: string | null;
}

export interface CentreActivity {
  id: number;
  activity_id: number;
  is_compulsory: boolean;
  is_fixed: boolean;
  is_group: boolean;
  start_date: string;
  end_date: string;
  min_duration: number;
  max_duration: number;
  min_people_req: number;
  fixed_time_slots?: string | null;
  is_deleted: boolean;
  created_date: string;
  modified_date?: string | null;
  created_by_id: string;
  modified_by_id?: string | null;
}

const mockPreferences: CentreActivityPreference[] = [
  {
    id: 1, centre_activity_id: 1, patient_id: 123, is_like: true, is_deleted: false,
    created_date: "2024-01-01T00:00:00Z", modified_date: null,
    created_by_id: "admin", modified_by_id: null
  },
  {
    id: 2, centre_activity_id: 3, patient_id: 123, is_like: false, is_deleted: false,
    created_date: "2024-01-01T00:00:00Z", modified_date: null,
    created_by_id: "admin", modified_by_id: null
  },
  {
    id: 3, centre_activity_id: 2, patient_id: 123, is_like: true, is_deleted: false,
    created_date: "2024-01-01T00:00:00Z", modified_date: null,
    created_by_id: "admin", modified_by_id: null
  }
];

// Get ALL activity preferences from all patients
export const getAllCentreActivityPreferences = async (): Promise<CentreActivityPreference[]> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      console.warn("No authentication token found, using mock data");
      return mockPreferences;
    }
    
    const response = await activityAPI.get(
      `/centre_activity_preferences`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Successfully fetched ALL activity preferences:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching ALL activity preferences, using mock data:", error);
    return mockPreferences;
  }
};

// Get activity preferences for a specific patient
export const getCentreActivityPreferences = async (
  patientId: string
): Promise<CentreActivityPreference[]> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      console.warn("No authentication token found, using mock data");
      return mockPreferences;
    }
    
    const response = await activityAPI.get(
      `/centre_activity_preferences/patient/${patientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Successfully fetched activity preferences:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching activity preferences, using mock data:", error);
    return mockPreferences;
  }
};

// Mock data for development/fallback
const mockActivities: Activity[] = [
  { 
    id: 1, 
    title: "MAHJONG", 
    description: "Traditional Chinese tile-based game", 
    is_deleted: false,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: "2024-01-01T00:00:00Z"
  },
  { 
    id: 2, 
    title: "ARTS & CRAFTS", 
    description: "Creative activities and handicrafts", 
    is_deleted: false,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: "2024-01-01T00:00:00Z"
  },
  { 
    id: 3, 
    title: "EXERCISE", 
    description: "Physical fitness activities", 
    is_deleted: false,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: "2024-01-01T00:00:00Z"
  },
  { 
    id: 4, 
    title: "MUSIC THERAPY", 
    description: "Therapeutic music activities", 
    is_deleted: false,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: "2024-01-01T00:00:00Z"
  },
  { 
    id: 5, 
    title: "READING", 
    description: "Reading and literary activities", 
    is_deleted: false,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: "2024-01-01T00:00:00Z"
  }
];

const mockCentreActivities: CentreActivity[] = [
  {
    id: 1, activity_id: 1, is_compulsory: false, is_fixed: false, is_group: true,
    start_date: "2024-01-01", end_date: "2024-12-31", min_duration: 60, max_duration: 120,
    min_people_req: 4, fixed_time_slots: null, is_deleted: false,
    created_date: "2024-01-01T00:00:00Z", modified_date: null,
    created_by_id: "admin", modified_by_id: null
  },
  {
    id: 2, activity_id: 2, is_compulsory: false, is_fixed: false, is_group: false,
    start_date: "2024-01-01", end_date: "2024-12-31", min_duration: 30, max_duration: 90,
    min_people_req: 1, fixed_time_slots: null, is_deleted: false,
    created_date: "2024-01-01T00:00:00Z", modified_date: null,
    created_by_id: "admin", modified_by_id: null
  },
  {
    id: 3, activity_id: 3, is_compulsory: true, is_fixed: true, is_group: true,
    start_date: "2024-01-01", end_date: "2024-12-31", min_duration: 45, max_duration: 60,
    min_people_req: 8, fixed_time_slots: "09:00-10:00,15:00-16:00", is_deleted: false,
    created_date: "2024-01-01T00:00:00Z", modified_date: null,
    created_by_id: "admin", modified_by_id: null
  },
  {
    id: 4, activity_id: 4, is_compulsory: false, is_fixed: false, is_group: true,
    start_date: "2024-01-01", end_date: "2024-12-31", min_duration: 30, max_duration: 60,
    min_people_req: 6, fixed_time_slots: null, is_deleted: false,
    created_date: "2024-01-01T00:00:00Z", modified_date: null,
    created_by_id: "admin", modified_by_id: null
  },
  {
    id: 5, activity_id: 5, is_compulsory: false, is_fixed: false, is_group: false,
    start_date: "2024-01-01", end_date: "2024-12-31", min_duration: 20, max_duration: 45,
    min_people_req: 1, fixed_time_slots: null, is_deleted: false,
    created_date: "2024-01-01T00:00:00Z", modified_date: null,
    created_by_id: "admin", modified_by_id: null
  }
];

// Get all activities
export const getAllActivities = async (): Promise<Activity[]> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      console.warn("No authentication token found, using mock data");
      return mockActivities;
    }
    
    const response = await activityAPI.get("/activities", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Successfully fetched activities:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching activities, using mock data:", error);
    return mockActivities;
  }
};

// Get all centre activities
export const getAllCentreActivities = async (): Promise<CentreActivity[]> => {
  try {

    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      console.warn("No authentication token found, using mock data");
      return mockCentreActivities;
    }
    
    const response = await activityAPI.get("/centre_activities", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Successfully fetched centre activities:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching centre activities, using mock data:", error);
    return mockCentreActivities;
  }
};

// Create new activity preference
export const createActivityPreference = async (
  patientId: number,
  centreActivityId: number,
  isLike: boolean
): Promise<CentreActivityPreference> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await activityAPI.post("/centre_activity_preferences", {
      centre_activity_id: centreActivityId,
      patient_id: patientId,
      is_like: isLike,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating activity preference:", error);
    throw error;
  }
};

// Update activity preference
export const updateActivityPreference = async (
  existingPreference: CentreActivityPreference,
  isLike: boolean
): Promise<CentreActivityPreference> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Get current user to set modified_by_id
    const currentUser = await getCurrentUser();
    
    // Send complete payload including modified_by_id
    const updatePayload = {
      id: existingPreference.id,
      centre_activity_id: existingPreference.centre_activity_id,
      patient_id: existingPreference.patient_id,
      is_like: isLike,
      is_deleted: existingPreference.is_deleted,
      created_date: existingPreference.created_date,
      created_by_id: existingPreference.created_by_id,
      modified_by_id: currentUser.userId.toString() // Backend expects string
    };

    const response = await activityAPI.put(`/centre_activity_preferences/${existingPreference.id}`, updatePayload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating activity preference:", error);
    throw error;
  }
};

// Delete activity preference
export const deleteActivityPreference = async (id: number): Promise<void> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      throw new Error("No authentication token found");
    }

    await activityAPI.delete(`/centre_activity_preferences/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting activity preference:", error);
    throw error;
  }
};
