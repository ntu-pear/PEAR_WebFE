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

async function fillByLabel(page: Page, labelText: string, value: string) {
  const container = page
    .locator("label", { hasText: labelText })
    .first()
    .locator("xpath=..");
  const control = container.locator("input,textarea").first();
  await control.fill(value);
}

test("Supervisor: Manage Activities (NEW UI)", async ({ page }) => {
  
  // ================= LOGIN =================
  await test.step("Login", async () => {
    await page.goto(frontendUrl);

    await page.getByRole("textbox", { name: "email" }).fill(supervisorAccountEmail);
    await page.getByRole("textbox", { name: "password" }).fill(supervisorAccountPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.waitForResponse((resp) => resp.url().includes("/login"));

    await expect(page.getByText("Login successful.")).toBeVisible();
  });

  // ================= NAVIGATE =================
  await test.step("Navigate to Manage Activities", async () => {
    await page.getByText("Manage Activities").click();

    await expect(
      page.getByRole("heading", { name: "Manage Activities" })
    ).toBeVisible();
  });

  // ================= TABLE CHECK =================
  await test.step("Check table is visible", async () => {
    await expect(page.getByRole("table")).toBeVisible();

    const headers = ["Title", "Description", "Actions"];

    for (const header of headers) {
      await expect(page.locator("th", { hasText: header })).toBeVisible();
    }

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  // ================= SEARCH =================
  await test.step("Search activities", async () => {
    const keyword = "a";

    await page.getByPlaceholder("Search...").fill(keyword);

    await page.waitForTimeout(1000);

    const firstRowText = await page
      .locator("tbody tr")
      .first()
      .textContent();

    expect(firstRowText?.toLowerCase()).toContain(keyword);
  });

  // ================= SEARCH FIELD TOGGLES =================
  await test.step("Toggle search fields", async () => {
    await page.getByRole("button", { name: "Title" }).click();
    await page.getByRole("button", { name: "Description" }).click();
  });

  // ================= FILTER (DELETED) =================
  await test.step("Filter deleted activities", async () => {
    await page.getByRole("button", { name: "Deleted" }).click();

    await page.getByText("All").click();

    await page.waitForTimeout(1000);

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  // ================= ADD ACTIVITY =================
  await test.step("Add activity", async () => {
    await page.getByRole("button", { name: "Add Activity" }).click();

    await expect(
      page.getByRole("heading", { name: "Create Activity" })
    ).toBeVisible();

    const name = "E2E Activity";

    await fillByLabel(page, "Title", name);
    await fillByLabel(page, "Description", "Created via E2E test");

    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Activity created.")).toBeVisible();
  });

  // ================= EDIT =================
  await test.step("Edit activity", async () => {
    const firstRow = page.locator("tbody tr").first();

    await firstRow.getByRole("button", { name: "Edit" }).click();

    await expect(
      page.getByRole("heading", { name: "Edit Activity" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Activity updated.")).toBeVisible();
  });

  // ================= DELETE =================
  await test.step("Delete activity", async () => {
    const firstRow = page.locator("tbody tr").first();

    await firstRow.getByRole("button", { name: "Delete" }).click();

    // native confirm dialog
    page.on("dialog", dialog => dialog.accept());

    await expect(page.getByText("Activity deleted.")).toBeVisible();
  });
});