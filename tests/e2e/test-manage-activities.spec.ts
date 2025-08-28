import { test, expect, Page } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "test.env") });

const frontendUrl = process.env.FRONTEND_URL as string;
const supervisorAccountEmail = process.env.SUPERVISOR_ACCOUNT_EMAIL as string;
const supervisorAccountPassword = process.env
  .SUPERVISOR_ACCOUNT_PASSWORD as string;

async function fillByLabel(page: Page, labelText: string, value: string) {
  const container = page
    .locator("label", { hasText: labelText })
    .first()
    .locator("xpath=..");
  const control = container.locator("input,textarea").first();
  await control.fill(value);
}
async function fillDateByLabel(page: Page, labelText: string, ymd: string) {
  const container = page
    .locator("label", { hasText: labelText })
    .first()
    .locator("xpath=..");
  await container.locator('input[type="date"]').fill(ymd);
}
async function selectByLabel(page: Page, labelText: string, value: string) {
  const container = page
    .locator("label", { hasText: labelText })
    .first()
    .locator("xpath=..");
  await container.locator("select").selectOption(value);
}

test("Supervisor: View, Filter, Add, Edit and Delete Activity", async ({
  page,
}) => {
  await test.step("Navigate and login to supervisor account", async () => {
    await page.goto(frontendUrl);
    await page
      .getByRole("textbox", { name: "email" })
      .fill(supervisorAccountEmail);
    await page
      .getByRole("textbox", { name: "password" })
      .fill(supervisorAccountPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForResponse((resp) => resp.url().includes("/login")); // wait for login api to return

    await expect(page.getByText("Login successful.")).toBeVisible();
    await expect(
      page.getByRole("heading").filter({ hasText: "Manage Patients" })
    ).toBeVisible();
  });

  await test.step("Navigate to activities page", async () => {
    await page
      .getByRole("button")
      .filter({ has: page.locator(".lucide-menu") })
      .click();
    await page.getByText("Manage Activities").click();
    await expect(
      page.getByRole("heading").filter({ hasText: "Manage Activities" })
    ).toBeVisible();
  });

  await test.step("Check activities table visible with data", async () => {
    await expect(page.getByRole("table")).toBeVisible();

    const headers = [
      "Title",
      "Description",
      "Compulsory",
      "Fixed",
      "Group",
      "Fixed Time Slots",
      "Start Date",
      "End Date",
      "Actions",
    ];
    for (const header of headers) {
      await expect(
        page.locator("th", { hasText: header }).first()
      ).toBeVisible();
    }

    const rows = await page.locator("tr").all();
    expect(rows.length).toBeGreaterThan(1);
  });

  await test.step("Filter activities by title", async () => {
    const keyword = "br";
    await page.getByPlaceholder("Search...").fill(keyword);
    await page.waitForTimeout(2000);
    const cell = await page
      .locator("tr", { hasNot: page.locator("th") })
      .first()
      .getByRole("cell")
      .nth(0)
      .textContent();
    expect(cell?.toLowerCase()).toContain(keyword.toLowerCase());

    await page.getByPlaceholder("Search...").fill(""); // Clear search
  });

  await test.step("Filter activities by compulsory", async () => {
    const compulsory = "Yes";

    await page.getByRole("button", { name: "Compulsory" }).click();
    await page.locator("role=menuitemradio", { hasText: "Yes" }).click();
    await page.waitForTimeout(2000);

    const rows = await page.locator("tr", { hasNot: page.locator("th") }).all();
    for (const row of rows) {
      const cell = await row.getByRole("cell").nth(2).textContent();
      expect(cell).toBe(compulsory);
    }
  });

  await test.step("Filter activities by fixed", async () => {
    const fixed = "Yes";

    await page.getByRole("button", { name: "Fixed" }).click();
    await page.locator("role=menuitemradio", { hasText: "Yes" }).click();
    await page.waitForTimeout(2000);

    const rows = await page.locator("tr", { hasNot: page.locator("th") }).all();
    for (const row of rows) {
      const cell = await row.getByRole("cell").nth(3).textContent();
      expect(cell).toBe(fixed);
    }
  });

  await test.step("Filter activities by group", async () => {
    const group = "Yes";

    await page.getByRole("button", { name: "Group" }).click();
    await page.locator("role=menuitemradio", { hasText: "Yes" }).click();
    await page.waitForTimeout(2000);

    const rows = await page.locator("tr", { hasNot: page.locator("th") }).all();
    for (const row of rows) {
      const cell = await row.getByRole("cell").nth(4).textContent();
      expect(cell).toBe(group);
    }
  });

  await test.step("Add centre activity", async () => {
    await page.getByRole("button", { name: "Add Centre Activity" }).click();

    await expect(
      page.getByRole("heading", { name: "Add Centre Activity" })
    ).toBeVisible();

    const name = "E2E Activity Add";
    await fillByLabel(page, "Activity Name", name);
    await fillByLabel(page, "Activity Description", "Added via E2E test");
    await fillByLabel(page, "Fixed Time Slots", "NIL");
    await fillDateByLabel(page, "Start Date", "2026-01-01");
    await fillDateByLabel(page, "End Date", "2026-01-10");
    await selectByLabel(page, "Is Compulsory?", "yes");
    await selectByLabel(page, "Is Fixed?", "yes");
    await selectByLabel(page, "Is Group?", "no");

    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Centre Activity Added!")).toBeVisible();
  });

  await test.step("Edit centre activity", async () => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.getByRole("button", { name: "Edit" }).click();

    await expect(
      page.getByRole("heading", { name: "Edit Centre Activity" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Centre Activity Updated!")).toBeVisible();
  });

  await test.step("Delete centre activity", async () => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.getByRole("button", { name: "Delete" }).click();

    await expect(
      page.getByRole("heading", { name: "Are you sure?" })
    ).toBeVisible();

    page.locator("button[type=submit]").click();
    await expect(page.getByText("Centre Activity Deleted!")).toBeVisible();
  });
});
