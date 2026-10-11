import { fireEvent, render, screen } from "@testing-library/react";
import ChangeDetails from "./ChangeDetails";

describe("ChangeDetails", () => {
  it("update shows old/new with readable label and correct badge for falsy values", () => {
    render(
      <ChangeDetails method="UPDATE" originalData={{ IsActive: false }} updatedData={{ IsActive: true }} />
    );
    expect(screen.getByText("Is Active")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("Modified")).toBeInTheDocument();
  });

  it("create shows a single Value column from updated data", () => {
    render(<ChangeDetails method="create" updatedData={{ PrescriptionListId: 3, Dosage: "1 tab" }} />);
    expect(screen.getByText("Value")).toBeInTheDocument();
    expect(screen.queryByText("Old value")).not.toBeInTheDocument();
    expect(screen.getByText("Prescription")).toBeInTheDocument();
  });

  it("delete shows a single Value column from original data", () => {
    render(<ChangeDetails method="DELETE" originalData={{ Remarks: "x" }} />);
    expect(screen.getByText("Remarks")).toBeInTheDocument();
    expect(screen.queryByText("New value")).not.toBeInTheDocument();
  });

  it("shows a neutral line when there is no data (admin redaction)", () => {
    render(<ChangeDetails method="UPDATE" originalData={null} updatedData={null} />);
    expect(screen.getByText("No field details recorded")).toBeInTheDocument();
  });

  it("never renders [object Object] and truncates long values", () => {
    const long = "a".repeat(250);
    render(<ChangeDetails method="UPDATE" originalData={{ Meta: { a: 1 }, Note: "" }} updatedData={{ Meta: { a: 2 }, Note: long }} />);
    expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.getByText(long)).toBeInTheDocument();
  });
});
