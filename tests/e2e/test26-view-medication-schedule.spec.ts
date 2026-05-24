import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "test.env") });

const frontendUrl = process.env.FRONTEND_URL as string;
const email = process.env.SUPERVISOR_ACCOUNT_EMAIL as string;
const password = process.env.SUPERVISOR_ACCOUNT_PASSWORD as string;

test.describe("Supervisor: View Medication Schedule", () => {
  test("Login, view schedule, search patient", async ({ page }) => {

    // ================= LOGIN =================
    await page.goto(frontendUrl);

    await page.getByRole("textbox", { name: "email" }).fill(email);
    await page.getByRole("textbox", { name: "password" }).fill(password);
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText("Login successful.")).toBeVisible();

    // ================= NAVIGATE =================
    await page.goto(`${frontendUrl}/view-medication-schedule`);

    await expect(
      page.getByRole("heading", { name: "View Medication Schedule" })
    ).toBeVisible();

    // ================= TABLE VISIBLE =================
    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    // Ensure at least one row exists
    const rows = table.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    // ================= SEARCH =================
    await page.getByPlaceholder("Search...").fill("alice");

    // Wait briefly for client-side filtering
    await page.waitForTimeout(300);

    // Validate search result
    const filteredRow = table.locator("tbody tr").first();
    await expect(filteredRow).toContainText(/alice/i);
  });
});