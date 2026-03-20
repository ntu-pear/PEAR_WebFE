import { userLoggerAPI } from "../apiConfig";

export type UserLogType = "auth" | "data";

export interface UserLogBase {
  id?: number;
  timestamp: string;
  method: string;
  table: string;
  user: string;
  user_full_name: string;
  role: string;
  message: string;
  log_type: UserLogType;
  entity_id?: number | null;
  original_data?: Record<string, any> | null;
  updated_data?: Record<string, any> | null;
}

export interface UserLogsList {
  data: UserLogBase[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export const fetchUserLogs = async (
  logType: UserLogType | null,
  action: string | null,
  role: string | null,
  userFullName: string | null,
  startDate: string | null,
  endDate: string | null,
  timestamp_order: string = "desc",
  pageNo: number = 0,
  pageSize: number = 100
): Promise<UserLogsList> => {
  try {
    const params = new URLSearchParams();

    if (logType) params.append("log_type", logType);
    if (action) params.append("action", action);
    if (role) params.append("role", role);
    if (userFullName) params.append("user_full_name", userFullName);
    if (startDate) params.append("start_date", startDate + "T00:00:00");
    if (endDate) params.append("end_date", endDate + "T23:59:59");
    params.append("timestamp_order", timestamp_order);
    params.append("pageNo", String(pageNo));
    params.append("pageSize", String(pageSize));

    const response = await userLoggerAPI.get<UserLogsList>(`?${params.toString()}`);
    console.log("User Logs:", response.data);
    return response.data;
  } catch (error) {
    console.error("GET User Logs failed", error);
    throw error;
  }
};

export interface UserLogFilters {
  logType?: UserLogType | null;
  action?: string | null;
  role?: string | null;
  userFullName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export const exportUserLogs = async (
  filters: UserLogFilters,
  format: "csv" | "json" = "csv"
): Promise<Blob> => {
  try {
    const params = new URLSearchParams();

    params.append("export", "true");
    params.append("format", format);

    if (filters.logType) params.append("log_type", filters.logType);
    if (filters.action) params.append("action", filters.action);
    if (filters.role) params.append("role", filters.role);
    if (filters.userFullName) params.append("user_full_name", filters.userFullName);
    if (filters.startDate) params.append("start_date", filters.startDate);
    if (filters.endDate) params.append("end_date", filters.endDate);

    const response = await userLoggerAPI.get(`/export?${params.toString()}`, {
      responseType: "blob",
    });

    return response.data;
  } catch (error) {
    console.error("Export user logs failed", error);
    throw error;
  }
};