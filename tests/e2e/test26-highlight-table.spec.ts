import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "test.env") });

const frontendUrl = process.env.FRONTEND_URL as string;
const supervisorAccountEmail = process.env.SUPERVISOR_ACCOUNT_EMAIL as string;
const supervisorAccountPassword = process.env.SUPERVISOR_ACCOUNT_PASSWORD as string;

test("Supervisor: View Patient Highlights table", async ({ page }) => {

  // ================= LOGIN =================
  await test.step("Login", async () => {
    await page.goto(frontendUrl);

    await page.getByRole("textbox", { name: "email" }).fill(supervisorAccountEmail);
    await page.getByRole("textbox", { name: "password" }).fill(supervisorAccountPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.waitForResponse(resp => resp.url().includes("/login"));
    await expect(page.getByText("Login successful.")).toBeVisible();
  });

  // ================= NAVIGATE =================
await test.step("Navigate to Highlights page", async () => {
  await page.goto(`${frontendUrl}/view-highlights`);

  await expect(
    page.getByText("Patient Highlights", { exact: true })
  ).toBeVisible();
});

  // ================= TABLE CHECK =================
  await test.step("Highlights table renders with data", async () => {
    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    // ✅ column headers you definitely have
    const headers = [
      "Patient",
      "Caregiver",
      "Starting Date",
      "Type",
      "Highlight Text",
      "Details",
    ];

    for (const header of headers) {
      await expect(
        table.locator("th", { hasText: header })
      ).toBeVisible();
    }

    // ✅ at least 1 row should exist
    const rows = table.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });
});