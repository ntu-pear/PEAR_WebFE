import { test, expect, type Page } from "@playwright/test";
import {
  createPatientWithNewGuardian,
  fillPatientDetails,
  generateIdentity,
  generateNRIC,
  login,
  openAddPatientForm,
  openPatientTab,
  submitAddPatient,
  supervisorEmail,
  supervisorPassword,
} from "./helpers";

async function pickFirstStaff(page: Page, triggerId: string, expectPatientCount: boolean): Promise<string> {
  await page.locator(triggerId).click();

  const options = page.getByRole("option");
  await expect(options.first()).toHaveText("Auto-assign");
  expect(await options.count(), `No staff listed under ${triggerId}`).toBeGreaterThan(1);

  const staff = options.nth(1);
  if (expectPatientCount) {
    await expect(staff).toContainText(/\d+ patients?|unavailable/);
  }

  const name = ((await staff.textContent()) ?? "").replace(/(\d+ patients?|unavailable)$/, "").trim();
  await staff.click();
  await expect(page.locator(triggerId)).toContainText(name);
  return name;
}

test("Supervisor - Add Patient with Existing Guardian and Staff Assignment", async ({ page }) => {
  test.setTimeout(180_000);

  let existingGuardian = { nric: "", name: "" };
  let newPatientId = 0;
  const staff = { doctor: "", gameTherapist: "", caregiver: "" };

  await test.step("Login as Supervisor", async () => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  await test.step("Create a patient whose guardian will be reused", async () => {
    const { guardian } = await createPatientWithNewGuardian(page);
    existingGuardian = { nric: guardian.nric, name: `${guardian.firstName} ${guardian.lastName}` };
  });

  await test.step("Fill in the new patient's details", async () => {
    await openAddPatientForm(page);
    await fillPatientDetails(page, generateIdentity("S"));
  });

  await test.step("Existing Guardian mode hides the new guardian fields", async () => {
    await expect(page.locator('input[name="guardians.0.firstName"]')).toBeVisible();
    await page.locator("#guardian-info").getByRole("button", { name: "Existing Guardian" }).first().click();

    await expect(page.getByPlaceholder("Enter guardian's NRIC to search")).toBeVisible();
    await expect(page.locator('input[name="guardians.0.firstName"]')).toHaveCount(0);
  });

  await test.step("Searching an unknown NRIC shows a not found message", async () => {
    const nricInput = page.getByPlaceholder("Enter guardian's NRIC to search");
    await nricInput.fill(generateNRIC("T"));
    await nricInput.locator("..").getByRole("button", { name: "Search" }).click();

    await expect(page.getByText(/No guardian found with this NRIC/)).toBeVisible();
  });

  await test.step("Searching an existing guardian's NRIC shows their details", async () => {
    const nricInput = page.getByPlaceholder("Enter guardian's NRIC to search");
    await nricInput.fill(existingGuardian.nric);
    await nricInput.locator("..").getByRole("button", { name: "Search" }).click();

    await expect(page.locator("#guardian-info").getByText(existingGuardian.name)).toBeVisible();
    await page.selectOption('select[name="guardians.0.relationshipName"]', "Child");
  });

  await test.step("Staff Assignment lists staff with their patient counts", async () => {
    await expect(page.getByRole("heading", { name: "Staff Assignment" })).toBeVisible();
    await expect(page.locator("#patient-doctor")).toContainText("Auto-assign");
    await expect(page.locator("#patient-game-therapist")).toContainText("Auto-assign");
    await expect(page.locator("#patient-caregiver")).toContainText("Auto-assign");

    staff.doctor = await pickFirstStaff(page, "#patient-doctor", true);
    staff.gameTherapist = await pickFirstStaff(page, "#patient-game-therapist", false);
    staff.caregiver = await pickFirstStaff(page, "#patient-caregiver", true);
  });

  await test.step("Submit the form", async () => {
    newPatientId = await submitAddPatient(page);
  });

  await test.step("The existing guardian is assigned as primary guardian", async () => {
    await openPatientTab(page, newPatientId, "guardian");

    const row = page.locator("table tbody tr").filter({ hasText: existingGuardian.nric });
    await expect(row).toBeVisible();
    await expect(row.getByText("Primary", { exact: true })).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(1);
  });

  await test.step("The selected staff are allocated to the patient", async () => {
    await openPatientTab(page, newPatientId, "information");

    const staffRow = (role: string) =>
      page.locator("tbody tr").filter({ has: page.getByRole("cell", { name: role, exact: true }) });

    await expect(page.getByText("Staff Allocation", { exact: true })).toBeVisible();
    await expect(staffRow("DOCTOR")).toContainText(staff.doctor);
    await expect(staffRow("GAME THERAPIST")).toContainText(staff.gameTherapist);
    await expect(staffRow("CAREGIVER")).toContainText(staff.caregiver);
  });
});
