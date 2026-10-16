import { render, screen } from "@testing-library/react";
import PatientLogs from "./PatientLogs";
import { fetchAllLogs } from "@/api/logger/logs";

let mockRole = "SUPERVISOR";
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: { roleName: mockRole } }),
}));
jest.mock("@/api/logger/logs", () => ({ fetchAllLogs: jest.fn() }));
jest.mock("@/components/auditLogs/ChangeDetails", () => ({ __esModule: true, default: () => null }));

const mockFetch = fetchAllLogs as jest.Mock;

const page = (message: string, patientName: string | null) => ({
  logs: [
    {
      id: "1",
      timestamp: "2026-10-17T07:55:00",
      patient_id: "1",
      patient_full_name: patientName,
      user: "S85f3847c88b",
      user_full_name: "JESS NG",
      method: "update",
      log_type: "patient_info",
      message,
      original_data: null,
      updated_data: null,
    },
  ],
  pagination: { pageNo: 0, pageSize: 100, totalRecords: 1, totalPages: 1 },
});

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("PatientLogs", () => {
  beforeEach(() => mockFetch.mockReset());

  it("shows descriptions, details and the patient filter to a supervisor", async () => {
    mockRole = "SUPERVISOR";
    mockFetch.mockResolvedValue(page("Updated Patient: TAN AH KOW", "TAN AH KOW"));
    render(<PatientLogs />);
    expect(await screen.findByText("Updated Patient: TAN AH KOW")).toBeInTheDocument();
    expect(screen.getByLabelText("Show change details")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search patient name...")).toBeInTheDocument();
    expect(screen.queryByText(/Admin view/)).not.toBeInTheDocument();
  });

  it("shows an admin the metadata only, with no details toggle or patient filter", async () => {
    mockRole = "ADMIN";
    mockFetch.mockResolvedValue(page("", null));
    render(<PatientLogs />);
    expect(await screen.findByText("Hidden for admins")).toBeInTheDocument();
    expect(screen.getByText(/Admin view/)).toBeInTheDocument();
    expect(screen.getByText("JESS NG")).toBeInTheDocument();
    expect(screen.queryByLabelText("Show change details")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Search patient name...")).not.toBeInTheDocument();
  });
});
