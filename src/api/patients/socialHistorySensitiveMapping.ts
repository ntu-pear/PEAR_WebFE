import { toast } from "sonner";
import { socialHistorySensitiveMappingAPI } from "../apiConfig";

type SocialHistoryMapping = {
  socialHistoryItem: string
  isSensitive: boolean
}

export const fetchSocialHistorySensitiveMapping = async () => {
  try {
    const response = await socialHistorySensitiveMappingAPI.get<SocialHistoryMapping[]>(``);
    console.log("GET Social History Sensitive Mapping", response.data);
    return response.data;
  } catch (error) {
    toast.error(`Failed to fetch social history sensitive mapping. ${(error as { response: { data: { detail: string } } }).response.data.detail}`);
    console.error("GET Patient Social History", error);
    throw error;
  }
};