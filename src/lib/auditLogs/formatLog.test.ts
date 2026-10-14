import { computeChanges, displayLabel, fieldLabel, formatLogValue, isRedundantIdField } from "./formatLog";

describe("fieldLabel", () => {
  it("uses overrides for known keys", () => {
    expect(fieldLabel("PrescriptionListId")).toBe("Prescription");
    expect(fieldLabel("UpdatedDateTime")).toBe("Updated");
  });
  it("keeps SpO2 intact", () => {
    expect(fieldLabel("SpO2")).toBe("SpO2");
  });
  it("ignores inherited object keys when looking up overrides", () => {
    expect(fieldLabel("constructor")).toBe("Constructor");
    expect(fieldLabel("toString")).toBe("To String");
  });
  it("humanises camelCase, PascalCase and snake_case", () => {
    expect(fieldLabel("AdministerTime")).toBe("Administer Time");
    expect(fieldLabel("start_date")).toBe("Start Date");
    expect(fieldLabel("isActive")).toBe("Is Active");
  });
  it("strips a trailing Id/ID/_id when other words remain", () => {
    expect(fieldLabel("DementiaStageId")).toBe("Dementia Stage");
    expect(fieldLabel("patient_id")).toBe("Patient");
    expect(fieldLabel("id")).toBe("ID");
  });
});

describe("formatLogValue", () => {
  it("shows ScheduledTime HHmm values as HH:mm", () => {
    expect(formatLogValue("ScheduledTime", "0800")).toBe("08:00");
    expect(formatLogValue("ScheduledTime", "1400")).toBe("14:00");
    expect(formatLogValue("ScheduledTime", " 1400")).toBe("14:00");
    expect(formatLogValue("ScheduledTime", "800")).toBe("08:00");
  });
  it("leaves other ScheduledTime values unchanged", () => {
    expect(formatLogValue("ScheduledTime", "08:00")).toBe("08:00");
    expect(formatLogValue("ScheduledTime", "morning")).toBe("morning");
    expect(formatLogValue("OtherTime", "0800")).toBe("0800");
  });
  it("shows an em dash for null, undefined and empty string", () => {
    expect(formatLogValue("x", null)).toBe("—");
    expect(formatLogValue("x", undefined)).toBe("—");
    expect(formatLogValue("x", "")).toBe("—");
  });
  it("shows booleans and 0/1 flags as Yes/No", () => {
    expect(formatLogValue("x", true)).toBe("Yes");
    expect(formatLogValue("IsDeleted", "0")).toBe("No");
    expect(formatLogValue("isActive", 1)).toBe("Yes");
  });
  it("keeps 0 for non-flag fields", () => {
    expect(formatLogValue("Dosage", 0)).toBe("0");
  });
  it("formats ISO datetimes and plain dates", () => {
    expect(formatLogValue("StartDate", "2026-10-01T09:05:00")).toBe("01 Oct 2026, 9:05 AM");
    expect(formatLogValue("StartDate", "2026-10-01")).toBe("01 Oct 2026");
  });
  it("renders objects and arrays as compact JSON", () => {
    expect(formatLogValue("x", { a: 1 })).toBe('{"a":1}');
    expect(formatLogValue("x", [1, 2])).toBe("[1,2]");
  });
});

