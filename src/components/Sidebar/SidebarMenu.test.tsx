import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: { roleName: "ADMIN" } }),
}));
jest.mock("@/hooks/useFeatureFlags", () => ({
  useAnyFeatureFlag: () => true,
}));

const renderAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SidebarMenu />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole("button"));
};

describe("SidebarMenu active state", () => {
  it("highlights the ops log entry for the current page only", () => {
    renderAt("/admin/ops-logs/errors");
    const active = screen.getByText("Error Logs").closest("a");
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveClass("bg-accent");
    const other = screen.getByText("Request Logs").closest("a");
    expect(other).not.toHaveAttribute("aria-current");
    expect(other).not.toHaveClass("bg-accent");
  });

  it("highlights nothing for a page without a menu entry", () => {
    renderAt("/admin/ops-logs/trace/abc");
    expect(document.querySelector("[aria-current]")).toBeNull();
  });
});