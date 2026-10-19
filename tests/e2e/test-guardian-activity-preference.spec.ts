import { test, expect, type Page } from "@playwright/test";
import { loginAsGuardianAndListPatients, openPatientTab } from "./helpers";

const PREFERENCE = /^(Like|Neutral|Dislike)$/;

async function openActivityPreferences(page: Page, patientId: number) {
  await openPatientTab(page, patientId, "activity-preference", "guardian");
  await expect(page.getByRole("tab", { name: "Activity Preference" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText(/view and manage activity preferences/i)).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
}

function firstPreferenceBadge(page: Page) {
  return page.locator("table tbody tr").first().getByText(PREFERENCE).first();
}

test("Guardian - Activity Preferences can be viewed for every patient", async ({ page }) => {
  test.setTimeout(180_000);

  const patients = await test.step("Login as Guardian and list their patients", () =>
    loginAsGuardianAndListPatients(page)
  );
  expect(patients.length, "The guardian test account has no patients.").toBeGreaterThan(0);

  for (const patient of patients) {
    await test.step(`Patient ${patient.id} (${patient.isPrimary ? "primary" : "secondary"} guardian)`, async () => {
      await openActivityPreferences(page, patient.id);

      await expect(page.getByRole("tab", { name: "Activity Exclusion" })).toHaveCount(0);
      await expect(page.getByRole("tab", { name: "History" })).toHaveCount(0);

      if (patient.isPrimary) {
        await expect(page.getByText(/^Select All \(/)).toBeVisible();
        await expect(page.locator("table tbody tr").first().getByRole("checkbox")).toBeVisible();
      } else {
        await expect(page.getByText(/^Select All \(/)).toHaveCount(0);
        await expect(page.locator("table tbody tr").first().getByRole("checkbox")).toHaveCount(0);

        await firstPreferenceBadge(page).click({ button: "right" });
        await expect(page.getByRole("menuitem")).toHaveCount(0);
      }
    });
  }
});

test("Primary Guardian - Activity Preferences can be changed", async ({ page }) => {
  test.setTimeout(180_000);

  const patients = await test.step("Login as Guardian and list their patients", () =>
    loginAsGuardianAndListPatients(page)
  );
  const primaryPatient = patients.find((patient) => patient.isPrimary);
  test.skip(!primaryPatient, "The guardian test account is not the primary guardian of any patient.");

  let originalPreference = "";
  let activityName = "";

  await test.step("Open the Activity Preference tab", async () => {
    await openActivityPreferences(page, primaryPatient!.id);
    originalPreference = (await firstPreferenceBadge(page).innerText()).trim();
    activityName = ((await page.locator("table tbody tr").first().locator("td").nth(1).locator("span").first().textContent()) ?? "").trim();
  });

  await test.step("Right-clicking a preference offers the other two options", async () => {
    await firstPreferenceBadge(page).click({ button: "right" });
    const options = page.getByRole("menuitem");
    await expect(options).toHaveCount(2);
    await expect(options.filter({ hasText: originalPreference })).toHaveCount(0);
  });

  let changedPreference = "";

  await test.step("Change the preference", async () => {
    const option = page.getByRole("menuitem").first();
    changedPreference = (await option.innerText()).trim();
    await option.click();

    await expect(page.getByText(`Updated "${activityName}" to ${changedPreference.toUpperCase()}`)).toBeVisible();
    await expect(firstPreferenceBadge(page)).toHaveText(changedPreference);
  });

  await test.step("Change the preference back", async () => {
    await firstPreferenceBadge(page).click({ button: "right" });
    await page.getByRole("menuitem", { name: originalPreference }).click();

    await expect(page.getByText(`Updated "${activityName}" to ${originalPreference.toUpperCase()}`)).toBeVisible();
    await expect(firstPreferenceBadge(page)).toHaveText(originalPreference);
  });

  await test.step("Bulk update applies to the selected activities", async () => {
    await page.locator("table tbody tr").first().getByRole("checkbox").click();
    await expect(page.getByText("1 item selected")).toBeVisible();

    await page.getByRole("combobox").filter({ hasText: "Set preference to..." }).click();
    await page.getByRole("option", { name: originalPreference }).click();
    await page.getByRole("button", { name: "Update Selected" }).click();

    await expect(page.getByText("Successfully updated 1 activity preferences")).toBeVisible();
    await expect(firstPreferenceBadge(page)).toHaveText(originalPreference);
  });
});
