import { loggerAPI } from "../apiConfig";
import { activityLoggerAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";
import { AuditLogApiResponse } from "@/types/auditLog";

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
  userFullName?: string | null;
  logType?: string | null;
  patientName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  logTypeCategory?: LogType | null;
  isSystemConfig?: boolean | null;
}

export const fetchAllLogs = async (
  action: string | null,
  userFullName: string | null,
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
    if (userFullName) params.append("user_full_name", userFullName);
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

type FetchAuditLogsParams = {
  pageNo?: number;
  pageSize?: number;
  search?: string;
};

export async function fetchAuditLogs({
  pageNo = 0,
  pageSize = 10,
  search = "",
}: FetchAuditLogsParams): Promise<AuditLogApiResponse> {
  const token = retrieveAccessTokenFromCookie();

  const params: Record<string, string | number> = {
    pageNo,
    pageSize,
  };

  if (search.trim()) {
    params.search = search.trim();
  }

  const response = await activityLoggerAPI.get<AuditLogApiResponse>("", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
}
