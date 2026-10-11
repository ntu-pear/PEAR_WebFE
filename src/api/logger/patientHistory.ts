import { loggerAPI } from "../apiConfig";
import type { ViewLogsList } from "./logs";

export type PatientHistoryResult = { status: "ok"; data: ViewLogsList } | { status: "unavailable" };

export async function fetchPatientHistory(
  patientId: string | number,
  pageNo: number = 0,
  pageSize: number = 20
): Promise<PatientHistoryResult> {
  try {
    const response = await loggerAPI.get<ViewLogsList>(`/${patientId}/history`, {
      params: { pageNo, pageSize },
    });
    return { status: "ok", data: response.data };
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 404 || status === 403) return { status: "unavailable" };
    throw error;
  }
}
