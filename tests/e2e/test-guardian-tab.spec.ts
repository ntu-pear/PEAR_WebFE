import { test, expect, type Page } from "@playwright/test";
import {
  createPatientWithNewGuardian,
  generateNRIC,
  login,
  openPatientTab,
  supervisorEmail,
  supervisorPassword,
} from "./helpers";

function guardianRow(page: Page, nric: string) {
  return page.locator("table tbody tr").filter({ hasText: nric });
}

function modal(page: Page, heading: string | RegExp) {
  return page.locator("div.fixed.inset-0").filter({ has: page.getByRole("heading", { name: heading }) });
}

test("Supervisor - Guardian Tab", async ({ page }) => {
  test.setTimeout(240_000);

  let patientId = 0;
  let firstGuardian = { nric: "", name: "" };
  let secondGuardian = { nric: "", name: "" };

  await test.step("Login as Supervisor", async () => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  await test.step("Create two patients, each with a new guardian", async () => {
    const first = await createPatientWithNewGuardian(page);
    const second = await createPatientWithNewGuardian(page);

    patientId = first.patientId;
    firstGuardian = { nric: first.guardian.nric, name: `${first.guardian.firstName} ${first.guardian.lastName}` };
    secondGuardian = { nric: second.guardian.nric, name: `${second.guardian.firstName} ${second.guardian.lastName}` };
  });

  await test.step("Open the Guardian tab", async () => {
    await openPatientTab(page, patientId, "guardian");
    await expect(page.getByRole("tab", { name: "Guardian" })).toHaveAttribute("aria-selected", "true");
    await expect(guardianRow(page, firstGuardian.nric)).toBeVisible();
  });

  await test.step("Sole guardian is primary and cannot be unassigned", async () => {
    const row = guardianRow(page, firstGuardian.nric);
    await expect(row.getByText("Primary", { exact: true })).toBeVisible();
    await expect(row.getByRole("button", { name: "Unassign" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add Existing" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Add New" })).toBeEnabled();
  });

  await test.step("Add Existing shows a message for an unknown NRIC", async () => {
    await page.getByRole("button", { name: "Add Existing" }).click();
    const addExisting = modal(page, "Add Existing Guardian");
    await expect(addExisting).toBeVisible();

    await addExisting.locator("#existing-guardian-nric").fill(generateNRIC("T"));
    await addExisting.getByRole("button", { name: "Search" }).click();

    await expect(addExisting.getByText(/No guardian found with this NRIC/)).toBeVisible();
    await expect(addExisting.getByRole("button", { name: "Assign" })).toBeDisabled();
  });

  await test.step("Add Existing assigns a guardian found by NRIC", async () => {
    const addExisting = modal(page, "Add Existing Guardian");

    await addExisting.locator("#existing-guardian-nric").fill(secondGuardian.nric.toLowerCase());
    await expect(addExisting.locator("#existing-guardian-nric")).toHaveValue(secondGuardian.nric);
    await addExisting.getByRole("button", { name: "Search" }).click();

    await expect(addExisting.getByText(secondGuardian.name)).toBeVisible();
    await expect(addExisting.getByRole("button", { name: "Assign" })).toBeDisabled();

    await addExisting.locator("select").selectOption("Friend");
    await addExisting.getByRole("button", { name: "Assign" }).click();

    await expect(page.getByText("Guardian assigned successfully.")).toBeVisible();
    await expect(addExisting).toBeHidden();

    const row = guardianRow(page, secondGuardian.nric);
    await expect(row).toBeVisible();
    await expect(row.getByText("Secondary", { exact: true })).toBeVisible();
    await expect(row.getByText("Friend")).toBeVisible();
  });

  await test.step("Adding is disabled once the patient has 2 guardians", async () => {
    await expect(page.getByRole("button", { name: "Add Existing" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add New" })).toBeDisabled();
    await expect(guardianRow(page, firstGuardian.nric).getByRole("button", { name: "Unassign" })).toBeVisible();
    await expect(guardianRow(page, secondGuardian.nric).getByRole("button", { name: "Unassign" })).toBeVisible();
  });

  await test.step("Edit Guardian locks identity fields and saves contact changes", async () => {
    await guardianRow(page, secondGuardian.nric).getByRole("button", { name: "Edit" }).click();
    const editGuardian = modal(page, "Edit Guardian");
    await expect(editGuardian).toBeVisible();

    await expect(editGuardian.locator("#firstName")).not.toBeEditable();
    await expect(editGuardian.locator("#lastName")).not.toBeEditable();
    await expect(editGuardian.locator("#nric")).not.toBeEditable();
    await expect(editGuardian.locator("#dateOfBirth")).toBeDisabled();
    for (const radio of await editGuardian.locator('input[type="radio"][name="gender"]').all()) {
      await expect(radio).toBeDisabled();
    }

    await editGuardian.locator("#contactNo").fill("98765432");
    await editGuardian.getByRole("button", { name: "Save Changes" }).click();

    await expect(page.getByText("Guardian updated successfully.")).toBeVisible();
    await expect(guardianRow(page, secondGuardian.nric).getByText("98765432")).toBeVisible();
  });

  await test.step("Unassign warns when the guardian has no other patients", async () => {
    await guardianRow(page, firstGuardian.nric).getByRole("button", { name: "Unassign" }).click();
    const unassign = modal(page, /Confirm unassign .* from this patient\?/);
    await expect(unassign).toBeVisible();

    await expect(unassign.getByText(/will leave them with no patient assignment/)).toBeVisible();
    await expect(unassign.getByText("soft deleted")).toBeVisible();

    await unassign.getByRole("button", { name: "Cancel" }).click();
    await expect(unassign).toBeHidden();
    await expect(guardianRow(page, firstGuardian.nric)).toBeVisible();
  });

  await test.step("Set the secondary guardian as primary", async () => {
    await guardianRow(page, secondGuardian.nric).getByRole("button", { name: "Edit" }).click();
    const editGuardian = modal(page, "Edit Guardian");
    await editGuardian.getByRole("button", { name: "Set as Primary" }).click();

    const confirm = modal(page, `Make ${secondGuardian.name} the primary guardian?`);
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Set as Primary" }).click();

    await expect(page.getByText("Primary guardian updated.")).toBeVisible();
    await expect(guardianRow(page, secondGuardian.nric).getByText("Primary", { exact: true })).toBeVisible();
    await expect(guardianRow(page, firstGuardian.nric).getByText("Secondary", { exact: true })).toBeVisible();
  });

  await test.step("Primary guardian has no Set as Primary button", async () => {
    await guardianRow(page, secondGuardian.nric).getByRole("button", { name: "Edit" }).click();
    const editGuardian = modal(page, "Edit Guardian");
    await expect(editGuardian.getByRole("button", { name: "Set as Primary" })).toHaveCount(0);
    await editGuardian.getByRole("button", { name: "Cancel" }).click();
    await expect(editGuardian).toBeHidden();
  });

  await test.step("Unassigning the primary guardian promotes the remaining guardian", async () => {
    await guardianRow(page, secondGuardian.nric).getByRole("button", { name: "Unassign" }).click();
    const unassign = modal(page, /Confirm unassign .* from this patient\?/);
    await expect(unassign).toBeVisible();

    const confirmButton = unassign.getByRole("button", { name: "Unassign" });
    await expect(confirmButton).toBeEnabled();
    await expect(unassign.getByText("soft deleted")).toHaveCount(0);
    await confirmButton.click();

    await expect(page.getByText(`${secondGuardian.name} unassigned from this patient.`)).toBeVisible();
    await expect(page.getByText("The remaining guardian is now the primary guardian.")).toBeVisible();

    await expect(guardianRow(page, secondGuardian.nric)).toHaveCount(0);
    const remaining = guardianRow(page, firstGuardian.nric);
    await expect(remaining.getByText("Primary", { exact: true })).toBeVisible();
    await expect(remaining.getByRole("button", { name: "Unassign" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add Existing" })).toBeEnabled();
  });
});
