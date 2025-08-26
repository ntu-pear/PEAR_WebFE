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

test.describe("Supervisor: Manage Medication", () => {
  test("Supervisor: View, filter, add, edit, delete patient medication", async ({
    page,
  }) => {
    await test.step("Navigate and login to supervisor account", async () => {
      await page.goto(frontendUrl);
      await page
        .getByRole("textbox", { name: "email" })
        .fill(supervisorAccountEmail);
      await page
        .getByRole("textbox", { name: "password" })
        .fill(supervisorAccountPassword);
      await page.getByRole("button", { name: "LOGIN" }).click();
      await page.waitForResponse((resp) => resp.url().includes("/login"));

      await expect(page.getByText("Login successful.")).toBeVisible();
      await expect(
        page.getByRole("heading").filter({ hasText: "Manage Patients" })
      ).toBeVisible();
    });

    await test.step("Navigate to medication page", async () => {
      await page
        .getByRole("button")
        .filter({ has: page.locator(".lucide-menu") })
        .click();
      await page.getByText("Manage Medication").click();
      await expect(
        page
          .getByRole("heading")
          .filter({ hasText: "Manage Patient Medication" })
      ).toBeVisible();
    });

    await test.step("Check patient table is visible with data", async () => {
      await expect(page.getByRole("table")).toBeVisible();

      const headers = ["Name", "NRIC", "Start Date", "End Date", "Actions"];

      for (const header of headers) {
        await expect(page.locator("th", { hasText: header })).toBeVisible();
      }

      const rows = await page
        .locator("tr", { hasNot: page.locator("th") })
        .all();
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    await test.step("Open medication modal for the first patient", async () => {
      const patient = page.locator("tbody tr").first();
      await expect(patient).toBeVisible();

      await patient.getByRole("button", { name: "Show Medication" }).click();

      await expect(
        page.getByRole("heading", { name: "Medication Details for" })
      ).toBeVisible();

      await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
    });

    await test.step("Check medication table is visible or no data", async () => {
      const modalTable = await page.getByRole("table").last(); // table inside modal

      if (await modalTable.isVisible()) {
        const headers = [
          "Drug Name",
          "Dosage",
          "Frequency Per Day",
          "Instruction",
          "Start Date",
          "End Date",
          "After Meal",
          "Actions",
        ];
        for (const column of headers) {
          await expect(
            modalTable.locator("th", { hasText: column })
          ).toBeVisible();
        }
      } else {
        expect(page.getByText("No data found")).toBeVisible();
      }
    });

    await test.step("Add new medication", async () => {
      await page.getByRole("button", { name: "Add" }).click();
      await expect(page.getByText("Add Medical Prescription")).toBeVisible();

      await page
        .locator('select[name="PrescriptionListId"]')
        .selectOption({ index: 1 });
      await page.locator('select[name="IsAfterMeal"]').selectOption("1");
      await page.locator('input[name="Dosage"]').fill("1");
      await page.locator('input[name="FrequencyPerDay"]').fill("2");
      const instruction = "E2E test add";
      await page.locator('textarea[name="Instruction"]').fill(instruction);
      const toYMD = (d: Date) => d.toISOString().slice(0, 10);
      const start = new Date();
      start.setDate(start.getDate() + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 14);
      await page.locator('input[name="StartDate"]').fill(toYMD(start));
      await page.locator('input[name="EndDate"]').fill(toYMD(end));
      await page.locator('select[name="Status"]').selectOption("0");
      await page
        .locator('textarea[name="PrescriptionRemarks"]')
        .fill("created via e2e");

      await page.locator("button[type=submit]").click();
      await page.waitForTimeout(1200);

      const modalTable = await page.getByRole("table").last();
      await expect(modalTable.locator("tbody tr").first()).toContainText(
        instruction
      );
    });

    await test.step("Open Edit prescription modal and close it", async () => {
      const modalTable = page.getByRole("table").last();
      modalTable
        .locator("tbody tr")
        .first()
        .getByRole("button", { name: "Edit" })
        .click();

      await expect(
        page.getByRole("heading", { name: "Medical Prescription" })
      ).toBeVisible();
      const instruction = "E2E test edit";
      await page.locator('textarea[name="Instruction"]').fill(instruction);
      await page.getByRole("button", { name: "Save Changes" }).click();
      await page.waitForTimeout(1200);

      await expect(modalTable.locator("tbody tr").first()).toContainText(
        instruction
      );
    });

    await test.step("Open Delete prescription modal and close it", async () => {
      const modalTable = page.getByRole("table").last();
      const rows = await modalTable.locator("tbody tr").all();

      rows[rows.length - 1].getByRole("button", { name: "Delete" }).click();

      await expect(
        page.getByRole("heading", { name: "Are you sure?" })
      ).toBeVisible();
      await expect(page.locator("[type=submit]").first()).toHaveText("Delete");
      await page.locator("[type=submit]").first().click();
      await page.waitForTimeout(1200);

      await expect(await modalTable.locator("tbody tr").all()).toHaveLength(
        rows.length - 1
      );
    });

    await test.step("Close medication modal", async () => {
      await page.getByRole("button", { name: "✕" }).click();
      await expect(
        page.getByRole("heading", { name: "Medication Details for" })
      ).not.toBeVisible();
    });

    await test.step("Filter patients by patient name", async () => {
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

    await test.step("Filter patients by role", async () => {
      const type = "My Patients";
      await page.getByRole("button", { name: "Role" }).click();
      await page.locator("role=menuitemradio", { hasText: type }).click();
      await page.waitForTimeout(2000);
      await expect(page.getByText(type)).not.toBeVisible();

      if (await page.getByRole("table").isVisible()) {
        const rows = await page
          .locator("tr", { hasNot: page.locator("th") })
          .all();
        expect(rows.length).toBeGreaterThanOrEqual(1);
      } else {
        expect(page.getByText("No data found")).toBeVisible();
      }
    });
  });
});
