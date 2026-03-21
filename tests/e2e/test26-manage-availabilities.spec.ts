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

function getNextWeekday() {
  const d = new Date();

  // 0 = Sunday, 6 = Saturday
  const day = d.getDay();

  if (day === 6) {
    // Saturday → add 2 days → Monday
    d.setDate(d.getDate() + 2);
  } else if (day === 0) {
    // Sunday → add 1 day → Monday
    d.setDate(d.getDate() + 1);
  }

  return d.toISOString().split("T")[0];
}
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

    // Recurring = NO
    await page.getByRole("radio", { name: "No" }).check();

    // Select Monday, add this after bug fix
    //await page.locator("input[type='checkbox'][value='1']").check();

    // Dates
    const weekday = getNextWeekday();

    await page.getByLabel("Start Date").fill(weekday);
    await page.getByLabel("End Date").fill(weekday);

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

    // Wait for table refresh
    await page.waitForLoadState("networkidle");
  });

  // ================= SEARCH =================
  await test.step("Search", async () => {

    // 1. Select correct activity FIRST
    await page
      .getByLabel("Select centre activity to schedule:")
      .selectOption({ label: activityTitle });

    // 2. Optional: wait for table refresh
    await page.waitForLoadState("networkidle");

    // 3. Then search (optional, but pointless for this ui)
    //await page.getByPlaceholder("Search...").fill(activityTitle);

    // 4. Assert row
    const row = page.locator("tbody tr").first();

    await expect(row).toBeVisible({ timeout: 10000 });
  });

  // ================= EDIT =================
  await test.step("Edit", async () => {

    
    const row = page.locator("tbody tr").filter({
      hasText: "09:00",
    }).filter({
      hasText: "10:00",
    }).first();

    await expect(row).toBeVisible({ timeout: 10000 });

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
      hasText: "09:00",
    }).first();

    await expect(row).toBeVisible();

    // ✅ Handle confirm dialog
    page.once("dialog", dialog => dialog.accept());

    // Click delete
    await row.getByRole("button", { name: "Delete" }).click();

    // Assert success
    await expect(
      page.getByText("Availability Deleted.")
    ).toBeVisible();
  });

});