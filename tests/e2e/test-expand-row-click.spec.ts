import { test, expect } from "@playwright/test";
import { appBaseUrl, login, supervisorEmail, supervisorPassword } from "./helpers";

test.describe("Supervisor - Click a row to expand it", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  test("Manage Medication rows expand on click", async ({ page }) => {
    await page.goto(`${appBaseUrl}/supervisor/manage-medication`);
    await expect(page.getByRole("heading", { name: "Manage Patient Medication" })).toBeVisible();

    const row = page.locator("tbody tr").first();
    await expect(row).toBeVisible();
    const details = page.getByText(/^Medication Details for /);

    await test.step("Clicking a cell expands the row", async () => {
      await row.locator("td").nth(2).click();
      await expect(details).toBeVisible();
    });

    await test.step("Clicking the cell again collapses the row", async () => {
      await row.locator("td").nth(2).click();
      await expect(details).toHaveCount(0);
    });

    await test.step("Clicking the View More link does not expand the row", async () => {
      const viewMore = row.getByRole("link", { name: "View More" }).or(row.getByRole("button", { name: "View More" }));
      await viewMore.first().click();
      await expect(page).toHaveURL(/\/supervisor\/view-patient\/\d+/);
    });
  });

  test("Patient Routine rows expand on click", async ({ page }) => {
    await page.goto(`${appBaseUrl}/supervisor/manage-patients`);
    await page.getByRole("tab", { name: "All Patients" }).click();

    const searchInput = page.getByRole("searchbox", { name: "Search" });
    await searchInput.fill("JON ONG");
    await page.waitForTimeout(800);
    const patientRow = page.locator("table tbody tr", { hasText: "JON ONG" }).first();
    await expect(patientRow).toBeVisible();
    await patientRow.getByRole("link", { name: "View More" }).or(patientRow.getByRole("button", { name: "View More" })).first().click();
    await expect(page).toHaveURL(/view-patient\/\d+/);

    await page.getByRole("tab", { name: "Routine" }).click();
    await expect(page).toHaveURL(/tab=routine/);

    const routineRows = page.locator("tbody tr");
    await expect(routineRows.first()).toBeVisible();
    test.skip(
      (await routineRows.first().innerText()).match(/no data/i) !== null,
      "JON ONG has no routines to expand."
    );

    const routineRow = routineRows.first();
    const exclusionTable = page.locator("tbody table");

    await test.step("Clicking a cell expands the routine's exclusions", async () => {
      await routineRow.locator("td").nth(1).click();
      await expect(exclusionTable).toBeVisible();
      await expect(exclusionTable.getByRole("columnheader", { name: "Remarks" })).toBeVisible();
    });

    await test.step("Clicking the cell again collapses the row", async () => {
      await routineRow.locator("td").nth(1).click();
      await expect(exclusionTable).toHaveCount(0);
    });
  });
});
