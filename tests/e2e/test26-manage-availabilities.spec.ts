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

test("Supervisor: Manage Activity Availability", async ({ page }) => {

  const activityTitle = "PLAYWRIGHT TEST ACTIVITY 2";

  // ================= LOGIN =================
  await test.step("Login", async () => {
    await page.goto(frontendUrl);

    await page.getByRole("textbox", { name: "email" })
      .fill(supervisorAccountEmail);

    await page.getByRole("textbox", { name: "password" })
      .fill(supervisorAccountPassword);

    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText("Login successful.")).toBeVisible();
  });

  // ================= NAVIGATE =================
  await test.step("Navigate", async () => {
    await page.goto(`${frontendUrl}/manage-activity-availabilities`);

    await expect(
      page.getByText("Manage Centre Activity Availability")
    ).toBeVisible();
  });

  // ================= ADD =================
  await test.step("Add availability", async () => {

    await page.getByRole("button", { name: "Add Availability" }).click();

    // Wait for dialog
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // ✅ FIX: select using label (NOT ID, NOT dialog scope issues)
    await page.getByLabel("Select centre activity to").selectOption({
      label: activityTitle,
    });

    // Recurring = YES
    await page.getByRole("radio", { name: "Yes" }).check();

    // Select Monday
    await page.locator("input[type='checkbox'][value='1']").check();

    // Dates
    
    const today = new Date().toISOString().split("T")[0];

    await page.getByLabel("Start Date").fill(today);
    await page.getByLabel("End Date").fill(today);

    // Time (09:00 → 10:00)
    const startTime = page.getByText("Start Time").locator("..");
    const endTime = page.getByText("End Time").locator("..");

    // Start time
    await startTime.locator("select").first().selectOption("09");
    await startTime.locator("select").nth(1).selectOption("00");

    // End time
    await endTime.locator("select").first().selectOption("10");
    await endTime.locator("select").nth(1).selectOption("00");

    // Submit
    await page.getByRole("button", { name: "Create" }).click();

    await expect(
      page.getByText("Centre Activity Availability created.")
    ).toBeVisible();
  });

  // ================= SEARCH =================
  await test.step("Search", async () => {

    await page.getByPlaceholder("Search...").fill(activityTitle);

    const row = page.locator("tbody tr").filter({
      hasText: activityTitle,
    }).first();

    await expect(row).toBeVisible();
  });

  // ================= EDIT =================
  await test.step("Edit", async () => {

    const row = page.locator("tbody tr").filter({
      hasText: activityTitle,
    }).first();

    await expect(row).toBeVisible();

    await row.getByRole("button", { name: "Edit" }).click();

    await expect(page.getByText("Edit Availability")).toBeVisible();

    await page.getByRole("button", { name: "Update" }).click();

    await expect(
      page.getByText("Centre Activity Availability updated.")
    ).toBeVisible();
  });

  // ================= DELETE =================
  await test.step("Delete", async () => {

    const row = page.locator("tbody tr").filter({
      hasText: activityTitle,
    }).first();

    await expect(row).toBeVisible();

    page.once("dialog", dialog => dialog.accept());

    await row.getByRole("button", { name: "Delete" }).click();

    await expect(
      page.getByText("Availability Deleted.")
    ).toBeVisible();
  });

});