describe("computeChanges", () => {
  it("skips fields that are empty on both sides", () => {
    expect(computeChanges({ A: null, B: "", C: undefined }, { A: "", B: undefined, C: null })).toEqual([]);
  });
  it("keeps real falsy values against empty", () => {
    const changes = computeChanges({ A: null, B: "", C: 1 }, { A: 0, B: false, C: "0" });
    expect(changes.map((c) => [c.field, c.kind])).toEqual([
      ["A", "added"],
      ["B", "added"],
      ["C", "modified"],
    ]);
  });
  it("classifies real falsy values as modified, not added/removed", () => {
    const changes = computeChanges({ IsActive: false, Count: 1 }, { IsActive: true, Count: 0 });
    expect(changes.map((c) => c.kind)).toEqual(["modified", "modified"]);
  });
  it("classifies missing/null as added or removed", () => {
    const changes = computeChanges({ A: null, B: "x" }, { A: "y", B: undefined });
    expect(changes.find((c) => c.field === "A")?.kind).toBe("added");
    expect(changes.find((c) => c.field === "B")?.kind).toBe("removed");
  });
  it("ignores unchanged fields and handles missing sides", () => {
    expect(computeChanges({ A: 1 }, { A: 1 })).toEqual([]);
    expect(computeChanges(null, { A: 1 })[0].kind).toBe("added");
    expect(computeChanges({ A: 1 }, undefined)[0].kind).toBe("removed");
  });
  it("ignores keys recorded on only one side of an update", () => {
    const removed = computeChanges({ A: 1, CreatedDate: "x" }, { A: 2 });
    expect(removed.map((c) => [c.field, c.kind])).toEqual([["A", "modified"]]);
    expect(computeChanges({ A: 1 }, { A: 1, AllergyTypeName: "Shellfish" })).toEqual([]);
  });
  it("attaches a readable label", () => {
    expect(computeChanges({}, { PrescriptionListId: 3 })[0].label).toBe("Prescription");
  });
});

describe("isRedundantIdField", () => {
  it("hides an ID when its name is recorded alongside it", () => {
    const data = { AllergyTypeID: 3, AllergyTypeName: "Shellfish", AllergyRemarks: "x" };
    expect(isRedundantIdField("AllergyTypeID", data)).toBe(true);
    expect(isRedundantIdField("AllergyRemarks", data)).toBe(false);
  });
  it("keeps an ID when the name is missing on any compared side", () => {
    expect(isRedundantIdField("AllergyTypeID", { AllergyTypeID: 3 })).toBe(false);
    expect(
      isRedundantIdField("AllergyTypeID", { AllergyTypeID: 3 }, { AllergyTypeID: 5, AllergyTypeName: "Peanut" })
    ).toBe(false);
  });
  it("maps the dementia type list ID to its name", () => {
    expect(isRedundantIdField("DementiaTypeListId", { DementiaTypeListId: 2, DementiaTypeName: "Alzheimer's" })).toBe(true);
  });
  it("always hides the patient ID, which the log row already names", () => {
    expect(isRedundantIdField("PatientID", {})).toBe(true);
    expect(isRedundantIdField("PatientId", {})).toBe(true);
    expect(isRedundantIdField("id", { id: 1, Name: "x" })).toBe(false);
  });
});

describe("computeChanges hides redundant IDs", () => {
  it("shows the name change but not the ID change when both sides carry names", () => {
    const changes = computeChanges(
      { DementiaStageId: 1, DementiaStageName: "Mild", PatientId: 101 },
      { DementiaStageId: 2, DementiaStageName: "Moderate", PatientId: 101 }
    );
    expect(changes.map((c) => c.field)).toEqual(["DementiaStageName"]);
  });
  it("keeps the ID change when only one side carries the name", () => {
    const changes = computeChanges({ AllergyTypeID: 3 }, { AllergyTypeID: 5, AllergyTypeName: "Peanut" });
    expect(changes.map((c) => c.field)).toEqual(["AllergyTypeID"]);
  });
});

describe("snake_case ID hiding and internal fields", () => {
  it("hides a _id key when its _name sibling is present", () => {
    const data = { created_by_id: "u1", created_by_name: "Alice", remarks: "x" };
    expect(isRedundantIdField("created_by_id", data)).toBe(true);
    expect(isRedundantIdField("created_by_id", { created_by_id: "u1" })).toBe(false);
    expect(isRedundantIdField("remarks", data)).toBe(false);
  });
  it("hides correlation and aggregate IDs always", () => {
    for (const k of ["correlation_id", "correlationId", "aggregate_id", "aggregateId"]) {
      expect(isRedundantIdField(k, {})).toBe(true);
      expect(isRedundantIdField(k)).toBe(true);
    }
  });
  it("drops internal fields from update rows", () => {
    const changes = computeChanges(
      { correlation_id: "a", aggregateId: 1, Remarks: "x" },
      { correlation_id: "b", aggregateId: 2, Remarks: "y" }
    );
    expect(changes.map((c) => c.field)).toEqual(["Remarks"]);
  });
});

