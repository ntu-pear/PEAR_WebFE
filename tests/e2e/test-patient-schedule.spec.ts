import { test, expect, type Page, type Response } from "@playwright/test";
import {
  appBaseUrl,
  guardianEmail,
  guardianPassword,
  login,
  supervisorEmail,
  supervisorPassword,
} from "./helpers";

const SLOT_LABEL = /^\d{2}:00 - \d{2}:00$/;

type WorkingHours = Record<string, { open?: string | null; close?: string | null } | null>;

function isCareCentreList(response: Response) {
  return response.request().method() === "GET" && /\/care_centres\/?$/.test(new URL(response.url()).pathname);
}

function expectedTimeSlots(workingHours: WorkingHours): string[] {
  const openDays = Object.values(workingHours).filter((day) => day?.open && day?.close);
  const openHour = Math.min(...openDays.map((day) => Number(day!.open!.split(":")[0])));
  const closeHour = Math.max(
    ...openDays.map((day) => {
      const [hour, minute] = day!.close!.split(":").map(Number);
      return minute > 0 ? hour + 1 : hour;
    })
  );
  const pad = (hour: number) => hour.toString().padStart(2, "0");
  return Array.from({ length: Math.max(closeHour - openHour, 1) }, (_, i) => {
    const hour = openHour + i;
    return `${pad(hour)}:00 - ${pad(hour + 1)}:00`;
  });
}

async function waitForScheduleLoaded(page: Page) {
  await expect(page.getByText("Loading schedule...")).toHaveCount(0, { timeout: 60_000 });
}

async function patientPickerCount(page: Page): Promise<number> {
  const picker = page.locator("div.w-80").getByRole("combobox");
  if (await picker.isDisabled()) return 0;
  await picker.click();
  const count = await page.getByRole("option").count();
  await page.keyboard.press("Escape");
  return count;
}

test("Supervisor - Patient Schedule Page", async ({ page }) => {
  test.setTimeout(120_000);

  let workingHours: WorkingHours = {};

  await test.step("Login as Supervisor", async () => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  await test.step("Open Patient Schedule", async () => {
    const careCentres = page.waitForResponse(isCareCentreList);
    await page.goto(`${appBaseUrl}/supervisor/patient-schedule`);

    const body = await (await careCentres).json();
    const centres = Array.isArray(body) ? body : body.data;
    workingHours = centres[0].working_hours;

    await waitForScheduleLoaded(page);
    await expect(page.getByRole("button", { name: /Generate Schedule|Regenerate Schedule/ })).toBeVisible();
  });

  await test.step("Weekly view is the default and shows a patient picker", async () => {
    await expect(page.getByRole("heading", { name: /^Patient Schedule - \w{3} \d{2} - \w{3} \d{2}, \d{4}$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Weekly", exact: true })).toBeVisible();
    await expect(page.locator("div.w-80").getByRole("combobox")).toBeVisible();
  });

  await test.step("My Patients is selected by default and All Patients shows at least as many", async () => {
    const myPatientsTab = page.getByRole("tab", { name: "My Patients" });
    const allPatientsTab = page.getByRole("tab", { name: "All Patients" });

    await expect(myPatientsTab).toHaveAttribute("aria-selected", "true");
    const myPatients = await patientPickerCount(page);

    await allPatientsTab.click();
    await expect(allPatientsTab).toHaveAttribute("aria-selected", "true");
    const allPatients = await patientPickerCount(page);

    expect(allPatients).toBeGreaterThan(0);
    expect(allPatients).toBeGreaterThanOrEqual(myPatients);
  });

  await test.step("Weekly view renders the selected patient's week", async () => {
    await expect(page.getByText(/^Week of \w{3} \d{2}, \d{4}$/)).toBeVisible();
    await expect(page.getByText("No schedule data available.")).toHaveCount(0);
  });

  await test.step("Weekly view time rows follow the centre's opening hours", async () => {
    const slots = expectedTimeSlots(workingHours);
    await expect(page.locator("main div.sticky.left-0").getByText(SLOT_LABEL)).toHaveText(slots);
  });

  await test.step("Daily view lists patients against the centre's opening hours", async () => {
    await page.getByRole("button", { name: "Daily", exact: true }).click();

    await expect(page.getByRole("heading", { name: /^Patient Schedule - \w+, \w+ \d{2}, \d{4}$/ })).toBeVisible();
    await expect(page.locator("div.w-80").getByRole("combobox")).toHaveCount(0);
    await expect(page.getByTitle("Edit activity preferences").first()).toBeVisible();
    await expect(page.locator("main div.sticky.top-0").first().getByText(SLOT_LABEL)).toHaveText(
      expectedTimeSlots(workingHours)
    );
  });
});

test("Guardian - Patient Schedule Page", async ({ page }) => {
  test.setTimeout(120_000);

  const requestedPatientIds = new Set<string>();
  let fullScheduleRequests = 0;
  let guardianPatientCount = 0;

  page.on("request", (request) => {
    const patientSchedule = request.url().match(/\/schedule\/patient\/(\d+)\//);
    if (patientSchedule) requestedPatientIds.add(patientSchedule[1]);
    if (/\/schedule\/getSchedule\//.test(request.url())) fullScheduleRequests++;
  });

  await test.step("Login as Guardian", async () => {
    await login(page, guardianEmail, guardianPassword);
    await page.waitForURL(/\/guardian\/manage-patients/);
    await page.getByRole("tab").first().waitFor({ state: "visible" });
    guardianPatientCount = await page.getByRole("tab").count();
  });

  await test.step("Open Patient Schedule", async () => {
    await page.goto(`${appBaseUrl}/guardian/patient-schedule`);
    await waitForScheduleLoaded(page);
    await expect(page.getByRole("heading", { name: /^Patient Schedule - / })).toBeVisible();
  });

  await test.step("Guardian cannot generate schedules or filter by staff", async () => {
    await expect(page.getByRole("button", { name: /Generate Schedule|Regenerate Schedule/ })).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "My Patients" })).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "All Patients" })).toHaveCount(0);
    await expect(page.getByTitle("Edit activity preferences")).toHaveCount(0);
  });

  await test.step("Weekly view lists the guardian's patients as buttons", async () => {
    await expect(page.locator("div.w-80").getByRole("combobox")).toHaveCount(0);
    await expect(page.getByText(/^Week of \w{3} \d{2}, \d{4}$/)).toBeVisible();
    await expect(page.getByText("No schedule data available.")).toHaveCount(0);
  });

  await test.step("Only the guardian's own patients' schedules are fetched", async () => {
    await expect.poll(() => requestedPatientIds.size).toBe(guardianPatientCount);
    expect(fullScheduleRequests).toBe(0);
  });
});
