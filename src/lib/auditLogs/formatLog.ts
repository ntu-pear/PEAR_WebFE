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
  guardian2Id: "Guardian 2",
  guardian2Name: "Guardian 2",
  doctor2Id: "Doctor 2",
  doctor2Name: "Doctor 2",
  supervisor2Id: "Supervisor 2",
  supervisor2Name: "Supervisor 2",
  guardianApplicationUserId: "Guardian Account",
  guardianApplicationUserName: "Guardian Account",
  AlbumCategoryListID: "Album",
  AlbumCategoryListName: "Album",
  MedicationId: "Medication",
  ScheduledTime: "Scheduled Slot",
  AdministerDate: "Dose Date",
  ActualAdministerTime: "Given At",
  AdministeredById: "Given By",
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

// IDs whose name field is not simply "<prefix>Name".
const ID_NAME_ALIASES: Record<string, string> = {
  DementiaTypeListId: "DementiaTypeName",
};
// The log row already shows the patient, so their ID adds nothing.
const PATIENT_ID_KEYS = new Set(["PatientID", "PatientId", "patientId", "patient_id"]);

// Event plumbing fields that never belong in change details.
const INTERNAL_KEYS = new Set(["correlation_id", "correlationId", "aggregate_id", "aggregateId"]);

// The log row's "Changed by" already shows the actor, so update diffs skip the modifier.
const MODIFIER_KEYS = new Set([
  "ModifiedById",
  "ModifiedByID",
  "modifiedById",
  "modified_by_id",
  "ModifiedByName",
  "modifiedByName",
  "modified_by_name",
]);

const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

function nameKeyFor(key: string): string | null {
  if (has(ID_NAME_ALIASES, key)) return ID_NAME_ALIASES[key];
  if (/.._id$/.test(key)) return `${key.slice(0, -3)}_name`;
  if (/.(ID|Id)$/.test(key)) return `${key.slice(0, -2)}Name`;
  return null;
}

/** True when an ID field is redundant: its name is recorded in every given source. */
export function isRedundantIdField(key: string, ...sources: Record<string, unknown>[]): boolean {
  if (PATIENT_ID_KEYS.has(key) || INTERNAL_KEYS.has(key)) return true;
  const nameKey = nameKeyFor(key);
  if (!nameKey || sources.length === 0) return false;
  return sources.every((s) => has(s, nameKey));
}

/** Label for a field; a name sibling of an ID present in the data takes the ID's label. */
export function displayLabel(key: string, ...sources: Record<string, unknown>[]): string {
  const idKeys: string[] = [];
  for (const [idKey, nameKey] of Object.entries(ID_NAME_ALIASES)) {
    if (nameKey === key) idKeys.push(idKey);
  }
  if (/.._name$/.test(key)) idKeys.push(`${key.slice(0, -5)}_id`);
  else if (/.Name$/.test(key)) idKeys.push(`${key.slice(0, -4)}Id`, `${key.slice(0, -4)}ID`);
  const idKey = idKeys.find((k) => sources.some((s) => has(s, k)));
  return fieldLabel(idKey ?? key);
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
    if (key === "ScheduledTime") {
      const t = value.trim();
      if (/^\d{3,4}$/.test(t)) return `${t.padStart(4, "0").slice(0, 2)}:${t.slice(-2)}`;
    }
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
  // UPDATE shape: both sides populated, so only compare fields recorded on both.
  const isUpdate = Object.keys(before).length > 0 && Object.keys(after).length > 0;
  const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  const keys = (isUpdate
    ? allKeys.filter((k) => has(before, k) && has(after, k) && !MODIFIER_KEYS.has(k))
    : allKeys
  ).filter(
    (k) => !isRedundantIdField(k, ...[before, after].filter((o) => Object.keys(o).length > 0))
  );
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
    changes.push({ field, label: displayLabel(field, before, after), oldValue, newValue, kind });
  }
  return changes;
}
