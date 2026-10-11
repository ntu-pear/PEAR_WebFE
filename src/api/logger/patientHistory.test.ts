import { fetchPatientHistory } from "./patientHistory";

jest.mock("../apiConfig", () => ({ loggerAPI: { get: jest.fn() } }));
const { loggerAPI } = jest.requireMock("../apiConfig");

describe("fetchPatientHistory", () => {
  it("calls the per-patient history path with paging", async () => {
    loggerAPI.get.mockResolvedValueOnce({ data: { data: [], pageNo: 0, pageSize: 20, totalRecords: 0, totalPages: 0 } });
    const res = await fetchPatientHistory(42, 0, 20);
    expect(loggerAPI.get).toHaveBeenCalledWith("/42/history", { params: { pageNo: 0, pageSize: 20 } });
    expect(res.status).toBe("ok");
  });

  it.each([404, 403])("returns unavailable on %s", async (status) => {
    loggerAPI.get.mockRejectedValueOnce({ response: { status } });
    expect(await fetchPatientHistory(42)).toEqual({ status: "unavailable" });
  });

  it("rethrows other errors", async () => {
    loggerAPI.get.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(fetchPatientHistory(42)).rejects.toBeTruthy();
  });
});
