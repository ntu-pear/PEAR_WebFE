// tests/view-lists.e2e.spec.ts
import { test, expect } from "@playwright/test";
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

test("Supervisor: View and filter lists", async ({ page }) => {
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

  await test.step("Navigate to lists page", async () => {
    await page
      .getByRole("button")
      .filter({ has: page.locator(".lucide-menu") })
      .click();
    await page.getByText("Manage List Items").click();
    await expect(
      page.getByRole("heading").filter({ hasText: "View Lists" })
    ).toBeVisible();
  });

  await test.step("Check callout visible", async () => {
    await expect(
      page.getByText("Need to add, edit, or delete a list item?")
    ).toBeVisible();
  });

  await test.step("Check lists table is visible with data", async () => {
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.locator("th", { hasText: "Value" })).toBeVisible();

    const rows = await page.locator("tr", { hasNot: page.locator("th") }).all();
    await expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  await test.step("Filter list items by value", async () => {
    const keyword = "ea";
    await page.getByPlaceholder("Search...").fill(keyword);
    await page.waitForTimeout(2000);
    const rows = await page.locator("tr", { hasNot: page.locator("th") }).all();

    for (const row of rows) {
      await expect(await row.getByRole("cell").nth(0).textContent()).toContain(
        keyword
      );
    }

    await page.getByPlaceholder("Search...").fill(""); // Clear search
  });

  await test.step("Filter list items by type", async () => {
    const type = "Diet";
    await page.getByRole("button", { name: "List Type" }).click();
    await page.locator("role=menuitemradio", { hasText: type }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(type)).not.toBeVisible();

    const rows = await page.locator("tr", { hasNot: page.locator("th") }).all();
    await expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  await test.step("Check no actions available", async () => {
    await expect(
      page.getByRole("button", { name: /add new|\badd\b/i })
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: /update/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /delete/i })).toHaveCount(0);
  });
});
