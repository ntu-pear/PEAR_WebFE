import { fetchLogStats, LOG_STATS_WINDOWS } from "./logStats";

jest.mock("../apiConfig", () => ({ opsLoggerAPI: { get: jest.fn() } }));
const { opsLoggerAPI } = jest.requireMock("../apiConfig");

beforeEach(() => opsLoggerAPI.get.mockReset());

describe("fetchLogStats", () => {
  it("calls /Stats on the logger instance with the window", async () => {
    const payload = { window: "7d", totals: { requests: 1 } };
    opsLoggerAPI.get.mockResolvedValueOnce({ data: payload });
    const result = await fetchLogStats("7d");
    expect(opsLoggerAPI.get).toHaveBeenCalledWith("/Stats", { params: { window: "7d" } });
    expect(result).toBe(payload);
  });

  it("defaults to 24h", async () => {
    opsLoggerAPI.get.mockResolvedValueOnce({ data: {} });
    await fetchLogStats();
    expect(opsLoggerAPI.get).toHaveBeenCalledWith("/Stats", { params: { window: "24h" } });
  });

  it("lets errors propagate so the caller can show an error state", async () => {
    opsLoggerAPI.get.mockRejectedValueOnce(new Error("503"));
    await expect(fetchLogStats("30d")).rejects.toThrow("503");
  });

  it("lists the supported windows", () => {
    expect(LOG_STATS_WINDOWS).toEqual(["24h", "7d", "30d"]);
  });
});