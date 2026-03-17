import { activityLoggerAPI } from "../apiConfig";


export interface ActivityLogBase {
  id?: number;
  timestamp: string;
  method: string;
  table: string;
  user: string;
  user_full_name: string;
  patient_id: number | null;
  patient_full_name?: string;
  entity_id: number | null;
  entity_name?: string;
  original_data: Record<string, any> | null;
  updated_data: Record<string, any> | null;
  message: string;
  role: string | null;
  log_type?: string;
  is_system_config?: boolean;
}

export interface ActivityLogsList {
  data: ActivityLogBase[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

//maybe remove
export interface ActivityLogsTableDataServer {
  logs: ActivityLogBase[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export const fetchActivityLogs = async (
  action: string | null,
  user: string | null,
  userFullName: string | null,
  table: string | null,
  patient: string | null,
  patientFullName: string | null,
  activity: string | null,
  logType: string | null,
  startDate: string | null,
  endDate: string | null,
  timestamp_order: string = "desc",
  pageNo: number = 0,
  pageSize: number = 100
): Promise<ActivityLogsList> => {
  try {
    const params = new URLSearchParams();
    if (action) params.append("action", action);
    if (user) params.append("user", user);
    if (userFullName) params.append("user_full_name", userFullName);
    if (table) params.append("table", table);
    if (patient) params.append("patient", patient);
    if (patientFullName) params.append("patient_full_name", patientFullName);
    if (activity) params.append("activity", activity);
    if (logType) params.append("log_type", logType);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    params.append("timestamp_order", timestamp_order);
    params.append("pageNo", String(pageNo));
    params.append("pageSize", String(pageSize));

    const response = await activityLoggerAPI.get<ActivityLogsList>(`?${params.toString()}`);
    console.log("Activity Logs:", response.data);
    return response.data;
  } catch (error) {
    console.error("GET Activity Logs failed", error);
    throw error;
  }
};

export interface ActivityLogFilters {
  action?: string | null;
  user?: string | null;
  userFullName?: string | null;
  table?: string | null;
  patient?: string | null;
  patientFullName?: string | null;
  activity?: string | null;
  logType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export const exportActivityLogs = async (
  filters: ActivityLogFilters,
  format: "csv" | "json" = "csv"
): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    params.append("export", "true");
    params.append("format", format);
    if (filters.action) params.append("action", filters.action);
    if (filters.user) params.append("user", filters.user);
    if (filters.userFullName) params.append("user_full_name", filters.userFullName);
    if (filters.table) params.append("table", filters.table);
    if (filters.patient) params.append("patient", filters.patient);
    if (filters.patientFullName) params.append("patient_full_name", filters.patientFullName);
    if (filters.activity) params.append("activity", filters.activity);
    if (filters.logType) params.append("log_type", filters.logType);
    if (filters.startDate) params.append("start_date", filters.startDate);
    if (filters.endDate) params.append("end_date", filters.endDate);

    const response = await activityLoggerAPI.get(`/export?${params.toString()}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Export activity logs failed", error);
    throw error;
  }
};