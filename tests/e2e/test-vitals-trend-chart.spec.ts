import { test, expect, type Locator, type Page } from "@playwright/test";
import {
  createPatientWithNewGuardian,
  login,
  openPatientTab,
  supervisorEmail,
  supervisorPassword,
} from "./helpers";

const VITAL = {
  Temperature: "36.8",
  Weight: "65",
  Height: "1.65",
  SystolicBP: "120",
  DiastolicBP: "80",
  HeartRate: "72",
  SpO2: "98",
  BloodSugarLevel: "7",
};

function chartSection(page: Page, heading: string): Locator {
  return page.locator("div").filter({ has: page.getByRole("heading", { name: heading }) }).filter({ has: page.locator("svg.recharts-surface") }).last();
}

async function yAxisTicks(section: Locator): Promise<string[]> {
  return section.locator(".recharts-yAxis .recharts-cartesian-axis-tick-value").allInnerTexts();
}

test("Supervisor - Vitals Trend Chart", async ({ page }) => {
  test.setTimeout(150_000);

  let patientId = 0;

  await test.step("Login as Supervisor", async () => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  await test.step("Create a patient with no vital records", async () => {
    ({ patientId } = await createPatientWithNewGuardian(page));
  });

  await test.step("Trends tab shows an empty state before any vitals are added", async () => {
    await openPatientTab(page, patientId, "vital");
    await page.getByRole("tab", { name: "Trends" }).click();
    await expect(page.getByText("No vital records yet to chart.")).toBeVisible();
  });

  await test.step("Add a vital record", async () => {
    await page.getByRole("tab", { name: "Table" }).click();
    await page.getByRole("button", { name: "Add", exact: true }).click();

    const form = page.locator("form").filter({ has: page.locator('input[name="Temperature"]') });
    for (const [name, value] of Object.entries(VITAL)) {
      await form.locator(`input[name="${name}"]`).fill(value);
    }
    await form.locator('textarea[name="VitalRemarks"]').fill("Playwright vitals trend check");
    await form.locator('select[name="IsAfterMeal"]').selectOption("0");
    await form.getByRole("button", { name: "Add", exact: true }).click();

    await expect(page.getByText("Vital added successfully.")).toBeVisible();
  });

  await test.step("Trends tab defaults to Last 30 Days and charts the reading", async () => {
    await page.getByRole("tab", { name: "Trends" }).click();

    await expect(page.getByRole("tab", { name: "Last 30 Days" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: "Blood Pressure (mmHg)" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Weight (kg)" })).toBeVisible();
    await expect(page.locator(".recharts-legend-wrapper").getByText("Systolic")).toBeVisible();
    await expect(page.locator(".recharts-legend-wrapper").getByText("Diastolic")).toBeVisible();
    await expect(page.locator("circle.recharts-line-dot")).toHaveCount(3);
  });

  await test.step("Y axes scale to the readings instead of starting at 0", async () => {
    const bpTicks = await yAxisTicks(chartSection(page, "Blood Pressure (mmHg)"));
    expect(bpTicks).toEqual(["80", "90", "100", "110", "120"]);

    const weightTicks = await yAxisTicks(chartSection(page, "Weight (kg)"));
    expect(weightTicks).toEqual(["65", "66"]);
  });

  await test.step("Switching range keeps the chart", async () => {
    for (const range of ["Last 90 Days", "All Time"]) {
      await page.getByRole("tab", { name: range }).click();
      await expect(page.getByRole("tab", { name: range })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("heading", { name: "Blood Pressure (mmHg)" })).toBeVisible();
      await expect(page.getByText("No vital records in this range.")).toHaveCount(0);
    }
  });
});
