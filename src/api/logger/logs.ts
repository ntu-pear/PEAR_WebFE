import { loggerAPI } from "../apiConfig";

export type LogType = "patient" | "system" | "user";

export interface LogsBase {
  id?: number;
  timestamp: string;
  method: string;
  table: string;
  message: string;
  user: string;
  user_full_name: string;
  patient_id: number | null;
  patient_full_name?: string;
  entity_id?: number | null;
  entity_name?: string;
  original_data?: Record<string, any>;
  updated_data?: Record<string, any>;
  log_type?: LogType;
  is_system_config?: boolean;
}

export interface ViewLogsList {
  data: LogsBase[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
export interface LogsTableDataServer {
  logs: LogsBase[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

const convertToLogsTDServer = (
  logsPagination: ViewLogsList
): LogsTableDataServer => {
  if (!Array.isArray(logsPagination.data)) {
    console.error("logs is not an array", logsPagination.data);
    return {
      logs: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    };
  }

  return {
    logs: logsPagination.data,
    pagination: {
      pageNo: logsPagination.pageNo,
      pageSize: logsPagination.pageSize,
      totalRecords: logsPagination.totalRecords,
      totalPages: logsPagination.totalPages,
    },
  };
};

export interface LogFilters {
  action?: string | null;
  caregiver?: string | null;
  logType?: string | null;
  patientName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  logTypeCategory?: LogType | null;
  isSystemConfig?: boolean | null;
}

export const fetchAllLogs = async (
  action: string | null,
  caregiver: string | null,
  logType: string | null,
  patientName: string | null,
  startDate: string | null,
  endDate: string | null,
  timestamp_order: string = "desc",
  pageNo: number = 0,
  pageSize: number = 100,
  logTypeCategory: LogType | null = null,
  isSystemConfig: boolean | null = null
): Promise<LogsTableDataServer> => {
  try {
    const params = new URLSearchParams();
    if (patientName) params.append("patient_full_name", patientName);
    if (action) params.append("action", action);
    if (caregiver) params.append("caregiver", caregiver);
    if (logType) params.append("log_type", logType);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (logTypeCategory) params.append("log_type_category", logTypeCategory);
    if (isSystemConfig !== null) params.append("is_system_config", String(isSystemConfig));
    params.append("timestamp_order", timestamp_order);
    params.append("pageNo", String(pageNo));
    params.append("pageSize", String(pageSize));

    const response = await loggerAPI.get<ViewLogsList>(`?${params.toString()}`);
    return convertToLogsTDServer(response.data);
  } catch (error) {
    console.error("GET Logs failed", error);
    throw error;
  }
};

export const exportLogs = async (
  filters: LogFilters,
  format: "csv" | "json" = "csv"
): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    params.append("export", "true");
    params.append("format", format);
    if (filters.action) params.append("action", filters.action);
    if (filters.caregiver) params.append("caregiver", filters.caregiver);
    if (filters.logType) params.append("log_type", filters.logType);
    if (filters.patientName) params.append("patient_full_name", filters.patientName);
    if (filters.startDate) params.append("start_date", filters.startDate);
    if (filters.endDate) params.append("end_date", filters.endDate);
    if (filters.logTypeCategory) params.append("log_type_category", filters.logTypeCategory);
    if (filters.isSystemConfig !== null) params.append("is_system_config", String(filters.isSystemConfig));

    const response = await loggerAPI.get(`/export?${params.toString()}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Export logs failed", error);
    throw error;
  }
};