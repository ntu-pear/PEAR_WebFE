import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "tests/e2e/test.env") });

const frontendUrl = process.env.FRONTEND_URL!;
const email = process.env.SUPERVISOR_ACCOUNT_EMAIL!;
const password = process.env.SUPERVISOR_ACCOUNT_PASSWORD!;

test.describe("Supervisor: Activity Logs", () => {
  test("Login, view logs, search table", async ({ page }) => {

    // ================= LOGIN =================
    await page.goto(frontendUrl);

    await page
      .getByRole("textbox", { name: "Enter a valid email address." })
      .fill(email);

    await page
      .getByRole("textbox", { name: "Password" })
      .fill(password);

    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText("Login successful.")).toBeVisible();

    // ================= NAVIGATE =================
    await page.goto(`${frontendUrl}/view-activity-logs`);

    await expect(
      page.getByRole("heading", { name: "Activity Logs" })
    ).toBeVisible();

    // ================= TABLE LOAD =================
    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    // ================= SEARCH =================
    const patientSearch = page.getByPlaceholder("Search patient name...");
    await patientSearch.fill("Alice");

    // Apply filters
    await page.getByRole("button", { name: /apply/i }).click();

    // Allow table refresh
    await page.waitForTimeout(500);

    // Validate filtered result
    await expect(
      table.locator("tbody tr").first()
    ).toContainText(/alice/i);
  });
});