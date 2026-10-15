import { act, renderHook } from "@testing-library/react";
import { useSchedulerService, weekStart } from "./useSchedulerService";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/api/scheduler/scheduler", () => ({
  getSchedule: jest.fn(),
  generateAndGetSchedule: jest.fn(),
  regenerateScheduleForSupervisor: jest.fn(),
  convertScheduleToCalendarFormat: jest.fn((rows: { PatientID: number; StartDate: string }[]) =>
    rows.map((r) => ({ id: `${r.PatientID}-${r.StartDate}`, patientId: r.PatientID, date: r.StartDate.split("T")[0] }))
  ),
}));
const api = jest.requireMock("@/api/scheduler/scheduler");

const row = (startDate: string) => ({ PatientID: 1, Name: "Alice", StartDate: startDate, EndDate: startDate });

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 17, 0)); // Thu 15 Oct 2026
  api.getSchedule.mockReset();
  api.generateAndGetSchedule.mockReset();
});
afterEach(() => jest.useRealTimers());

describe("weekStart", () => {
  it("gives the Monday of the week", () => {
    expect(weekStart(new Date(2026, 9, 8))).toBe("2026-10-05"); // Thu
    expect(weekStart(new Date(2026, 9, 5))).toBe("2026-10-05"); // Mon
    expect(weekStart(new Date(2026, 9, 11))).toBe("2026-10-05"); // Sun
  });
});

describe("loadWeek", () => {
  it("adds a past week's saved schedule", async () => {
    api.getSchedule.mockResolvedValue({ Status: "200", Message: "", Data: [row("2026-10-05T00:00:00")] });
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 8)));

    expect(api.getSchedule).toHaveBeenCalledWith("2026-10-05");
    expect(result.current.scheduleData).toHaveLength(1);
    expect(result.current.scheduleData[0].date).toBe("2026-10-05");
  });

  it("keeps only rows from the week asked for", async () => {
    // an older scheduler ignores ?date= and sends this week
    api.getSchedule.mockResolvedValue({ Status: "200", Message: "", Data: [row("2026-10-12T00:00:00")] });
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 8)));

    expect(result.current.scheduleData).toHaveLength(0);
  });

  it("never generates when nothing was saved that week", async () => {
    api.getSchedule.mockResolvedValue({ Status: "404", Message: "No schedules found", Data: "" });
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 8)));

    expect(api.generateAndGetSchedule).not.toHaveBeenCalled();
    expect(result.current.scheduleData).toHaveLength(0);
  });

  it("skips this week and weeks already loaded", async () => {
    api.getSchedule.mockResolvedValue({ Status: "200", Message: "", Data: [row("2026-10-05T00:00:00")] });
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 15)));
    await act(() => result.current.loadWeek(new Date(2026, 9, 6)));
    await act(() => result.current.loadWeek(new Date(2026, 9, 9)));

    expect(api.getSchedule).toHaveBeenCalledTimes(1);
    expect(result.current.scheduleData).toHaveLength(1);
  });

  it("tries again after a failed request", async () => {
    api.getSchedule.mockRejectedValueOnce(new Error("down"))
      .mockResolvedValue({ Status: "200", Message: "", Data: [row("2026-10-05T00:00:00")] });
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 8)));
    await act(() => result.current.loadWeek(new Date(2026, 9, 8)));

    expect(api.getSchedule).toHaveBeenCalledTimes(2);
    expect(result.current.scheduleData).toHaveLength(1);
  });
});
