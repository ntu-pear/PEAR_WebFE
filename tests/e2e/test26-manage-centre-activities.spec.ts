import { test, expect, Page } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "test.env") });

const frontendUrl = process.env.FRONTEND_URL as string;
const supervisorAccountEmail = process.env.SUPERVISOR_ACCOUNT_EMAIL as string;
const supervisorAccountPassword = process.env.SUPERVISOR_ACCOUNT_PASSWORD as string;

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toISOString().split("T")[0];
}

test("Supervisor: Manage Centre Activities (NEW UI)", async ({ page }) => {

  const activityTitle = "PLAYWRIGHT TEST ACTIVITY";

  // ================= LOGIN =================
  await test.step("Login", async () => {
    await page.goto(frontendUrl);

    await page.getByRole("textbox", { name: "email" }).fill(supervisorAccountEmail);
    await page.getByRole("textbox", { name: "password" }).fill(supervisorAccountPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText("Login successful.")).toBeVisible();
  });

  // ================= NAVIGATE =================
  await test.step("Navigate", async () => {
    await page.goto(`${frontendUrl}/manage-centre-activities`);

    await expect(
      page.getByText("Manage Centre Activities", { exact: true })
    ).toBeVisible();
  });

  // ================= TABLE CHECK =================
  await test.step("Check table", async () => {
    await expect(page.getByRole("table")).toBeVisible();
  });

  // ================= ADD =================
  await test.step("Add activity", async () => {
    await page.getByRole("button", { name: "Add Centre Activity" }).click();

    await expect(page.getByText("Create Centre Activity")).toBeVisible();

    // Select activity
    await page.locator("#activity_id").selectOption({
      label: "PLAYWRIGHT TEST ACTIVITY",
    });

    const today = getToday();
    const tomorrow = getTomorrow();

    // Start Date = today
    await page.locator("#start_date").fill(today);

    // End Date = tomorrow (day after today)
    await page.locator("#end_date").fill(tomorrow);

    // Submit
    const createBtn = page.getByRole("button", { name: "Create" });

    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await expect(page.getByText("Centre Activity created.")).toBeVisible();
  });

  // ================= SEARCH =================
  await test.step("Search activity", async () => {
    await page.getByPlaceholder("Search...").fill(activityTitle);

    const row = page.locator("tbody tr", {
    has: page.locator("td", { hasText: activityTitle }),
    }).first();

    await expect(row).toBeVisible();
    });

  // ================= EDIT =================
  await test.step("Edit activity", async () => {
    const row = page.locator("tbody tr", {
        has: page.locator("td", { hasText: activityTitle }),
    }).first();

    await row.getByRole("button", { name: "Edit" }).click();

    await expect(page.getByText("Edit Activity")).toBeVisible();

    const saveBtn = page.getByRole("button", { name: "Update" });

    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    await expect(page.getByText("Centre Activity updated.")).toBeVisible();
    });

  // ================= DELETE =================
  await test.step("Delete activity", async () => {
    const row = page.locator("tbody tr", {
        has: page.locator("td", { hasText: activityTitle }),
    }).first();

    page.once("dialog", dialog => dialog.accept());

    await row.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Centre Activity Deleted.")).toBeVisible();

    await expect(row).toHaveCount(0);
    });

});