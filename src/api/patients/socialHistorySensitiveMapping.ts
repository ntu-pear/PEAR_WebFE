import { toast } from "sonner";
import { socialHistorySensitiveMappingAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

type SocialHistoryMapping = {
  socialHistoryItem: string;
  isSensitive: boolean;
};

export const fetchSocialHistorySensitiveMapping = async () => {
  try {
    const response =
      await socialHistorySensitiveMappingAPI.get<SocialHistoryMapping[]>(``);
    console.log("GET Social History Sensitive Mapping", response.data);
    return response.data;
  } catch (error) {
    toast.error(
      `Failed to fetch social history sensitive mapping. ${(error as { response: { data: { detail: string } } }).response.data.detail}`
    );
    console.error("GET Patient Social History", error);
    throw error;
  }
};

export const updateSocialHistorySensitiveMapping = async (
  socialHistoryMappings: { socialHistoryItem: string; isSensitive: boolean }[]
) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");
  try {
    const response =
      await socialHistorySensitiveMappingAPI.put<SocialHistoryMapping>(
        `/update`,
        socialHistoryMappings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    console.log("PUT social history sensitive mapping", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT social history sensitive mapping", error);
    throw error;
  }
};
