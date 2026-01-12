import { loggerAPI } from "../apiConfig";

export interface LogsBase {
  timestamp: string;
  method: string;
  table: string;
  message: string;
  user: string;
  patient_id: number;
  user_full_name: string;
  original_data?: Record<string, any>;
  updated_data?: Record<string, any>;
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
    console.error("patients is not an array", logsPagination.data);
    return {
      logs: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    }; // Return default pagination values
  }

  const UpdatedTD = {
    logs: logsPagination.data,
    pagination: {
      pageNo: logsPagination.pageNo,
      pageSize: logsPagination.pageSize,
      totalRecords: logsPagination.totalRecords,
      totalPages: logsPagination.totalPages,
    },
  };
  console.log("convertToLogsTDServer: ", UpdatedTD);

  return UpdatedTD;
};

export const fetchAllLogs = async (
  action: string,
  user: string | null,
  table: string,
  patient: string | null,
  startDate: string | null,
  endDate: string | null,
  timestamp_order: string = "desc",
  pageNo: number = 0,
  pageSize: number = 10
): Promise<LogsTableDataServer> => {
  try {
    console.log(patient, typeof patient);
    const response = await loggerAPI.get<ViewLogsList>(
      `?patient=${patient}&action=${action}&user=${user}&table=${table}&timestamp_order=${timestamp_order}&pageNo=${pageNo}&pageSize=${pageSize}&start_date=${startDate}&end_date=${endDate}`
    );
    console.log("GET all Patients", response.data);
    return convertToLogsTDServer(response.data);
  } catch (error) {
    console.error("GET all Patients", error);
    throw error;
  }
};