describe("displayLabel", () => {
  it("labels a name sibling with its ID's label when the ID is present", () => {
    expect(displayLabel("CreatedByName", { CreatedById: "u", CreatedByName: "A" })).toBe("Created By");
    expect(displayLabel("created_by_name", { created_by_id: "u" })).toBe("Created By");
    expect(displayLabel("AllergyTypeName", { AllergyTypeID: 1 })).toBe("Allergy Type");
    expect(displayLabel("DoctorName", { DoctorId: "d" })).toBe("Doctor");
    expect(displayLabel("DementiaTypeName", { DementiaTypeListId: 2 })).toBe("Dementia Type List");
  });
  it("leaves the label alone without the ID sibling", () => {
    expect(displayLabel("CreatedByName", { CreatedByName: "A" })).toBe("Created By Name");
    expect(displayLabel("Name", { Id: 1 })).toBe("Name");
    expect(displayLabel("Remarks", { RemarksId: 1 })).toBe("Remarks");
  });
  it("is used by computeChanges", () => {
    const changes = computeChanges(
      { CreatedById: "u", CreatedByName: "A" },
      { CreatedById: "v", CreatedByName: "B" }
    );
    expect(changes).toHaveLength(1);
    expect(changes[0].label).toBe("Created By");
  });
});

describe("modifier hiding and label overrides", () => {
  it("hides ModifiedBy fields in update diffs only", () => {
    const upd = computeChanges(
      { A: 1, ModifiedById: "u1", ModifiedByName: "Ann", modified_by_id: "u1" },
      { A: 2, ModifiedById: "u2", ModifiedByName: "Bob", modified_by_id: "u2" }
    );
    expect(upd.map((c) => c.field)).toEqual(["A"]);
    const created = computeChanges(null, { A: 2, ModifiedById: "u2", CreatedById: "u3" });
    expect(created.map((c) => c.field)).toEqual(["A", "ModifiedById", "CreatedById"]);
    const updCreated = computeChanges({ CreatedById: "a" }, { CreatedById: "b" });
    expect(updCreated.map((c) => c.field)).toEqual(["CreatedById"]);
  });

  it("labels second-slot and account fields", () => {
    expect(fieldLabel("guardian2Id")).toBe("Guardian 2");
    expect(fieldLabel("doctor2Name")).toBe("Doctor 2");
    expect(fieldLabel("supervisor2Id")).toBe("Supervisor 2");
    expect(fieldLabel("guardianApplicationUserId")).toBe("Guardian Account");
    expect(fieldLabel("AlbumCategoryListID")).toBe("Album");
    expect(displayLabel("guardian2Name", { guardian2Id: "x" })).toBe("Guardian 2");
    expect(displayLabel("guardianApplicationUserName", { guardianApplicationUserId: "x" })).toBe("Guardian Account");
    expect(displayLabel("AlbumCategoryListName", { AlbumCategoryListID: 1 })).toBe("Album");
  });
});

describe("medication administration entries", () => {
  const created = {
    Id: 99,
    MedicationId: 7,
    MedicationName: "Paracetamol",
    Dosage: "2 tabs",
    AdministerDate: "2026-10-14",
    ScheduledTime: "08:00",
    ActualAdministerTime: "2026-10-14T00:05:00+00:00",
    AdministeredById: "U1",
    AdministeredByName: "Sam Lee",
  };

  it("labels each field readably", () => {
    const rows = computeChanges(null, created).map((c) => [c.label, formatLogValue(c.field, c.newValue)]);
    expect(rows).toEqual(
      expect.arrayContaining([
        ["Medication", "Paracetamol"],
        ["Scheduled Slot", "08:00"],
        ["Dose Date", "14 Oct 2026"],
        ["Given By", "Sam Lee"],
      ])
    );
    expect(rows.map(([label]) => label)).toContain("Given At");
  });

  it("hides IDs that have a name next to them", () => {
    const fields = computeChanges(null, created).map((c) => c.field);
    expect(fields).not.toContain("MedicationId");
    expect(fields).not.toContain("AdministeredById");
  });
});
