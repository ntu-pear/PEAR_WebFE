import { centreActivityAvailabilitiesAPI,
        getCurrentUserAPI
} from "@/api/apiConfig";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";

export interface CentreActivityAvailability {
  id: number;
  centre_activity_id: number;
  is_deleted: boolean;
  // is_fixed: boolean; //Commented out, awaiting changes to scheduler service.
  start_date: string;   
  end_date: string;     
  start_time: string;
  end_time: string;
  created_date: string;
  modified_date?: string | null;
  created_by_id: string;
  modified_by_id?: string | null;
  days_of_week: number; 
}

export interface CreateCentreActivityAvailabilityInput {
  centre_activity_id: number;
  start_time: string;
  end_time: string;
  is_everyday: boolean;
  start_date: string; 
  end_date: string;   
  days_of_week?: number; 
  created_by_id?: string; 
}

export interface UpdateCentreActivityAvailabilityInput {
  id: number;
  centre_activity_id: number;
  start_time: string;
  end_time: string;
  start_date: string;      
  end_date: string;        
  days_of_week?: number;   
  is_deleted: boolean;
}

export interface AvailabilityWithTitle extends CentreActivityAvailability {
  activity_title?: string | null;
}

const authHeader = () => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
};

export const getCurrentUser = async () => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await getCurrentUserAPI.get("/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("GET current user", response.data);
    return response.data;
  } catch (error) {
    console.error("GET current user", error);
    throw error;
  }
};

// CRUD
export async function listCentreActivityAvailabilities(params?: {include_deleted?: boolean; skip?: number; limit?: number; }) {
  const res = await centreActivityAvailabilitiesAPI.get<CentreActivityAvailability[]>("/", {
    headers: authHeader(),
    params: {
      include_deleted: params?.include_deleted ?? false,
       skip: params?.skip ?? 0,
      limit: params?.limit ?? 200,
    },
  });
  return res.data;
};

export async function getCentreActivityAvailabilityById(id: number) {
  const res = await centreActivityAvailabilitiesAPI.get<CentreActivityAvailability>(`/${id}`, { headers: authHeader() });
  return res.data;
};

export async function createCentreActivityAvailability(input: CreateCentreActivityAvailabilityInput) {
  const currentUser = await getCurrentUser();

  const payload = {
    centre_activity_id: input.centre_activity_id,
    start_time: input.start_time,
    end_time: input.end_time,
    start_date: input.start_date,   
    end_date: input.end_date,       
    days_of_week: input.days_of_week ?? 0, 
    created_by_id: currentUser.userId.toString(), 
  };

  const res = await centreActivityAvailabilitiesAPI.post<CentreActivityAvailability>(
    "/",
    payload,
    {
      headers: authHeader(),
      params: { is_recurring_everyday: input.is_everyday }
    }
  );

  return res.data;
};


export async function updateCentreActivityAvailability(input: UpdateCentreActivityAvailabilityInput) {
  // Get current user to set modified_by_id
  const currentUser = await getCurrentUser();
  const payload = {
    ...input,
    modified_by_id: currentUser.userId.toString(),
  }
  const res = await centreActivityAvailabilitiesAPI.put<CentreActivityAvailability>("/", payload, { headers: authHeader() });
  return res.data;
};

export async function softDeleteCentreActivityAvailability(id: number) {
  const res = await centreActivityAvailabilitiesAPI.delete<CentreActivityAvailability>(`/${id}`, { headers: authHeader() });
  return res.data;
};

