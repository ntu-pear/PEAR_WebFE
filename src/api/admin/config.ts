import { fetchAdminConfigsAPI, updateAdminConfigsAPI } from "@/api/apiConfig"; // wherever you defined it
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";

export type MiscSettings = {
  SESSION_EXPIRE_MINUTES: number;
  MAX_PATIENT_PHOTO: number;
  MAX_ITEMS_TO_RETURN: number;
};

// GET /admin/config
export const getMiscSettings = async (): Promise<MiscSettings> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  const res = await fetchAdminConfigsAPI.get<MiscSettings>("", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(res.data)
  return res.data;
};

// PUT /admin/config
export const updateMiscSettings = async (payload: MiscSettings): Promise<MiscSettings> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  const res = await updateAdminConfigsAPI.put<MiscSettings>("", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};