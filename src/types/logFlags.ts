export type LogFlagCode =
  | "failed_login_burst"
  | "bulk_delete"
  | "off_hours"
  | "mass_access"
  | "sensitive_change"
  | "error_spike";

export type LogFlagSeverity = "warning" | "critical";

export interface LogFlag {
  code: LogFlagCode;
  reason: string;
  severity: LogFlagSeverity;
}