import { test, expect, type Page } from "@playwright/test";
import { parse, startOfDay } from "date-fns";
import { appBaseUrl, login, supervisorEmail, supervisorPassword } from "./helpers";

async function tabCount(page: Page, name: "Active" | "Expired"): Promise<number> {
  const label = await page.getByRole("tab", { name: new RegExp(`^${name} \\(\\d+\\)$`) }).innerText();
  return Number(label.match(/\((\d+)\)/)![1]);
}

async function endDates(page: Page): Promise<Date[]> {
  const panel = page.getByRole("tabpanel");
  const headers = await panel.locator("thead th").allInnerTexts();
  const endDateColumn = headers.findIndex((header) => header.trim() === "End Date");
  expect(endDateColumn, "End Date column not found").toBeGreaterThanOrEqual(0);

  const cells = await panel.locator(`tbody tr td:nth-child(${endDateColumn + 1})`).allInnerTexts();
  return cells.map((text) => parse(text.trim(), "dd-MMM-yyyy", new Date()));
}

test("Supervisor - Manage Adhoc Active and Expired Tabs", async ({ page }) => {
  const today = startOfDay(new Date());
  let activeCount = 0;
  let expiredCount = 0;

  await test.step("Login as Supervisor", async () => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  await test.step("Open Manage Adhoc", async () => {
    await page.goto(`${appBaseUrl}/supervisor/manage-adhoc`);
    await expect(page.getByRole("heading", { name: "Manage Adhoc" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /^Active \(\d+\)$/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /^Expired \(\d+\)$/ })).toBeVisible();

    activeCount = await tabCount(page, "Active");
    expiredCount = await tabCount(page, "Expired");
    expect(activeCount + expiredCount, "There are no adhoc activities to split into tabs.").toBeGreaterThan(0);
  });

  await test.step("Active tab is selected by default and lists editable adhocs", async () => {
    await expect(page.getByRole("tab", { name: /^Active/ })).toHaveAttribute("aria-selected", "true");
    const panel = page.getByRole("tabpanel");

    if (activeCount === 0) {
      await expect(panel.getByText("No active adhoc activities.")).toBeVisible();
      return;
    }

    const rows = panel.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeLessThanOrEqual(activeCount);

    for (const row of await rows.all()) {
      await expect(row.getByRole("button", { name: "Edit" })).toBeVisible();
      await expect(row.getByRole("button", { name: "Delete" })).toBeVisible();
    }
    for (const endDate of await endDates(page)) {
      expect(endDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
    }
  });

  await test.step("Expired tab lists past adhocs as read-only", async () => {
    await page.getByRole("tab", { name: /^Expired/ }).click();
    await expect(page.getByRole("tab", { name: /^Expired/ })).toHaveAttribute("aria-selected", "true");
    const panel = page.getByRole("tabpanel");

    if (expiredCount === 0) {
      await expect(panel.getByText("No expired adhoc activities.")).toBeVisible();
      return;
    }

    const rows = panel.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeLessThanOrEqual(expiredCount);

    await expect(panel.getByRole("button", { name: "Edit" })).toHaveCount(0);
    await expect(panel.getByRole("button", { name: "Delete" })).toHaveCount(0);
    await expect(panel.locator("thead th").filter({ hasText: /^Actions?$/ })).toHaveCount(0);

    for (const endDate of await endDates(page)) {
      expect(endDate.getTime()).toBeLessThan(today.getTime());
    }
  });
});
