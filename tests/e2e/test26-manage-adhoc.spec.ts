import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "tests/e2e/test.env") });

const frontendUrl = process.env.FRONTEND_URL!;
const email = process.env.SUPERVISOR_ACCOUNT_EMAIL!;
const password = process.env.SUPERVISOR_ACCOUNT_PASSWORD!;

test.describe("Supervisor: Manage Adhoc Activities", () => {
  test("Login, view table, edit and delete adhoc", async ({ page }) => {

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
    await page.goto(`${frontendUrl}/manage-adhoc`);

    await expect(
      page.getByRole("heading", { name: "Manage Adhoc" })
    ).toBeVisible();

    // ================= TABLE LOAD =================
    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    // ================= FIND PLAYWRIGHT TEST ADHOC =================
    const targetRow = table.locator("tbody tr", {
      hasText: "PLAYWRIGHT TEST ACTIVITY",
    }).first();

    await expect(targetRow).toBeVisible();

    // ================= EDIT ADHOC =================
    await targetRow.getByRole("button", { name: "Edit" }).click();

    const editDialog = page.getByRole("dialog", {
      name: /edit adhoc activity/i,
    });

    await expect(editDialog).toBeVisible();

    // Select a different replacement activity (first valid option)
    const select = editDialog.getByRole("combobox");
    await select.selectOption({ index: 1 });

    await editDialog.getByRole("button", { name: "Save" }).click();

    // Allow update to reflect
    await page.waitForTimeout(500);

    // ================= CONSOLE LOG =================
    
    console.log(
    await table.locator("tbody tr").filter({ hasText: "PLAYWRIGHT TEST ACTIVITY" }).count()
    );

    // ================= DELETE ADHOC =================

// Capture a unique identifier from the target row (Last Updated column)
const uniqueTimestamp = await targetRow
  .locator("td")
  .first()
  .innerText();

// ✅ IMPORTANT: Register dialog handler BEFORE clicking
page.once("dialog", dialog => dialog.accept());

// Trigger delete
await targetRow.getByRole("button", { name: "Delete" }).click();

// ✅ Assert that the specific record is gone
await expect(
  table.locator("tbody tr").filter({ hasText: uniqueTimestamp })
).toHaveCount(0);


  });
});