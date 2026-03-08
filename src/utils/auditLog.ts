import { AuditLogRecord } from "@/types/auditLog";

export const formatDateTime = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export const formatMethod = (method: string) => {
  switch (method?.toLowerCase()) {
    case "create":
      return "Add";
    case "update":
      return "Update";
    case "delete":
      return "Delete";
    default:
      return method ?? "-";
  }
};

const prettifyKey = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const stringifyValue = (value: unknown) => {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
};

export const buildDescription = (log: AuditLogRecord) => {
  const original = log.original_data ?? {};
  const updated = log.updated_data ?? {};

  const changedKeys = Object.keys(updated).filter((key) => {
    return stringifyValue(original[key]) !== stringifyValue(updated[key]);
  });

  if (changedKeys.length > 0) {
    const changeSummary = changedKeys
      .slice(0, 3)
      .map((key) => {
        const oldValue = stringifyValue(original[key]);
        const newValue = stringifyValue(updated[key]);
        return `${prettifyKey(key)}: ${oldValue} → ${newValue}`;
      })
      .join(" | ");

    return `${log.message} (${changeSummary})`;
  }

  return log.message || "-";
};