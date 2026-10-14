import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OpsLogsPage from "./OpsLogs";

jest.mock("@/api/logger/opsLogs", () => ({ fetchOpsLogs: jest.fn() }));
const { fetchOpsLogs } = jest.requireMock("@/api/logger/opsLogs");

const ok = (data: unknown[]) => ({
  status: "ok",
  data: { data, pageNo: 0, pageSize: 20, totalRecords: data.length, totalPages: data.length ? 1 : 0 },
});

const renderPage = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => fetchOpsLogs.mockReset());

describe("OpsLogsPage", () => {
  it("loads the first page of its kind with no filters", async () => {
    fetchOpsLogs.mockResolvedValueOnce(ok([]));
    renderPage(<OpsLogsPage kind="errors" />);
    await waitFor(() => expect(fetchOpsLogs).toHaveBeenCalledWith("errors", { sensitive: false }, 0, 20));
    expect(await screen.findByText(/only the last 24 hours are shown/)).toBeInTheDocument();
    expect(screen.getByText("Error Logs")).toBeInTheDocument();
  });

  it("the sensitive page asks for requests with the preset", async () => {
    fetchOpsLogs.mockResolvedValueOnce(ok([]));
    renderPage(<OpsLogsPage kind="requests" sensitive />);
    await waitFor(() => expect(fetchOpsLogs).toHaveBeenCalledWith("requests", { sensitive: true }, 0, 20));
    expect(screen.getByText("Sensitive Access")).toBeInTheDocument();
  });

  it("explains when the logging service has no ops endpoints yet", async () => {
    fetchOpsLogs.mockResolvedValueOnce({ status: "unavailable" });
    renderPage(<OpsLogsPage kind="auth" />);
    expect(await screen.findByText(/not available yet/)).toBeInTheDocument();
  });

  it("shows a friendly message when loading fails", async () => {
    fetchOpsLogs.mockRejectedValueOnce({ response: { status: 503 } });
    renderPage(<OpsLogsPage kind="errors" />);
    expect(await screen.findByText("Could not load logs. Try again later.")).toBeInTheDocument();
  });

  it("renders rows with a summary and a short request id", async () => {
    fetchOpsLogs.mockResolvedValueOnce(
      ok([
        {
          timestamp: "2026-10-14T01:00:00.000Z",
          ops_type: "request",
          message: "GET /api/v1/patients/1 -> 200",
          service: "patient",
          method: "GET",
          path: "/api/v1/patients/1",
          status: 200,
          request_id: "0123456789abcdef",
        },
      ])
    );
    renderPage(<OpsLogsPage kind="requests" />);
    expect(await screen.findByText("GET /api/v1/patients/1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "01234567" })).toBeInTheDocument();
  });

  it("shows flag badges on flagged rows and none on others", async () => {
    fetchOpsLogs.mockResolvedValueOnce(
      ok([
        {
          timestamp: "2026-10-14T01:00:00.000Z",
          ops_type: "error",
          message: "boom",
          service: "patient",
          level: "ERROR",
          flags: [{ code: "error_spike", severity: "warning", reason: "25 errors from patient in 5 min" }],
        },
        { timestamp: "2026-10-14T01:01:00.000Z", ops_type: "error", message: "quiet", service: "user", level: "ERROR" },
      ])
    );
    renderPage(<OpsLogsPage kind="errors" />);
    expect(await screen.findByText("Error spike")).toBeInTheDocument();
    expect(screen.getAllByText("Error spike")).toHaveLength(1);
    expect(screen.getByLabelText("Error spike: 25 errors from patient in 5 min")).toBeInTheDocument();
  });});
