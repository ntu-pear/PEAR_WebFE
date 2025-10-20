import { LanguageListAPI } from "../apiConfig";
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
    const response = await LanguageListAPI.get<PreferredLanguage[]>("", {
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

export const addLanguageListType = async (value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await LanguageListAPI.post(
      "/add",
      {
        isDeleted: "0",
        value: value,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("POST add language list type", response.data);
    return response.data;
  } catch (error) {
    console.error("POST add language list type", error);
    throw error;
  }
};

export const updateLanguageListType = async (id: number, value: string) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await LanguageListAPI.put(
      "/update",
      {
        isDeleted: "0",
        value: value,
      },
      {
        params: {
          patient_list_language_id: id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT update language list type", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update language list type", error);
    throw error;
  }
};

export const deleteLanguageListType = async (id: number) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  try {
    const response = await LanguageListAPI.delete("/delete", {
      params: {
        patient_list_language_id: id,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DELETE language list type", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE language list type", error);
    throw error;
  }
};
