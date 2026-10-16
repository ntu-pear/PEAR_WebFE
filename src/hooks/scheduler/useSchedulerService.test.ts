import { act, renderHook } from "@testing-library/react";
import { useSchedulerService, weekStart } from "./useSchedulerService";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/api/scheduler/scheduler", () => ({
  getSchedule: jest.fn(),
  getSchedulePreview: jest.fn(),
  generateAndGetSchedule: jest.fn(),
  regenerateScheduleForSupervisor: jest.fn(),
  convertScheduleToCalendarFormat: jest.fn((rows: { PatientID: number; StartDate: string }[]) =>
    rows.map((r) => ({ id: `${r.PatientID}-${r.StartDate}`, patientId: r.PatientID, date: r.StartDate.split("T")[0] }))
  ),
}));
const api = jest.requireMock("@/api/scheduler/scheduler");
const { toast } = jest.requireMock("sonner");

const row = (startDate: string) => ({ PatientID: 1, Name: "Alice", StartDate: startDate, EndDate: startDate });

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 17, 0)); // Thu 15 Oct 2026
  api.getSchedule.mockReset();
  api.getSchedulePreview.mockReset();
  api.generateAndGetSchedule.mockReset();
  toast.error.mockClear();
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

describe("next week preview", () => {
  const nothingSaved = { Status: "404", Message: "No schedules found", Data: "" };
  const preview = { Status: "200", Message: "", Preview: true, BuiltAt: "2026-10-15T16:55:00", Data: [row("2026-10-19T00:00:00")] };

  it("shows the preview when next week isn't saved yet", async () => {
    api.getSchedule.mockResolvedValue(nothingSaved);
    api.getSchedulePreview.mockResolvedValue(preview);
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 21)));

    expect(api.getSchedule).toHaveBeenCalledWith("2026-10-19");
    expect(api.getSchedulePreview).toHaveBeenCalledTimes(1);
    expect(result.current.scheduleData).toHaveLength(1);
    expect(result.current.scheduleData[0].isPreview).toBe(true);
    expect(result.current.preview).toEqual({ week: "2026-10-19", builtAt: "2026-10-15T16:55:00" });
  });

  it("uses next week's saved schedule when there is one", async () => {
    api.getSchedule.mockResolvedValue({ Status: "200", Message: "", Data: [row("2026-10-19T00:00:00")] });
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 19)));

    expect(api.getSchedulePreview).not.toHaveBeenCalled();
    expect(result.current.scheduleData[0].isPreview).toBeUndefined();
    expect(result.current.preview).toBeNull();
  });

  it("stays empty without an error when the scheduler has no preview", async () => {
    api.getSchedule.mockResolvedValue(nothingSaved);
    api.getSchedulePreview.mockResolvedValue({ Status: "404", Message: "No preview", Data: [] });
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 21)));

    expect(result.current.scheduleData).toHaveLength(0);
    expect(result.current.preview).toBeNull();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("is only for next week", async () => {
    api.getSchedule.mockResolvedValue(nothingSaved);
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 8)));
    await act(() => result.current.loadWeek(new Date(2026, 9, 28)));

    expect(api.getSchedulePreview).not.toHaveBeenCalled();
  });

  it("tries again after a failed preview", async () => {
    api.getSchedule.mockResolvedValue(nothingSaved);
    api.getSchedulePreview.mockRejectedValueOnce(new Error("HTTP error! status: 503")).mockResolvedValue(preview);
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 21)));
    await act(() => result.current.loadWeek(new Date(2026, 9, 21)));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(api.getSchedulePreview).toHaveBeenCalledTimes(2);
    expect(result.current.scheduleData).toHaveLength(1);
  });

  it("is cleared with the schedule", async () => {
    api.getSchedule.mockResolvedValue(nothingSaved);
    api.getSchedulePreview.mockResolvedValue(preview);
    const { result } = renderHook(() => useSchedulerService());

    await act(() => result.current.loadWeek(new Date(2026, 9, 21)));
    act(() => result.current.clearSchedule());

    expect(result.current.preview).toBeNull();
    expect(result.current.scheduleData).toHaveLength(0);
  });
});
