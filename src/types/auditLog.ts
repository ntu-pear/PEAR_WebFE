export type AuditLogRecord = {
  timestamp: string;
  method: string;
  table: string;
  user: string;
  user_full_name: string;
  patient_id: number | null;
  entity_id: number | null;
  original_data: Record<string, unknown> | null;
  updated_data: Record<string, unknown> | null;
  message: string;
  role: string | null;
};

export type AuditLogApiResponse = {
  data: AuditLogRecord[];
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};