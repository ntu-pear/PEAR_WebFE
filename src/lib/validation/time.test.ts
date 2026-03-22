import { validateWorkingHours } from "@/lib/validation/time";
import type { WorkingHours } from "@/types/careCentre";

describe("validateWorkingHours", () => {
  it("rejects if all days are closed", () => {
    const allClosed: WorkingHours = {
      monday: { open: null, close: null },
      tuesday: { open: null, close: null },
      wednesday: { open: null, close: null },
      thursday: { open: null, close: null },
      friday: { open: null, close: null },
      saturday: { open: null, close: null },
      sunday: { open: null, close: null },
    };

    const result = validateWorkingHours(allClosed);
    expect(result.anyError).toBe(true);
    expect(result.byDay.working_hours).toContain("At least one day must have opening and closing hours.");
  });

  it("accepts when at least one day has valid open and close times", () => {
    const oneOpen: WorkingHours = {
      monday: { open: "06:00", close: "19:00" },
      tuesday: { open: null, close: null },
      wednesday: { open: null, close: null },
      thursday: { open: null, close: null },
      friday: { open: null, close: null },
      saturday: { open: null, close: null },
      sunday: { open: null, close: null },
    };

    const result = validateWorkingHours(oneOpen);
    expect(result.anyError).toBe(false);
    expect(result.byDay.working_hours).toBeUndefined();
  });

  it("fails when a reopened day has empty open/close", () => {
    const reopenedEmpty: WorkingHours = {
      monday: { open: "06:00", close: "19:00" },
      tuesday: { open: "", close: "" },
      wednesday: { open: null, close: null },
      thursday: { open: null, close: null },
      friday: { open: null, close: null },
      saturday: { open: null, close: null },
      sunday: { open: null, close: null },
    };

    const result = validateWorkingHours(reopenedEmpty);
    expect(result.anyError).toBe(true);
    expect(result.byDay.tuesday).toContain("Both open and close times are required or mark day as Closed.");
  });
});
