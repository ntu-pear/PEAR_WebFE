import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LogDashboard from "./LogDashboard";
import type { LogStats } from "@/api/logger/logStats";

jest.mock("@/api/logger/logStats", () => ({
  LOG_STATS_WINDOWS: ["24h", "7d", "30d"],
  fetchLogStats: jest.fn(),
}));
const { fetchLogStats } = jest.requireMock("@/api/logger/logStats");

// recharts' ResponsiveContainer needs ResizeObserver, which jsdom lacks.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;

// jsdom has no layout, so recharts warns that every chart is 0x0; keep other warnings visible.
const realWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((message?: unknown, ...rest: unknown[]) => {
    if (typeof message === "string" && message.includes("of chart should be greater than 0")) return;
    realWarn(message, ...rest);
  });
});
afterAll(() => jest.restoreAllMocks());

const stats = (overrides: Partial<LogStats> = {}): LogStats => ({
  window: "24h",
  totals: { requests: 1240, errors: 37, failed_logins: 6, sensitive_access: 19, audit_changes: 88, flagged: 3 },
  traffic: [
    { t: "2026-10-14T01:00:00.000Z", service: "patient", requests: 900, errors: 30 },
    { t: "2026-10-14T01:00:00.000Z", service: "user", requests: 340, errors: 7 },
  ],
  top_endpoints: [{ path: "/api/v1/patients/{id}", count: 512, p95_ms: 184.6 }],
  status_mix: { "2xx": 1100, "3xx": 10, "4xx": 93, "5xx": 41 },
  auth: {
    failed_logins_over_time: [{ t: "2026-10-14T02:00:00.000Z", count: 6 }],
    top_accounts: [{ user_id: "u-1", name: "Tan Wei Ming", count: 6 }],
  },
  audit: {
    changes_per_day: [{ t: "2026-10-13T16:00:00.000Z", action: "UPDATE", count: 88 }],
    top_tables: [{ table: "PATIENT", count: 60 }],
    top_actors: [{ user_id: "u-2", name: null, count: 88 }],
  },
  recent_flags: [
    {
      time: "2026-10-14T02:00:00.000Z",
      code: "failed_login_burst",
      severity: "warning",
      reason: "6 failed logins for Tan Wei Ming in 10 min",
      service: "user",
      link_hint: "auth",
    },
    {
      time: "2026-10-14T01:00:00.000Z",
      code: "error_spike",
      severity: "warning",
      reason: "30 errors from patient in 5 min",
      service: "patient",
      link_hint: "errors",
    },
    {
      time: "2026-10-13T20:00:00.000Z",
      code: "bulk_delete",
      severity: "critical",
      reason: "12 deletes by u-9 in 10 min",
      service: null,
      link_hint: "patient",
    },
  ],
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <LogDashboard />
    </MemoryRouter>
  );

beforeEach(() => fetchLogStats.mockReset());

describe("LogDashboard", () => {
  it("shows a skeleton, then the totals for the last 24 hours", async () => {
    fetchLogStats.mockResolvedValueOnce(stats());
    renderPage();
    expect(screen.getByTestId("log-dashboard-skeleton")).toBeInTheDocument();
    expect(fetchLogStats).toHaveBeenCalledWith("24h");

    expect(await screen.findByText("1,240")).toBeInTheDocument();
    expect(screen.getByText("Requests", { selector: "dt" })).toBeInTheDocument();
    expect(screen.getByText("37")).toBeInTheDocument();
    expect(screen.getByText("3% of requests")).toBeInTheDocument();
    expect(screen.getByText("Failed logins", { selector: "dt" })).toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();
    expect(screen.getByText("Audit changes", { selector: "dt" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "3 flagged items: view recent flags" })).toHaveAttribute("href", "#recent-flags");
    expect(screen.getByText("/api/v1/patients/{id}")).toBeInTheDocument();
    expect(screen.getByText("185 ms")).toBeInTheDocument();
    expect(screen.getAllByText("Tan Wei Ming").length).toBeGreaterThan(0);
  });

  it("refetches when the window changes", async () => {
    fetchLogStats.mockResolvedValueOnce(stats()).mockResolvedValueOnce(stats({ window: "7d" }));
    renderPage();
    await screen.findByText("1,240");
    fireEvent.mouseDown(screen.getByRole("tab", { name: "7 days" }));
    await waitFor(() => expect(fetchLogStats).toHaveBeenLastCalledWith("7d"));
    expect(fetchLogStats).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("tab", { name: "7 days" })).toHaveAttribute("aria-selected", "true");
  });

  it("explains a 503 and retries on request", async () => {
    fetchLogStats.mockRejectedValueOnce({ response: { status: 503 } }).mockResolvedValueOnce(stats());
    renderPage();
    expect(await screen.findByText("The log store is not responding")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("1,240")).toBeInTheDocument();
    expect(fetchLogStats).toHaveBeenCalledTimes(2);
  });

  it("shows a generic error for other failures", async () => {
    fetchLogStats.mockRejectedValueOnce(new Error("network"));
    renderPage();
    expect(await screen.findByText("Could not load log statistics")).toBeInTheDocument();
  });

  it("links each recent flag to the log page for its day", async () => {
    fetchLogStats.mockResolvedValueOnce(stats());
    renderPage();
    const flags = await screen.findByRole("region", { name: "Recent flags" });
    expect(within(flags).getByText("6 failed logins for Tan Wei Ming in 10 min")).toBeInTheDocument();
    expect(within(flags).getByLabelText("Failed-login burst: 6 failed logins for Tan Wei Ming in 10 min")).toBeInTheDocument();
    expect(within(flags).getByRole("link", { name: "Auth event logs" })).toHaveAttribute(
      "href",
      "/admin/ops-logs/auth?date=2026-10-14"
    );
    expect(within(flags).getByRole("link", { name: "Error logs" })).toHaveAttribute(
      "href",
      "/admin/ops-logs/errors?date=2026-10-14"
    );
    // 20:00Z is 04:00 the next day in Singapore; patient logs are a supervisor page, so no link.
    expect(within(flags).getByText("Patient logs (supervisor page)")).toBeInTheDocument();
    expect(within(flags).getAllByRole("link")).toHaveLength(2);
  });

  it("says so when nothing was logged", async () => {
    fetchLogStats.mockResolvedValueOnce(
      stats({
        totals: { requests: 0, errors: 0, failed_logins: 0, sensitive_access: 0, audit_changes: 0, flagged: 0 },
        traffic: [],
        recent_flags: [],
      })
    );
    renderPage();
    expect(await screen.findByText("No log activity in the last 24 hours")).toBeInTheDocument();
  });
});
