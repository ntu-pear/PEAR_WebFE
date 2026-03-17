import { systemConfigAPI } from "../apiConfig";

export interface SystemLogBase {
  id?: number;
  timestamp: string;
  method: string;
  table: string;
  user: string;
  user_full_name: string;
  entity_id: number | null;
  entity_name?: string;
  original_data?: Record<string, any>;
  updated_data?: Record<string, any>;
  message: string;
  log_type?: string;
  is_system_config: boolean;
}

export interface SystemLogsList {
  data: SystemLogBase[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export const fetchSystemLogs = async (
  action: string | null,
  user: string | null,
  userFullName: string | null,
  table: string | null,
  entityId: string | null,
  startDate: string | null,
  endDate: string | null,
  timestamp_order: string = "desc",
  pageNo: number = 0,
  pageSize: number = 100
): Promise<SystemLogsList> => {
  try {
    const params = new URLSearchParams();
    if (action) params.append("action", action);
    if (user) params.append("user", user);
    if (userFullName) params.append("user_full_name", userFullName);
    if (table) params.append("table", table);
    if (entityId) params.append("activity", entityId);
    params.append("log_type", "system");
    if (startDate) params.append("start_date", startDate + "T00:00:00");
    if (endDate) params.append("end_date", endDate + "T23:59:59");
    params.append("timestamp_order", timestamp_order);
    params.append("pageNo", String(pageNo));
    params.append("pageSize", String(pageSize));

    const response = await systemConfigAPI.get<SystemLogsList>(`?${params.toString()}`);
    console.log("System Logs:", response.data);
    return response.data;
  } catch (error) {
    console.error("GET System Logs failed", error);
    throw error;
  }
};

export interface SystemLogFilters {
  action?: string | null;
  user?: string | null;
  userFullName?: string | null;
  table?: string | null;
  entityId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};