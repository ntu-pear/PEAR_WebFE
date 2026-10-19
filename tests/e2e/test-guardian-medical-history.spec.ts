import { test, expect, type Locator, type Page } from "@playwright/test";
import { format, subDays } from "date-fns";
import { loginAsGuardianAndListPatients, openPatientTab } from "./helpers";

function modal(page: Page, heading: string) {
  return page.locator("div.fixed.inset-0").filter({ has: page.getByRole("heading", { name: heading }) });
}

async function openMedicalHistory(page: Page, patientId: number) {
  await openPatientTab(page, patientId, "medical-history", "guardian");
  await expect(page.getByRole("tab", { name: "Medical History" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Medical History", { exact: true }).last()).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Diagnosis Name" })).toBeVisible();
}

async function findRow(page: Page, text: string): Promise<Locator> {
  const row = page.locator("tbody tr").filter({ hasText: text });
  for (let i = 0; i < 10 && !(await row.count()); i++) {
    const next = page.getByRole("button", { name: "Next" });
    if (!(await next.isVisible()) || (await next.isDisabled())) break;
    await next.click();
    await page.waitForTimeout(500);
  }
  await expect(row).toBeVisible();
  return row;
}

test("Guardian - Medical History can be viewed for every patient", async ({ page }) => {
  test.setTimeout(180_000);

  const patients = await test.step("Login as Guardian and list their patients", () =>
    loginAsGuardianAndListPatients(page)
  );
  expect(patients.length, "The guardian test account has no patients.").toBeGreaterThan(0);

  for (const patient of patients) {
    await test.step(`Patient ${patient.id} (${patient.isPrimary ? "primary" : "secondary"} guardian)`, async () => {
      await openMedicalHistory(page, patient.id);

      if (patient.isPrimary) {
        await expect(page.getByRole("button", { name: "Add", exact: true })).toBeVisible();
      } else {
        await expect(page.getByRole("button", { name: "Add", exact: true })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Edit" })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
      }
    });
  }
});

test("Primary Guardian - Medical History can be added, edited and deleted", async ({ page }) => {
  test.setTimeout(180_000);

  const source = `PLAYWRIGHT GUARDIAN ${Date.now()}`;
  const editedSource = `${source} EDITED`;

  const patients = await test.step("Login as Guardian and list their patients", () =>
    loginAsGuardianAndListPatients(page)
  );
  const primaryPatient = patients.find((patient) => patient.isPrimary);
  test.skip(!primaryPatient, "The guardian test account is not the primary guardian of any patient.");

  await test.step("Open the Medical History tab", async () => {
    await openMedicalHistory(page, primaryPatient!.id);
  });

  await test.step("Add a medical history record", async () => {
    await page.getByRole("button", { name: "Add", exact: true }).click();
    const addModal = modal(page, "Add Medical History");
    await expect(addModal).toBeVisible();

    await addModal.locator('select[name="DiagnosisListID"]').selectOption({ index: 1 });
    await addModal.locator('input[name="SourceOfInformation"]').fill(source);
    await addModal.locator('textarea[name="Remarks"]').fill("Added by Playwright as primary guardian");
    await addModal.locator('input[name="DateOfDiagnosis"]').fill(format(subDays(new Date(), 30), "yyyy-MM-dd"));
    await addModal.getByRole("button", { name: "Add", exact: true }).click();

    await expect(page.getByText("Sucessfully added Patient Medical History")).toBeVisible();
    await findRow(page, source);
  });

  await test.step("Edit the record", async () => {
    await (await findRow(page, source)).getByRole("button", { name: "Edit" }).click();
    const editModal = modal(page, "Edit Medical History");
    await expect(editModal).toBeVisible();

    await editModal.locator('input[name="MobilityRemarks"]').fill(editedSource);
    await editModal.getByRole("button", { name: "Update" }).click();

    await expect(page.getByText("Patient Medical History updated successfully.")).toBeVisible();
    await findRow(page, editedSource);
  });

  await test.step("Delete the record", async () => {
    await (await findRow(page, editedSource)).getByRole("button", { name: "Delete" }).click();
    const deleteModal = modal(page, "Are you sure?");
    await expect(deleteModal).toBeVisible();
    await deleteModal.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Patient Medical History deleted successfully.")).toBeVisible();
    await expect(page.locator("tbody tr").filter({ hasText: editedSource })).toHaveCount(0);
  });
});
