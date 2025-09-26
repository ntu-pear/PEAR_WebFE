import { careCentreAPI } from "@/api/apiConfig";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";
import {
  CareCentreResponse,
  CreateCareCentre,
  UpdateCareCentre,
} from "@/types/careCentre";

const authHeader = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
};

const getActorId = (): string | number | null => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) return localStorage.getItem("user_id");
    const [, payloadB64] = token.split(".");
    const json = JSON.parse(atob(payloadB64));
    return json.user_id ?? json.sub ?? json.uid ?? json.id ?? localStorage.getItem("user_id") ?? null;
  } catch {
    return localStorage.getItem("user_id");
  }
};

// CRUD 
export async function listCareCentres(params?: {
  include_deleted?: boolean;
  skip?: number;
  limit?: number;
}): Promise<CareCentreResponse[]> {
  const res = await careCentreAPI.get<CareCentreResponse[]>("/", {
    headers: authHeader(),
    params: {
      include_deleted: params?.include_deleted ?? false,
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 200,
    },
  });
  return res.data;
}

export async function getCareCentreById(id: number): Promise<CareCentreResponse> {
  const res = await careCentreAPI.get<CareCentreResponse>(`/${id}`, { headers: authHeader() });
  return res.data;
}

export async function createCareCentre(input: CreateCareCentre): Promise<CareCentreResponse> {
  const created_by_id = (input as any).created_by_id ?? getActorId() ?? undefined;
  const body = { ...input, created_by_id };
  const res = await careCentreAPI.post<CareCentreResponse>("/", body, { headers: authHeader() });
  return res.data;
}

export async function updateCareCentre(input: UpdateCareCentre): Promise<CareCentreResponse> {
  const headers = authHeader();
  const payload = {
    id: input.id,
    name: input.name,
    country_code: input.country_code,
    address: input.address,
    postal_code: input.postal_code,
    contact_no: input.contact_no,
    email: input.email,
    no_of_devices_avail: input.no_of_devices_avail,
    working_hours: input.working_hours,
    is_deleted: typeof (input as any).is_deleted === "boolean" ? (input as any).is_deleted : false,
    modified_by_id: (input as any).modified_by_id ?? getActorId() ?? undefined,
  };

  const res = await careCentreAPI.put<CareCentreResponse>(`/`, payload, { headers });
  return res.data;
}

export async function softDeleteCareCentre(id: number): Promise<CareCentreResponse> {
  const res = await careCentreAPI.delete<CareCentreResponse>(`/${id}`, { headers: authHeader() });
  return res.data;
}

export async function isCareCentreNameUnique(name: string, excludeId?: number) {
  const all = await listCareCentres({ include_deleted: true, limit: 1000 });
  const t = name.trim().toLowerCase();
  return !all.some((c) => c.name.trim().toLowerCase() === t && c.id !== excludeId);
}