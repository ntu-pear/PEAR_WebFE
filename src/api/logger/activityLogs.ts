import { activityLoggerAPI } from "../apiConfig";


export interface ActivityLogBase {
  timestamp: string;
  method: string;
  table: string;
  user: string;
  user_full_name: string;
  patient_id: number | null;
  entity_id: number | null;
  original_data: Record<string, any> | null;
  updated_data: Record<string, any> | null;
  message: string;
  role: string | null;
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
  table: string | null,
  startDate: string | null,
  endDate: string | null,
  timestamp_order: string = "desc",
  pageNo: number = 0,
  pageSize: number = 20
): Promise<ActivityLogsList> => {
  try {
    const response = await activityLoggerAPI.get<ActivityLogsList>(
      `?action=${action ?? ""}` +
      `&user=${user ?? ""}` +
      `&table=${table ?? ""}` +
      `&timestamp_order=${timestamp_order}` +
      `&pageNo=${pageNo}` +
      `&pageSize=${pageSize}` +
      `&start_date=${startDate ?? ""}` +
      `&end_date=${endDate ?? ""}`
    );

    console.log("Activity Logs:", response.data);
    return response.data;

  } catch (error) {
    console.error("GET Activity Logs failed", error);
    throw error;
  }
};