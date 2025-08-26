import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "test.env") });

const frontendUrl = process.env.FRONTEND_URL as string;
const supervisorAccountEmail = process.env.SUPERVISOR_ACCOUNT_EMAIL as string;
const supervisorAccountPassword = process.env
  .SUPERVISOR_ACCOUNT_PASSWORD as string;

test("Supervisor: View and filter highlights", async ({ page }) => {
  await test.step("Navigate and login to supervisor account", async () => {
    await page.goto(frontendUrl);
    await page
      .getByRole("textbox", { name: "email" })
      .fill(supervisorAccountEmail);
    await page
      .getByRole("textbox", { name: "password" })
      .fill(supervisorAccountPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForResponse((resp) => resp.url().includes("/login")); // wait for login api to return

    await expect(page.getByText("Login successful.")).toBeVisible();
    await expect(
      page.getByRole("heading").filter({ hasText: "Manage Patients" })
    ).toBeVisible();
  });

  await test.step("Navigate to highlights page", async () => {
    await page
      .getByRole("button")
      .filter({ has: page.locator(".lucide-menu") })
      .click();
    await page.getByText("View Highlights").click();
    await expect(
      page.getByRole("heading").filter({ hasText: "Patient Highlights" })
    ).toBeVisible();
  });

  await test.step("Check highlights table visible with data", async () => {
    await expect(page.getByRole("table")).toBeVisible();

    const headers = ["Patient", "Caregiver", "Type", "Value", "Details"];

    for (const header of headers) {
      await expect(page.locator("th", { hasText: header })).toBeVisible();
    }

    const rows = await page.locator("tr").all();
    expect(rows.length).toBeGreaterThan(2);
  });

  await test.step("Filter highlights by patient name", async () => {
    const keyword = "ong";
    await page.getByPlaceholder("Search...").fill(keyword);
    await page.waitForTimeout(2000);
    const cell = await page
      .locator("tr", { hasNot: page.locator("th") })
      .first()
      .getByRole("cell")
      .nth(0)
      .textContent();
    expect(cell).toContain(keyword.toUpperCase());

    await page.getByPlaceholder("Search...").fill(""); // Clear search
  });

  await test.step("Filter highlights by type", async () => {
    const type = "Allergy";
    await page.getByRole("button", { name: "Category" }).click();
    await page.locator("role=menuitemcheckbox", { hasText: type }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(type)).not.toBeVisible();

    const rows = await page.locator("tr", { hasNot: page.locator("th") }).all();
    for (const row of rows) {
      const typeCell = await row.getByRole("cell").nth(2).textContent();
      expect(typeCell).not.toContain(type);
    }
  });

  await test.step("Filter highlights by caregiver", async () => {
    const caregiver = "Emily Wong";
    await page.getByRole("button", { name: "Caregiver" }).click();
    await page.locator("role=menuitemradio", { hasText: caregiver }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(caregiver)).toBeVisible();

    const cell = await page
      .locator("tr", { hasNot: page.locator("th") })
      .first()
      .getByRole("cell")
      .nth(1)
      .textContent();
    expect(cell).toContain(caregiver);
  });
});
