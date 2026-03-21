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
  
  const name = `E2E Activity5 ${Date.now()}-${Math.random()}`;

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
    await page.goto(`${frontendUrl}/manage-activities`);

    await expect(
      page.getByText("Manage Activities", { exact: true })
    ).toBeVisible();
  });

  // ================= TABLE CHECK =================
  await test.step("Check table is visible", async () => {
    await expect(page.getByRole("table")).toBeVisible();

    const headers = ["Title", "Description", "Actions"];

    for (const header of headers) {
      await expect(page.locator("th", { hasText: header })).toBeVisible();
    }
  });

  // ================= ADD ACTIVITY =================
  await test.step("Add activity", async () => {
    await page.getByRole("button", { name: "Add Activity" }).click();

    await expect(
      page.getByRole("heading", { name: "Create Activity" })
    ).toBeVisible();

    await fillByLabel(page, "Title", name);
    await fillByLabel(page, "Description", "Created via E2E test");

    const saveButton = page.getByRole("button", { name: "Save" });

    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    await expect(page.getByText("Activity created.")).toBeVisible();
  });

  // ================= SEARCH =================
  await test.step("Search activities", async () => {
    await page.getByPlaceholder("Search...").fill(name);

    await page.waitForTimeout(1000);

    const row = page.locator("tbody tr").filter({ hasText: name });

    await expect(row).toBeVisible();

    //const titleCell = page.locator("tbody tr").first().locator("td").first();

    //await expect(titleCell).toContainText(name, { ignoreCase: true });

    //expect(firstRowText).toContain(name);
  });

  // ================= EDIT =================
  await test.step("Edit activity", async () => {

    // 🔥 SEARCH FIRST
    await page.getByPlaceholder("Search...").fill(name);
    await page.waitForTimeout(1000);

    const targetRow = page
      .locator("tbody tr")
      .filter({ hasText: name });

    await expect(targetRow).toBeVisible();

    await targetRow.getByRole("button", { name: "Edit" }).click();

    await expect(
      page.getByRole("heading", { name: "Edit Activity" })
    ).toBeVisible();

    const saveButton = page.getByRole("button", { name: "Save" });

    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    await expect(page.getByText("Activity updated.")).toBeVisible();
  });

  // ================= DELETE =================
  await test.step("Delete activity", async () => {

    // 🔥 SEARCH FIRST AGAIN (VERY IMPORTANT)
    await page.getByPlaceholder("Search...").fill(name);
    await page.waitForTimeout(1000);

    const targetRow = page
      .locator("tbody tr")
      .filter({ hasText: name });

    await expect(targetRow).toBeVisible();

    // handle dialog BEFORE clicking
    page.once("dialog", dialog => dialog.accept());

    await targetRow.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Activity deleted.")).toBeVisible();

    // confirm it's gone
    await expect(targetRow).toHaveCount(0);
  });
});