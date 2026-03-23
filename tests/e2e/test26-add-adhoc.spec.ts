import { test, expect } from "@playwright/test"; 
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "tests/e2e/test.env") });

const frontendUrl = process.env.FRONTEND_URL!;
const email = process.env.SUPERVISOR_ACCOUNT_EMAIL!;
const password = process.env.SUPERVISOR_ACCOUNT_PASSWORD!;

test.describe("Supervisor: Add Adhoc Activity", () => {
  test("Login and submit Add Adhoc with default values", async ({ page }) => {

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
    await page.goto(`${frontendUrl}/add-adhoc`);

    await expect(
        page.getByRole("heading", { name: "Adhoc Information" })
    ).toBeVisible();

    // ================= SELECT PATIENT =================
    const patientSelect = page.getByRole("combobox", {
      name: /patient name/i,
    });

    await patientSelect.selectOption({ label: "ALICE LEE" });

    // ================= SUBMIT FORM =================
    await page.getByRole("button", { name: "Add Adhoc" }).click();

    // ================= VERIFY SUCCESS =================
    await expect(
      page.getByText("Adhoc activity added successfully!")
    ).toBeVisible();
  });
});