import { buildOpsLogParams, fetchOpsLogs, fetchRequestTrace } from "./opsLogs";

jest.mock("../apiConfig", () => ({ opsLoggerAPI: { get: jest.fn() } }));
const { opsLoggerAPI } = jest.requireMock("../apiConfig");

const page = (data: unknown[]) => ({ data: { data, pageNo: 0, pageSize: 100, totalRecords: data.length, totalPages: 1 } });

beforeEach(() => opsLoggerAPI.get.mockReset());

describe("buildOpsLogParams", () => {
  it("maps filters to the logging service's query names", () => {
    expect(
      buildOpsLogParams(
        "errors",
        { service: "patient", level: "ERROR", requestId: " r1 ", userId: "U5", startDate: "2026-10-14", endDate: "2026-10-15" },
        2,
        20
      )
    ).toEqual({
      pageNo: 2,
      pageSize: 20,
      service: "patient",
      level: "ERROR",
      request_id: "r1",
      user_id: "U5",
      start_date: "2026-10-14T00:00:00",
      end_date: "2026-10-15T23:59:59",
    });
  });

  it("drops blank ids and only sends sensitive for requests", () => {
    expect(buildOpsLogParams("requests", { requestId: "   ", sensitive: true }, 0, 20)).toEqual({
      pageNo: 0,
      pageSize: 20,
      sensitive: "true",
    });
    expect(buildOpsLogParams("errors", { sensitive: true }, 0, 20)).toEqual({ pageNo: 0, pageSize: 20 });
  });
});

describe("fetchOpsLogs", () => {
  it.each([
    ["errors", "/Errors"],
    ["requests", "/Requests"],
    ["auth", "/Auth"],
  ] as const)("%s calls %s", async (kind, path) => {
    opsLoggerAPI.get.mockResolvedValueOnce(page([]));
    const result = await fetchOpsLogs(kind, {}, 0, 20);
    expect(opsLoggerAPI.get).toHaveBeenCalledWith(path, { params: { pageNo: 0, pageSize: 20 } });
    expect(result.status).toBe("ok");
  });

  it("returns unavailable when the endpoint is not deployed yet", async () => {
    opsLoggerAPI.get.mockRejectedValueOnce({ response: { status: 404 } });
    expect(await fetchOpsLogs("errors")).toEqual({ status: "unavailable" });
  });

  it.each([403, 500, 503])("rethrows %s", async (status) => {
    opsLoggerAPI.get.mockRejectedValueOnce({ response: { status } });
    await expect(fetchOpsLogs("auth")).rejects.toBeTruthy();
  });
});

describe("fetchRequestTrace", () => {
  it("queries all three kinds by request id and merges oldest first", async () => {
    opsLoggerAPI.get
      .mockResolvedValueOnce(page([{ timestamp: "2026-10-14T01:00:02Z", ops_type: "error", message: "boom" }]))
      .mockResolvedValueOnce(page([{ timestamp: "2026-10-14T01:00:03Z", ops_type: "request", message: "GET" }]))
      .mockRejectedValueOnce({ response: { status: 404 } });
    const lines = await fetchRequestTrace("abc");
    expect(lines.map((l) => l.message)).toEqual(["boom", "GET"]);
    expect(opsLoggerAPI.get.mock.calls.map((c: unknown[]) => c[0])).toEqual(["/Errors", "/Requests", "/Auth"]);
    expect(opsLoggerAPI.get.mock.calls[0][1]).toEqual({ params: { pageNo: 0, pageSize: 100, request_id: "abc" } });
  });
});
