import { test, expect, type Locator } from "@playwright/test";
import { appBaseUrl, login, supervisorEmail, supervisorPassword } from "./helpers";

const DAYS = [
  { label: "Mon", key: "monday" },
  { label: "Tue", key: "tuesday" },
  { label: "Wed", key: "wednesday" },
  { label: "Thu", key: "thursday" },
  { label: "Fri", key: "friday" },
  { label: "Sat", key: "saturday" },
  { label: "Sun", key: "sunday" },
];

type WorkingHours = Record<string, { open?: string | null; close?: string | null } | null>;

async function setTime(group: Locator, hour24: number) {
  const selects = group.locator("select");
  await selects.nth(0).selectOption((hour24 % 12 || 12).toString().padStart(2, "0"));
  await selects.nth(1).selectOption("00");
  await selects.nth(2).selectOption(hour24 < 12 ? "AM" : "PM");
}

test("Supervisor - Activity Availability follows the centre's opening hours", async ({ page }) => {
  let workingHours: WorkingHours = {};

  await test.step("Login as Supervisor", async () => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  await test.step("Open Manage Activity Availability", async () => {
    const careCentres = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" && /\/care_centres\/?$/.test(new URL(response.url()).pathname)
    );
    await page.goto(`${appBaseUrl}/supervisor/manage-activity-availabilities`);

    const body = await (await careCentres).json();
    workingHours = (Array.isArray(body) ? body : body.data)[0].working_hours;

    await expect(page.getByText("Manage Centre Activity Availability")).toBeVisible();
  });

  await test.step("Select a centre activity", async () => {
    const activitySelect = page.getByLabel("Select centre activity to schedule:");
    const firstActivity = await activitySelect
      .locator("option:not([disabled])")
      .first()
      .getAttribute("value");
    expect(firstActivity, "No centre activities to schedule.").toBeTruthy();
    await activitySelect.selectOption(firstActivity!);
  });

  const openDays = () => DAYS.filter((day) => workingHours[day.key]?.open && workingHours[day.key]?.close);

  await test.step("Recurring days are the centre's open days", async () => {
    await page.getByRole("button", { name: "Add Availability" }).click();
    const sheet = page.getByRole("dialog", { name: "Create Availability" });
    await expect(sheet).toBeVisible();

    await sheet.getByRole("radio", { name: "Yes" }).check();
    await expect(sheet.getByText("Select days of the week:")).toBeVisible();

    const dayLabels = await sheet
      .locator('label:has(input[type="checkbox"][value])')
      .allInnerTexts();
    expect(dayLabels.map((label) => label.trim())).toEqual(openDays().map((day) => day.label));

    await sheet.getByText("Every open day").click();
    for (const day of openDays()) {
      await expect(sheet.getByRole("checkbox", { name: day.label, exact: true })).toBeChecked();
    }
  });

  await test.step("Times before the centre opens are rejected", async () => {
    const sheet = page.getByRole("dialog", { name: "Create Availability" });
    const hours = openDays().map((day) => workingHours[day.key]!);
    const open = hours.reduce((latest, h) => (h.open! > latest ? h.open! : latest), hours[0].open!);
    const close = hours.reduce((earliest, h) => (h.close! < earliest ? h.close! : earliest), hours[0].close!);
    const openHour = Number(open.split(":")[0]);
    test.skip(openHour < 1, "The centre opens at midnight, so there is no earlier hour to try.");

    await setTime(sheet.getByText("Start Time", { exact: true }).locator(".."), openHour - 1);
    await setTime(sheet.getByText("End Time", { exact: true }).locator(".."), openHour);
    await sheet.getByRole("button", { name: "Create", exact: true }).click();

    await expect(
      sheet.getByText(`The activity must fall within the care centre's opening hours. (${open} to ${close})`)
    ).toBeVisible();
    await expect(page.getByText("Centre Activity Availability created.")).toHaveCount(0);
  });
});
