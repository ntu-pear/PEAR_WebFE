import { fireEvent, render, screen } from "@testing-library/react";
import OpsLogDetails from "./OpsLogDetails";
import type { OpsLog } from "@/api/logger/opsLogs";

const base: OpsLog = {
  timestamp: "2026-10-14T01:00:00.000Z",
  ops_type: "request",
  message: "GET /api/v1/patients/1 -> 200 (12.5 ms)",
  service: "patient",
  level: "INFO",
  request_id: "rid-1",
};

describe("OpsLogDetails", () => {
  it("request lines show method, path, query, status and duration", () => {
    render(
      <OpsLogDetails
        log={{ ...base, method: "GET", path: "/api/v1/patients/1", query: "mask=false", status: 200, duration_ms: 12.5 }}
      />
    );
    expect(screen.getByText("Method")).toBeInTheDocument();
    expect(screen.getByText("/api/v1/patients/1")).toBeInTheDocument();
    expect(screen.getByText("mask=false")).toBeInTheDocument();
    expect(screen.getByText("12.5")).toBeInTheDocument();
    expect(screen.queryByLabelText("Stack trace")).not.toBeInTheDocument();
  });

  it("error lines show the exception and the stack trace", () => {
    render(
      <OpsLogDetails
        log={{ ...base, ops_type: "error", exception_type: "KeyError", stack_trace: "Traceback (most recent call last):\n  boom" }}
      />
    );
    expect(screen.getByText("KeyError")).toBeInTheDocument();
    expect(screen.getByLabelText("Stack trace")).toHaveTextContent("Traceback (most recent call last):");
    expect(screen.queryByText("Method")).not.toBeInTheDocument();
  });

  it("auth lines show event and reason, and missing values as a dash", () => {
    render(<OpsLogDetails log={{ ...base, ops_type: "auth", event: "login_failed", reason: null, user_id: null }} />);
    expect(screen.getByText("login_failed")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });

  it("request id is a button when a handler is given", () => {
    const onClick = jest.fn();
    render(<OpsLogDetails log={base} onRequestIdClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "rid-1" }));
    expect(onClick).toHaveBeenCalledWith("rid-1");
  });

  it("request id is plain text without a handler", () => {
    render(<OpsLogDetails log={base} />);
    expect(screen.getByText("rid-1")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
