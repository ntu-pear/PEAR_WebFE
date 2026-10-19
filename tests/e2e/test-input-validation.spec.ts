import { test, expect } from "@playwright/test";
import {
  adminEmail,
  adminPassword,
  appBaseUrl,
  generateNRIC,
  login,
  openAddPatientForm,
  supervisorEmail,
  supervisorPassword,
  withWrongCheckLetter,
} from "./helpers";

test("Supervisor - Add Patient uppercases entries and checks NRICs", async ({ page }) => {
  const patientNric = generateNRIC("S");
  const guardianNric = generateNRIC("T");

  await test.step("Login as Supervisor", async () => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  await test.step("Open Add Patient", async () => {
    await openAddPatientForm(page);
  });

  await test.step("Patient name, address and NRIC are uppercased as typed", async () => {
    await page.fill("#patient-name", "testing alice tan");
    await page.fill("#patient-preferred-name", "testing alice");
    await page.fill("#patient-address", "123 orchard road");
    await page.fill("#patient-nric", withWrongCheckLetter(patientNric).toLowerCase());

    await expect(page.locator("#patient-name")).toHaveValue("TESTING ALICE TAN");
    await expect(page.locator("#patient-preferred-name")).toHaveValue("TESTING ALICE");
    await expect(page.locator("#patient-address")).toHaveValue("123 ORCHARD ROAD");
    await expect(page.locator("#patient-nric")).toHaveValue(withWrongCheckLetter(patientNric));
  });

  await test.step("Guardian name, address and NRIC are uppercased as typed", async () => {
    await page.fill('input[name="guardians.0.firstName"]', "testing bob");
    await page.fill('input[name="guardians.0.lastName"]', "lim");
    await page.fill('input[name="guardians.0.address"]', "456 bukit timah road");
    await page.fill('input[name="guardians.0.nric"]', withWrongCheckLetter(guardianNric).toLowerCase());

    await expect(page.locator('input[name="guardians.0.firstName"]')).toHaveValue("TESTING BOB");
    await expect(page.locator('input[name="guardians.0.lastName"]')).toHaveValue("LIM");
    await expect(page.locator('input[name="guardians.0.address"]')).toHaveValue("456 BUKIT TIMAH ROAD");
    await expect(page.locator('input[name="guardians.0.nric"]')).toHaveValue(withWrongCheckLetter(guardianNric));
  });

  await test.step("NRICs with a wrong check letter are rejected", async () => {
    await page.locator('button[type="submit"]', { hasText: "Add Patient" }).click();
    await expect(page.getByText("Invalid NRIC", { exact: true })).toHaveCount(2);
    await expect(page.getByText("Patient Created Successfully")).toHaveCount(0);
  });

  await test.step("Correcting the NRICs clears the errors", async () => {
    await page.fill("#patient-nric", patientNric);
    await page.fill('input[name="guardians.0.nric"]', guardianNric);
    await expect(page.getByText("Invalid NRIC", { exact: true })).toHaveCount(0);
  });
});

test("Admin - Register Account checks the NRIC checksum", async ({ page }) => {
  const nric = generateNRIC("S");

  await test.step("Login as Admin", async () => {
    await login(page, adminEmail, adminPassword);
  });

  await test.step("Open Register Account", async () => {
    await page.goto(`${appBaseUrl}/admin/register-account`);
    await expect(page.getByText("Register Account", { exact: true }).first()).toBeVisible();
  });

  await test.step("NRIC and address are uppercased as typed", async () => {
    await page.getByLabel("NRIC Number").fill(withWrongCheckLetter(nric).toLowerCase());
    await page.getByLabel("Address", { exact: true }).fill("789 serangoon road");

    await expect(page.getByLabel("NRIC Number")).toHaveValue(withWrongCheckLetter(nric));
    await expect(page.getByLabel("Address", { exact: true })).toHaveValue("789 SERANGOON ROAD");
  });

  await test.step("An NRIC with a wrong check letter is rejected", async () => {
    await page.getByRole("button", { name: "Send registration link to email" }).click();
    await expect(page.getByText("Invalid NRIC", { exact: true })).toBeVisible();
  });

  await test.step("A valid NRIC clears the error", async () => {
    await page.getByLabel("NRIC Number").fill(nric);
    await expect(page.getByText("Invalid NRIC", { exact: true })).toHaveCount(0);
  });
});
