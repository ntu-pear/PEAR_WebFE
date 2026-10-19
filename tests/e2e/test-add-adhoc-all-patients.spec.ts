import { test, expect, type Locator, type Page } from "@playwright/test";
import { format } from "date-fns";
import { appBaseUrl, login, supervisorEmail, supervisorPassword } from "./helpers";

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

async function selectedOptionText(select: Locator): Promise<string> {
  return select.evaluate((element: HTMLSelectElement) => element.selectedOptions[0].text.trim());
}

test("Supervisor - Add Adhoc for All Patients on an Activity", async ({ page }) => {
  test.setTimeout(240_000);
  test.skip(
    new Date().getDay() === 0,
    "Add Adhoc has no valid date range on Sundays: the end date must be after the start date but within the current week."
  );

  const startDate = format(new Date(), "dd-MMM-yyyy");
  const affectedPanel = page.locator("div.bg-gray-50").filter({ hasText: /affected patients|currently scheduled/ });
  const summary = affectedPanel.getByText(/^\d+ patients? currently scheduled for this activity in the selected range:$/);
  const oldActivitySelect = page.getByRole("combobox", { name: /original activity/i });
  const adhocSelect = page.getByRole("combobox", { name: /ad hoc activity/i });

  let affectedPatients: string[] = [];
  let oldActivity = "";
  let newActivity = "";

  await test.step("Login as Supervisor", async () => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  await test.step("Open Add Adhoc", async () => {
    await page.goto(`${appBaseUrl}/supervisor/add-adhoc`);
    await expect(page.getByRole("heading", { name: "Adhoc Information" })).toBeVisible();
  });

  await test.step("Specific Patient is the default mode", async () => {
    await expect(page.getByRole("radio", { name: "Specific Patient" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "All Patients on this Activity" })).not.toBeChecked();
    await expect(page.getByRole("combobox", { name: /patient name/i })).toBeVisible();
  });

  await test.step("All Patients mode replaces the patient picker with an affected patients panel", async () => {
    await page.getByRole("radio", { name: "All Patients on this Activity" }).check();

    await expect(page.getByRole("combobox", { name: /patient name/i })).toHaveCount(0);
    await expect(
      page.getByText("Select an Original Activity and date range below to see affected patients.")
    ).toBeVisible();
  });

  await test.step("Switching back to Specific Patient restores the patient picker", async () => {
    await page.getByRole("radio", { name: "Specific Patient" }).check();
    await expect(page.getByRole("combobox", { name: /patient name/i })).toBeVisible();
    await expect(affectedPanel).toHaveCount(0);

    await page.getByRole("radio", { name: "All Patients on this Activity" }).check();
  });

  await test.step("Choosing an activity and dates lists the affected patients", async () => {
    await fillAdhocDate(page, /start date/i, startDate);
    await expect(page.getByRole("textbox", { name: /end date/i })).not.toHaveValue("");

    await expect(oldActivitySelect).toBeEnabled();
    const activityValues = await selectableOptionValues(oldActivitySelect);
    expect(activityValues.length, "No centre activities are available to replace.").toBeGreaterThan(0);

    let fewestPatients: { value: string; count: number } | null = null;
    for (const value of activityValues) {
      await oldActivitySelect.selectOption(value);
      await expect(page.getByText("Loading affected patients...")).toHaveCount(0);
      await expect(affectedPanel.getByText(/currently scheduled for this activity in the selected range/)).toBeVisible();

      if (await summary.count()) {
        const count = Number((await summary.innerText()).match(/^\d+/)![0]);
        await expect(affectedPanel.locator("li")).toHaveCount(count);
        if (!fewestPatients || count < fewestPatients.count) fewestPatients = { value, count };
      }
    }

    expect(
      fewestPatients,
      "No centre activity has patients scheduled for today or tomorrow. Check that this week's schedule has been generated."
    ).not.toBeNull();

    await oldActivitySelect.selectOption(fewestPatients!.value);
    await expect(summary).toBeVisible();
    affectedPatients = (await affectedPanel.locator("li").allInnerTexts()).map((name) => name.trim());
    oldActivity = await selectedOptionText(oldActivitySelect);
    expect(affectedPatients).toHaveLength(fewestPatients!.count);
  });

  await test.step("Choose the Ad Hoc Activity", async () => {
    await expect(adhocSelect).toBeEnabled();
    const oldValue = await oldActivitySelect.inputValue();
    const adhocValues = (await selectableOptionValues(adhocSelect)).filter((value) => value !== oldValue);
    expect(adhocValues.length).toBeGreaterThan(0);

    await adhocSelect.selectOption(adhocValues[0]);
    newActivity = await selectedOptionText(adhocSelect);
  });

  await test.step("Submitting adds an adhoc for every affected patient", async () => {
    await page.getByRole("button", { name: "Add Adhoc" }).click();

    const plural = affectedPatients.length === 1 ? "patient" : "patients";
    await expect(page.getByText(`Adhoc activity added for ${affectedPatients.length} ${plural}!`)).toBeVisible({
      timeout: 60_000,
    });
    await expect(page).toHaveURL(/\/supervisor\/manage-adhoc/);
  });

  const createdAdhocRow = (patient: string) =>
    page
      .getByRole("tabpanel")
      .locator("tbody tr")
      .filter({ hasText: patient })
      .filter({ hasText: oldActivity })
      .filter({ hasText: newActivity })
      .filter({ hasText: new RegExp(startDate, "i") });

  await test.step("Each affected patient has the new adhoc in the Active tab", async () => {
    await expect(page.getByRole("tab", { name: /^Active/ })).toHaveAttribute("aria-selected", "true");

    for (const patient of affectedPatients) {
      await page.getByRole("searchbox").fill(patient);
      await expect(createdAdhocRow(patient).first()).toBeVisible();
    }
  });

  await test.step("Clean up the created adhocs", async () => {
    page.on("dialog", (dialog) => dialog.accept());

    for (const patient of affectedPatients) {
      await page.getByRole("searchbox").fill(patient);
      const rows = createdAdhocRow(patient);
      const before = await rows.count();

      await rows.first().getByRole("button", { name: "Delete" }).click();
      await expect(rows).toHaveCount(before - 1);
    }
  });
});
