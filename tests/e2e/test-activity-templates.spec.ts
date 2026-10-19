import { test, expect, type Page } from "@playwright/test";
import { appBaseUrl, login, supervisorEmail, supervisorPassword } from "./helpers";

const suffix = Date.now();
const TEMPLATE_NAME = `PLAYWRIGHT TEMPLATE ${suffix}`;
const ACTIVITY_TITLE = `PLAYWRIGHT TEMPLATE ACTIVITY ${suffix}`;
const CENTRE_ACTIVITY_NAME = `PLAYWRIGHT TEMPLATE VARIANT ${suffix}`;

function templateRow(page: Page) {
  return page.locator("tbody tr").filter({ has: page.getByRole("cell", { name: TEMPLATE_NAME, exact: true }) });
}

async function openTemplates(page: Page) {
  await page.goto(`${appBaseUrl}/supervisor/manage-activity-templates`);
  await expect(page.getByText(/^A template stores default settings for an activity\./)).toBeVisible();
  await expect(page.getByText("Loading…")).toHaveCount(0);
}

test("Supervisor - Activity Templates", async ({ page }) => {
  test.setTimeout(150_000);

  await test.step("Login as Supervisor", async () => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  await test.step("Open Activity Templates", async () => {
    await openTemplates(page);
    await expect(page.getByRole("columnheader", { name: "Template Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Creates Activity" })).toBeVisible();
  });

  await test.step("Add Template rejects a blank name and title", async () => {
    await page.getByRole("button", { name: "Add Template" }).click();
    const sheet = page.getByRole("dialog", { name: "Add Template" });
    await expect(sheet).toBeVisible();

    await sheet.locator("#template_name").fill(" ");
    await sheet.locator("#template_title").fill(" ");
    await sheet.getByRole("button", { name: "Save Template" }).click();

    await expect(sheet.getByText("Template Name is required.")).toBeVisible();
    await expect(sheet.getByText("Activity title is required.")).toBeVisible();
  });

  await test.step("Add a template", async () => {
    const sheet = page.getByRole("dialog", { name: "Add Template" });

    await sheet.locator("#template_name").fill(TEMPLATE_NAME);
    await sheet.locator("#template_title").fill(ACTIVITY_TITLE);
    await sheet.locator("#template_description").fill("Created by Playwright activity template test");
    await expect(sheet.locator("#duration")).toHaveValue("60");
    await sheet.getByRole("button", { name: "Save Template" }).click();

    await expect(page.getByText("Template created.")).toBeVisible();
    await expect(sheet).toBeHidden();

    const row = templateRow(page);
    await expect(row).toBeVisible();
    await expect(row).toContainText(ACTIVITY_TITLE);
    await expect(row).toContainText("60 mins");
  });

  await test.step("Edit the template", async () => {
    await templateRow(page).getByRole("button", { name: "Edit" }).click();
    const sheet = page.getByRole("dialog", { name: "Edit Template" });
    await expect(sheet).toBeVisible();
    await expect(sheet.locator("#template_name")).toHaveValue(TEMPLATE_NAME);

    await sheet.locator("#duration").selectOption("30");
    await sheet.getByRole("button", { name: "Save", exact: true }).click();

    await expect(page.getByText("Template updated.")).toBeVisible();
    await expect(templateRow(page)).toContainText("30 mins");
  });

  await test.step("Use Template asks for a centre activity name", async () => {
    await templateRow(page).getByRole("button", { name: "Use Template" }).click();
    const sheet = page.getByRole("dialog", { name: "Use Template" });
    await expect(sheet).toBeVisible();

    await expect(sheet.getByText("Centre Activity Name")).toBeVisible();
    await expect(sheet.locator("#template_name")).toHaveValue("");
    await expect(sheet.locator("#template_title")).toHaveValue(ACTIVITY_TITLE);
    await expect(sheet.locator("#template_title")).toBeEnabled();

    await sheet.locator("#template_name").fill(" ");
    await sheet.getByRole("button", { name: "Create Activity" }).click();
    await expect(sheet.getByText("Centre Activity Name is required.")).toBeVisible();
  });

  await test.step("Use Template creates the activity and a named centre activity", async () => {
    const sheet = page.getByRole("dialog", { name: "Use Template" });
    await sheet.locator("#template_name").fill(CENTRE_ACTIVITY_NAME);
    await sheet.getByRole("button", { name: "Create Activity" }).click();

    await expect(
      page.getByText(`Created activity "${ACTIVITY_TITLE}" and centre activity "${CENTRE_ACTIVITY_NAME}".`)
    ).toBeVisible();
    await expect(sheet).toBeHidden();
  });

  await test.step("Using the template again reuses the existing activity", async () => {
    await templateRow(page).getByRole("button", { name: "Use Template" }).click();
    const sheet = page.getByRole("dialog", { name: "Use Template" });

    await expect(sheet.getByText(`This will be added to the existing activity "${ACTIVITY_TITLE}".`)).toBeVisible();
    await expect(sheet.locator("#template_title")).toBeDisabled();
    await expect(sheet.locator("#template_description")).toBeDisabled();

    await sheet.getByRole("button", { name: "Cancel" }).click();
    await expect(sheet).toBeHidden();
  });

  await test.step("Delete the template", async () => {
    await templateRow(page).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Template deleted.")).toBeVisible();
    await expect(templateRow(page)).toHaveCount(0);
  });

  await test.step("Clean up the created centre activity", async () => {
    await page.goto(`${appBaseUrl}/supervisor/manage-centre-activities`);
    await page.getByPlaceholder("Search...").fill(CENTRE_ACTIVITY_NAME);

    const row = page.locator("tbody tr").filter({ hasText: CENTRE_ACTIVITY_NAME }).first();
    await expect(row).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Centre Activity Deleted.")).toBeVisible();
  });

  await test.step("Clean up the created activity", async () => {
    await page.goto(`${appBaseUrl}/supervisor/manage-activities`);
    await page.getByPlaceholder("Search...").fill(ACTIVITY_TITLE);

    const row = page.locator("tbody tr").filter({ hasText: ACTIVITY_TITLE });
    await expect(row).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Activity deleted.")).toBeVisible();
    await expect(row).toHaveCount(0);
  });
});
