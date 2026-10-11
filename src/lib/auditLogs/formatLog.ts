import { format, isValid, parseISO } from "date-fns";

export type ChangeKind = "added" | "removed" | "modified";

export interface FieldChange {
  field: string;
  label: string;
  oldValue: unknown;
  newValue: unknown;
  kind: ChangeKind;
}

const LABEL_OVERRIDES: Record<string, string> = {
  id: "ID",
  SpO2: "SpO2",
  Id: "ID",
  PrescriptionListId: "Prescription",
  UpdatedDateTime: "Updated",
  CreatedDateTime: "Created",
  UpdatedDate: "Updated",
  CreatedDate: "Created",
  ModifiedDate: "Modified",
  IsDeleted: "Deleted",
  isDeleted: "Deleted",
};

const FLAG_KEY = /^(is|has)[A-Z_]|^Is[A-Z]|^Has[A-Z]/;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function fieldLabel(key: string): string {
  if (Object.prototype.hasOwnProperty.call(LABEL_OVERRIDES, key)) return LABEL_OVERRIDES[key];
  const words = key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim()
    .split(/\s+/);
  if (words.length > 1 && /^(id|ID|Id)$/.test(words[words.length - 1])) {
    words.pop();
  }
  return words.map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}

export function isEmptyValue(v: unknown): boolean {
  return v === null || v === undefined || v === "";
}

export function formatLogValue(key: string, value: unknown): string {
  if (isEmptyValue(value)) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (FLAG_KEY.test(key) && (value === 0 || value === 1 || value === "0" || value === "1")) {
    return String(value) === "1" ? "Yes" : "No";
  }
  if (typeof value === "string") {
    if (ISO_DATETIME.test(value)) {
      const d = parseISO(value);
      if (isValid(d)) return format(d, "dd MMM yyyy, h:mm a");
    }
    if (ISO_DATE.test(value)) {
      const d = parseISO(value);
      if (isValid(d)) return format(d, "dd MMM yyyy");
    }
    return value;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function computeChanges(
  original?: Record<string, unknown> | null,
  updated?: Record<string, unknown> | null
): FieldChange[] {
  const before = original ?? {};
  const after = updated ?? {};
  const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
  // UPDATE shape: both sides populated, so only compare fields recorded on both.
  const isUpdate = Object.keys(before).length > 0 && Object.keys(after).length > 0;
  const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  const keys = isUpdate ? allKeys.filter((k) => has(before, k) && has(after, k)) : allKeys;
  const changes: FieldChange[] = [];
  for (const field of keys) {
    const oldValue = before[field];
    const newValue = after[field];
    if (isEmptyValue(oldValue) && isEmptyValue(newValue)) continue;
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;
    const kind: ChangeKind = isEmptyValue(oldValue)
      ? "added"
      : isEmptyValue(newValue)
        ? "removed"
        : "modified";
    changes.push({ field, label: fieldLabel(field), oldValue, newValue, kind });
  }
  return changes;
}
