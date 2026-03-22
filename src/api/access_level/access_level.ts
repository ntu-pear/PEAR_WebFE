import { toast } from "sonner";
import { accessLevelAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface AccessLevel {
  id: string;
  code: string;
  levelRank: number;
  levelName: string;
  description: string;
  isSystem: boolean;
  isEditable?: boolean;
  isDeletable?: boolean;
  createdById: string;
  createdDate: string;
  modifiedById: string;
  modifiedDate: string;
}

export interface AccessLevelCreateRequest {
  code: string;
  levelRank: number;
  levelName: string;
  description: string;
}

export interface AccessLevelUpdateRequest {
  code?: string;
  levelRank?: number;
  levelName?: string;
  description?: string;
}

const getAuthHeaders = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Token not found");

  return {
    Authorization: `Bearer ${token}`,
  };
};

// If accessLevelAPI baseURL already points to /access-levels,
// then keep all routes as "/"
// If it points to /admin or something higher-level,
// then use "/access-levels" consistently everywhere.
//
// The version below assumes baseURL already points to the access-level resource.
// If not, replace "/" with "/access-levels" and "/:id" with `/access-levels/${id}` everywhere.

export const fetchAccessLevels = async (): Promise<AccessLevel[]> => {
  try {
    const response = await accessLevelAPI.get<AccessLevel[]>("/", {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    toast.error(
      `Failed to fetch access levels. ${
        (error as any).response?.data?.detail || "Unknown error"
      }`
    );
    console.error("Fetch access levels error:", error);
    throw error;
  }
};

export const fetchAccessLevelById = async (
  accessLevelId: string
): Promise<AccessLevel> => {
  try {
    const response = await accessLevelAPI.get<AccessLevel>(`/${accessLevelId}`, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    toast.error(
      `Failed to fetch access level. ${
        (error as any).response?.data?.detail || "Unknown error"
      }`
    );
    console.error("Fetch access level by id error:", error);
    throw error;
  }
};

export const createAccessLevel = async (
  payload: AccessLevelCreateRequest
): Promise<AccessLevel> => {
  try {
    const response = await accessLevelAPI.post<AccessLevel>("/create", payload, {
      headers: getAuthHeaders(),
    });
    console.log(response)
    toast.success("Access level created successfully.");
    return response.data;
  } catch (error) {
    toast.error(
      `Failed to create access level. ${
        (error as any).response?.data?.detail || "Unknown error"
      }`
    );
    console.error("Create access level error:", error);
    throw error;
  }
};

export const updateAccessLevel = async (
  accessLevelId: string,
  payload: AccessLevelUpdateRequest
): Promise<AccessLevel> => {
  try {
    const response = await accessLevelAPI.put<AccessLevel>(
      `/update/${accessLevelId}`,
      payload,
      {
        headers: getAuthHeaders(),
      }
    );

    toast.success("Access level updated successfully.");
    return response.data;
  } catch (error) {
    toast.error(
      `Failed to update access level. ${
        (error as any).response?.data?.detail || "Unknown error"
      }`
    );
    console.error("Update access level error:", error);
    throw error;
  }
};

export const deleteAccessLevel = async (
  accessLevelId: string
): Promise<void> => {
  try {
    await accessLevelAPI.delete(`/delete/${accessLevelId}`, {
      headers: getAuthHeaders(),
    });

    toast.success("Access level deleted successfully.");
  } catch (error) {
    toast.error(
      `Failed to delete access level. ${
        (error as any).response?.data?.detail || "Unknown error"
      }`
    );
    console.error("Delete access level error:", error);
    throw error;
  }
};