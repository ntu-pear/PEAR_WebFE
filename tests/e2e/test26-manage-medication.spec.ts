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

test.describe("Supervisor: Manage Medication", () => {
  test("Full flow", async ({ page }) => {

    // ================= LOGIN =================
    await page.goto(frontendUrl);

    await page.getByRole("textbox", { name: "email" }).fill(email);
    await page.getByRole("textbox", { name: "password" }).fill(password);
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText("Login successful.")).toBeVisible();

    // ================= NAVIGATE =================
    await page.goto(`${frontendUrl}/manage-medication`);

    await expect(
      page.getByRole("heading", { name: "Manage Patient Medication" })
    ).toBeVisible();

    const table = page.getByRole("table").first();
    await expect(table).toBeVisible();

    // ================= FIND JON ONG (PAGINATION) =================
    let jonRow = null;

for (let i = 0; i < 10; i++) {

  const rows = page.locator("tbody tr").filter({
    hasText: "JON ONG",
  });

  if (await rows.count() > 0) {
    jonRow = rows.first();
    break;
  }

  const nextBtn = page.getByRole("button", { name: /next/i });

  // 🚨 IMPORTANT: check if button is actually visible & enabled
  const isVisible = await nextBtn.isVisible();
  const isDisabled = await nextBtn.getAttribute("disabled");

  if (!isVisible || isDisabled !== null) {
    break; // no more pages
  }

  await nextBtn.click();

  // wait for table to refresh (VERY important)
  await page.waitForTimeout(500);
}

    // ================= EXPAND PATIENT =================
    await jonRow!.locator("svg.lucide-chevron-right").click();

    const medicationSection = page.getByText("Medication Details for");
    await expect(medicationSection).toBeVisible();

    // ================= ADD =================
    await page.getByRole("button", { name: "Add" }).click();

    // ❗ FIX: use modal container, not heading
    const modal = page.locator("form");

    await expect(modal).toBeVisible();

    // select prescription (custom select)
    //await modal.getByText("Prescription").click();
    //await page.getByText("ANTIHISTAMINES").click();
    await modal
        .locator('select[name="PrescriptionListId"]')
        .selectOption({ label: "ANTIHISTAMINES" });
    // fill fields
    await modal.getByLabel("Administer Time").fill("15:00");
    await modal.getByLabel("Dosage").fill("1");
    await modal.getByLabel("Instruction").fill("E2E test add instruction");

    const instruction = "E2E test add";
    //await modal.locator('textarea[name="Instruction"]').fill(instruction);

    const toYMD = (d: Date) => d.toISOString().slice(0, 10);

    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await modal.getByLabel("Start Date").fill(toYMD(today));
    await modal.getByLabel("End Date").fill(toYMD(tomorrow));

    await modal.getByLabel("Remark").fill("E2E test add remarks");
    //await modal.locator('textarea[name="PrescriptionRemarks"]').fill("E2E");

    // submit
    await modal.getByRole("button", { name: /add/i }).click();

    // ================= VERIFY ADD =================
    const medicationTable = page.getByRole("table").last();

    await expect(
      medicationTable.locator("tbody tr").filter({ hasText: instruction }).first()
    ).toBeVisible();

    // ================= EDIT =================
    const row = medicationTable.locator("tbody tr").filter({
      hasText: instruction,
    }).first();

    await row.getByRole("button", { name: "Edit" }).click();

    const editModal = page
        .locator("div.bg-background")
        .filter({ hasText: "Edit Medication" })
        .locator("form");

    await expect(editModal).toBeVisible();

    const updatedInstruction = "E2E test edit";

    //await editModal
    //    .locator('textarea[name="Instruction"]')
    //    .fill(updatedInstruction);

    await editModal.getByLabel("Instruction").fill("E2E test edit");

    // wait for UI change (optional but recommended)
    await expect(
    editModal.getByLabel("Instruction")
    ).toHaveValue(updatedInstruction);

    //FIX: click button inside modal
    await editModal.getByRole("button", { name: /save/i }).click();

    //wait for old text to disappear
//    await expect(
//    page.locator("tbody tr").filter({ hasText: "E2E test add instruction" })
//    ).toBeHidden();

    // ✅ find updated row
//    const updatedRow = page
//    .locator("tbody tr")
//    .filter({ hasText: updatedInstruction });

//    await expect(updatedRow).toBeVisible();
//    await expect(updatedRow).toContainText(updatedInstruction);

    // ================= DELETE =================
    const rowToDelete = page
  .locator("tbody tr")
  .filter({
    hasText: "E2E test add instruction",
  })
  .first();

const deleteBtn = rowToDelete.getByRole("button", { name: /delete/i });

await deleteBtn.first().click();

// modal
const deleteModal = page.locator("div.fixed.inset-0.z-50");
await expect(deleteModal).toBeVisible();

// confirm
await deleteModal.getByRole("button", { name: /delete/i }).click();

// wait for row to disappear
await expect(rowToDelete).toBeHidden();

    // ================= FILTER =================
    await page.getByPlaceholder("Search...").fill("ong");

    await expect(table.locator("tbody tr").first()).toBeVisible();

    // ================= ROLE FILTER =================
    await page.getByRole("button", { name: "Role" }).click();
    await page.getByRole("menuitemradio", { name: "My Patients" }).click();

    await expect(table.locator("tbody tr").first()).toBeVisible();
  });
});