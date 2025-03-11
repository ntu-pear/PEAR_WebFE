import { LanguageListPAI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface PreferredLanguage {
  isDeleted: string;
  value: string;
  id: number;
  createdDate: string;
  modifiedDate: string;
}

export const fetchPreferredLanguageList = async (): Promise<
  PreferredLanguage[]
> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await LanguageListPAI.get<PreferredLanguage[]>("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("GET all preferred language list", response.data);
    return response.data?.sort((a, b) => a.value.localeCompare(b.value));
  } catch (error) {
    console.error("GET all preferred language list", error);
    throw error;
  }
};
