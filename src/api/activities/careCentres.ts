import { careCentreAPI } from "@/api/apiConfig";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";

export type WorkingDay = {
  open: string | null;
  close: string | null;
};

export type WorkingHours = {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
};

export type CareCentre = {
  id: number;
  name: string;
  working_hours: WorkingHours;
  is_deleted: boolean;
};

const authHeader = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
};

export async function listCareCentres() {
  const res = await careCentreAPI.get<CareCentre[]>("/", {
    headers: authHeader(),
    params: { skip: 0, limit: 100, include_deleted: false }
  });
  return res.data;
}
