import { test, expect, type Locator, type Page } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { format } from "date-fns";

dotenv.config({ path: path.resolve(process.cwd(), "tests/e2e/test.env") });

const frontendUrl = process.env.FRONTEND_URL!;
const email = process.env.SUPERVISOR_ACCOUNT_EMAIL!;
const password = process.env.SUPERVISOR_ACCOUNT_PASSWORD!;

function isSunday() {
  return new Date().getDay() === 0;
}

async function selectableOptionValues(select: Locator): Promise<string[]> {
  return select
    .locator("option")
    .evaluateAll((options: HTMLOptionElement[]) =>
      options.map((option) => option.value).filter((value) => value !== "")
    );
}

async function fillAdhocDate(page: Page, label: RegExp, value: string) {
  const input = page.getByRole("textbox", { name: label });

  await input.click();
  await input.fill(value);
  await page.keyboard.press("Enter");

  await expect(input).toHaveValue(value);
}

test.describe("Supervisor: Add Adhoc Activity", () => {
  test("Login and submit Add Adhoc", async ({ page }) => {

    test.skip(
      isSunday(),
      "Add Adhoc has no valid date range on Sundays: end date must be strictly " +
      "after start date, but cannot pass Sunday of the current week."
    );

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

    // ================= SELECT ORIGINAL ACTIVITY =================
    const oldActivitySelect = page.getByRole("combobox", {
      name: /original activity/i,
    });

    await expect(oldActivitySelect).toBeEnabled();

    const oldActivityValues = await selectableOptionValues(oldActivitySelect);

    expect(
      oldActivityValues.length,
      "ALICE LEE has no activities on her current schedule, so there is no Original Activity to replace. Check the test data rather than the form."
    ).toBeGreaterThan(0);

    const oldActivityValue = oldActivityValues[0];

    await oldActivitySelect.selectOption(oldActivityValue);

    // ================= SELECT AD HOC ACTIVITY =================
    const adhocActivitySelect = page.getByRole("combobox", {
      name: /ad hoc activity/i,
    });

    await expect(adhocActivitySelect).toBeEnabled();

    const adhocActivityValues = (
      await selectableOptionValues(adhocActivitySelect)
    ).filter((value) => value !== oldActivityValue);

    expect(
      adhocActivityValues.length,
      "No Ad Hoc Activity is available to ALICE LEE that differs from the Original Activity."
    ).toBeGreaterThan(0);

    await adhocActivitySelect.selectOption(adhocActivityValues[0]);

    // ================= SET DATES =================
    await fillAdhocDate(page, /start date/i, format(new Date(), "dd-MMM-yyyy"));

    await expect(
      page.getByRole("textbox", { name: /end date/i })
    ).not.toHaveValue("");

    // ================= SUBMIT FORM =================
    await page.getByRole("button", { name: "Add Adhoc" }).click();

    // ================= VERIFY SUCCESS =================
    await expect(
      page.getByText("Adhoc activity added successfully!")
    ).toBeVisible();
  });
});
