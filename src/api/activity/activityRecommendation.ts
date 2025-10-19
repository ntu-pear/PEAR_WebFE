import { getDateTimeNowInUTC } from "@/utils/formatDate";
import { activityAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

// Activity Recommendation API - Centre Activity Recommendations only
export interface CentreActivityRecommendation {
  id: number;
  centre_activity_id: number;
  patient_id: number;
  doctor_id: number;
  doctor_recommendation: number; // 1=RECOMMENDED, 0=NEUTRAL, -1=NOT_RECOMMENDED
  doctor_remarks?: string | null;
  is_deleted: boolean;
  created_date: string;
  modified_date?: string | null;
  created_by_id: string;
  modified_by_id?: string | null;
}

export interface CreateActivityRecommendationPayload {
  patientId: number;
  centreActivityId: number;
  doctorId: string;
  doctorRecommendation: number; // 1=RECOMMENDED, 0=NEUTRAL, -1=NOT_RECOMMENDED
  doctorRemarks?: string;
}

export interface UpdateActivityRecommendationPayload {
  patientId: number;
  centreActivityId: number;
  doctorId: string;
  recommendationId: number;
  doctorRecommendation?: number; // 1=RECOMMENDED, 0=NEUTRAL, -1=NOT_RECOMMENDED
  doctorRemarks?: string;
}

// Mock data for development/fallback
const mockRecommendations: CentreActivityRecommendation[] = [
  {
    id: 1,
    centre_activity_id: 1,
    patient_id: 123,
    doctor_id: 1,
    doctor_recommendation: 1, // RECOMMENDED
    doctor_remarks: "Great for cognitive stimulation and memory enhancement",
    is_deleted: false,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: null,
    created_by_id: "doctor1",
    modified_by_id: null,
  },
  {
    id: 2,
    centre_activity_id: 4,
    patient_id: 123,
    doctor_id: 1,
    doctor_recommendation: 1, // RECOMMENDED
    doctor_remarks: "Helps with emotional well-being and social interaction",
    is_deleted: false,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: null,
    created_by_id: "doctor1",
    modified_by_id: null,
  },
  {
    id: 3,
    centre_activity_id: 5,
    patient_id: 123,
    doctor_id: 2,
    doctor_recommendation: 1, // RECOMMENDED
    doctor_remarks: "Recommended for improving focus and concentration",
    is_deleted: false,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: null,
    created_by_id: "doctor2",
    modified_by_id: null,
  },
];

// Get ALL activity recommendations from all patients
export const getAllCentreActivityRecommendations = async (): Promise<
  CentreActivityRecommendation[]
> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      console.warn("No authentication token found, using mock data");
      return mockRecommendations;
    }

    const response = await activityAPI.get(`/centre_activity_recommendations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(
      "Successfully fetched ALL activity recommendations:",
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching ALL activity recommendations, using mock data:",
      error
    );
    return mockRecommendations;
  }
};

// Get activity recommendations for a specific patient
export const getCentreActivityRecommendations = async (
  patientId: string
): Promise<CentreActivityRecommendation[]> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) {
      console.warn("No authentication token found, using mock data");
      return mockRecommendations;
    }

    const response = await activityAPI.get(
      `/centre_activity_recommendations/patient/${patientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(
      "Successfully fetched activity recommendations:",
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching activity recommendations, using mock data:",
      error
    );
    return mockRecommendations;
  }
};

export const getCentreActivityRecommendationById = async (
  recommendationId: string
): Promise<CentreActivityRecommendation> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No authentication token found");

    const response = await activityAPI.get(
      `/centre_activity_recommendations/${recommendationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Successfully fetched activity recommendation:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching activity recommendations, using mock data:",
      error
    );
    throw error;
  }
};

// Create new activity recommendation
export const createActivityRecommendation = async ({
  centreActivityId,
  patientId,
  doctorId,
  doctorRecommendation,
  doctorRemarks,
}: CreateActivityRecommendationPayload): Promise<CentreActivityRecommendation> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await activityAPI.post(
      "/centre_activity_recommendations",
      {
        centre_activity_id: centreActivityId,
        patient_id: patientId,
        doctor_recommendation: doctorRecommendation,
        doctor_remarks: doctorRemarks,
        created_by_id: doctorId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating activity recommendation:", error);
    throw error;
  }
};

// Update activity recommendation
export const updateActivityRecommendation = async ({
  patientId,
  centreActivityId,
  doctorId,
  recommendationId,
  doctorRecommendation,
  doctorRemarks,
}: UpdateActivityRecommendationPayload): Promise<CentreActivityRecommendation> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await activityAPI.put(
      `/centre_activity_recommendations/${recommendationId}`,
      {
        centre_activity_id: centreActivityId,
        patient_id: patientId,
        doctor_recommendation: doctorRecommendation,
        doctor_remarks: doctorRemarks,
        id: recommendationId,
        is_deleted: false,
        modified_by_id: doctorId,
        modified_date: getDateTimeNowInUTC() as string,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating activity recommendation:", error);
    throw error;
  }
};

// Delete activity recommendation
export const deleteActivityRecommendation = async (
  id: number
): Promise<void> => {
  try {
    await activityAPI.delete(`/centre_activity_recommendations/${id}`);
  } catch (error) {
    console.error("Error deleting activity recommendation:", error);
    throw error;
  }
};
