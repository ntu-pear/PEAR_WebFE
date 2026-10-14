import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RequestTrace from "./RequestTrace";

jest.mock("@/api/logger/opsLogs", () => ({ fetchRequestTrace: jest.fn() }));
const { fetchRequestTrace } = jest.requireMock("@/api/logger/opsLogs");

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/ops-logs/trace/:requestId" element={<RequestTrace />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => fetchRequestTrace.mockReset());

describe("RequestTrace", () => {
  it("lists every line for the request id in order", async () => {
    fetchRequestTrace.mockResolvedValueOnce([
      { timestamp: "2026-10-14T01:00:00.000Z", ops_type: "error", message: "boom", exception_type: "KeyError" },
      { timestamp: "2026-10-14T01:00:01.000Z", ops_type: "request", message: "GET", method: "GET", path: "/x", status: 500 },
    ]);
    renderAt("/admin/ops-logs/trace/abc-123");
    expect(await screen.findByText("KeyError: boom")).toBeInTheDocument();
    expect(screen.getByText("GET /x")).toBeInTheDocument();
    expect(screen.getByText("Request abc-123")).toBeInTheDocument();
    expect(fetchRequestTrace).toHaveBeenCalledWith("abc-123");
  });

  it("says so when nothing carries the id", async () => {
    fetchRequestTrace.mockResolvedValueOnce([]);
    renderAt("/admin/ops-logs/trace/nothing");
    expect(await screen.findByText("No log lines carry this request ID.")).toBeInTheDocument();
  });

  it("shows a friendly message on failure", async () => {
    fetchRequestTrace.mockRejectedValueOnce(new Error("down"));
    renderAt("/admin/ops-logs/trace/x");
    expect(await screen.findByText("Could not load this request. Try again later.")).toBeInTheDocument();
  });
});