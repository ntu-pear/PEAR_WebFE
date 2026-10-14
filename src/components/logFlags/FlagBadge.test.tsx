import { render, screen } from "@testing-library/react";
import { FlagBadge, FlagBadges, FLAG_LABELS } from "./FlagBadge";
import type { LogFlag } from "@/types/logFlags";

const critical: LogFlag = { code: "bulk_delete", severity: "critical", reason: "12 deletes by U7 in 10 min" };
const warning: LogFlag = { code: "off_hours", severity: "warning", reason: "Change made at 23:40 SGT" };

describe("FlagBadge", () => {
  it("shows a human label and exposes the reason", () => {
    render(<FlagBadge flag={critical} />);
    expect(screen.getByText("Bulk delete")).toBeInTheDocument();
    expect(screen.getByLabelText("Bulk delete: 12 deletes by U7 in 10 min")).toBeInTheDocument();
  });

  it("styles warning and critical differently", () => {
    const { rerender } = render(<FlagBadge flag={warning} />);
    const warnClass = screen.getByText("Off-hours").className;
    rerender(<FlagBadge flag={critical} />);
    const critClass = screen.getByText("Bulk delete").className;
    expect(warnClass).not.toEqual(critClass);
    expect(critClass).toContain("destructive");
  });

  it("has a label for every code", () => {
    expect(Object.values(FLAG_LABELS)).toEqual([
      "Failed-login burst",
      "Bulk delete",
      "Off-hours",
      "Mass access",
      "Sensitive change",
      "Error spike",
    ]);
  });
});

describe("FlagBadges", () => {
  it("renders nothing for missing or empty flags", () => {
    const { container, rerender } = render(<FlagBadges flags={undefined} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<FlagBadges flags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one badge per flag", () => {
    render(<FlagBadges flags={[critical, warning]} />);
    expect(screen.getByText("Bulk delete")).toBeInTheDocument();
    expect(screen.getByText("Off-hours")).toBeInTheDocument();
  });
});