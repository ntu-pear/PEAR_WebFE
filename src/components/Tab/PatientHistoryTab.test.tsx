import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import PatientHistoryTab from "./PatientHistoryTab";
import { fetchPatientHistory } from "@/api/logger/patientHistory";
import { useViewPatient } from "@/hooks/patient/useViewPatient";

jest.mock("../ui/tabs", () => ({
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock("@/hooks/patient/useViewPatient", () => ({ useViewPatient: jest.fn() }));
jest.mock("@/api/logger/patientHistory", () => ({ fetchPatientHistory: jest.fn() }));
jest.mock("@/components/auditLogs/ChangeDetails", () => ({ __esModule: true, default: () => null }));

const mockFetch = fetchPatientHistory as jest.Mock;
const mockHook = useViewPatient as jest.Mock;

const log = (message: string, timestamp: any) => ({
  id: message,
  timestamp,
  user: "u",
  user_full_name: "User",
  method: "UPDATE",
  log_type: "Patient",
  message,
});
const ok = (logs: any[], totalPages = 1) => ({
  status: "ok",
  data: { data: logs, totalPages },
});

describe("PatientHistoryTab", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockHook.mockReturnValue({ id: "1" });
  });

  it("renders '-' for invalid or missing timestamps instead of throwing", async () => {
    mockFetch.mockResolvedValue(ok([log("bad ts", "not-a-date"), log("no ts", undefined)]));
    render(<PatientHistoryTab />);
    expect(await screen.findByText("bad ts")).toBeInTheDocument();
    expect(screen.getByText("no ts")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(2);
  });

  it("resets to page 0 when the patient id changes", async () => {
    mockFetch.mockResolvedValue(ok([log("a", "2026-01-01T10:00:00")], 3));
    const { rerender } = render(<PatientHistoryTab />);
    await screen.findByText("a");
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith("1", 1, 20));
    mockHook.mockReturnValue({ id: "2" });
    rerender(<PatientHistoryTab />);
    await waitFor(() => expect(mockFetch).toHaveBeenLastCalledWith("2", 0, 20));
    expect(mockFetch).not.toHaveBeenCalledWith("2", 1, 20);
  });

  it("ignores a stale response that resolves after a newer one", async () => {
    let resolveOld: (v: any) => void = () => {};
    mockFetch
      .mockImplementationOnce(() => new Promise((r) => (resolveOld = r)))
      .mockResolvedValueOnce(ok([log("new patient", "2026-01-01T10:00:00")]));
    const { rerender } = render(<PatientHistoryTab />);
    mockHook.mockReturnValue({ id: "2" });
    rerender(<PatientHistoryTab />);
    await screen.findByText("new patient");
    await act(async () => {
      resolveOld(ok([log("old patient", "2026-01-01T10:00:00")]));
    });
    expect(screen.queryByText("old patient")).not.toBeInTheDocument();
    expect(screen.getByText("new patient")).toBeInTheDocument();
  });
});
