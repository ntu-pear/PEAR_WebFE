import { expect, type Page, type Response } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { format } from "date-fns";

dotenv.config({ path: path.resolve(process.cwd(), "tests/e2e/test.env") });

const frontendUrl = process.env.FRONTEND_URL!;
if (!frontendUrl) throw new Error("Missing FRONTEND_URL");

export const appBaseUrl = new URL(frontendUrl).origin;

export const supervisorEmail = process.env.SUPERVISOR_ACCOUNT_EMAIL!;
export const supervisorPassword = process.env.SUPERVISOR_ACCOUNT_PASSWORD!;
export const guardianEmail = process.env.GUARDIAN_ACCOUNT_EMAIL!;
export const guardianPassword = process.env.GUARDIAN_ACCOUNT_PASSWORD!;
export const adminEmail = process.env.ADMIN_ACCOUNT_EMAIL!;
export const adminPassword = process.env.ADMIN_ACCOUNT_PASSWORD!;

export const TODAY = format(new Date(), "yyyy-MM-dd");
const PATIENT_DOB = "1950-06-15";
const GUARDIAN_DOB = "1975-03-20";

export async function login(page: Page, email: string, password: string) {
  await page.goto(`${appBaseUrl}/login`);
  await page.getByRole("textbox", { name: "Enter a valid email address." }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "LOGIN" }).click();
  await expect(page.getByText("Login successful.")).toBeVisible();
}

type NRICPrefix = "S" | "T" | "F" | "G";

const ST_CHECKS = ["J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
const FG_CHECKS = ["X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K"];

export function generateNRIC(prefix: NRICPrefix = "S"): string {
  const weights = [2, 7, 6, 5, 4, 3, 2];
  const digits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
  let sum = digits.reduce((acc, digit, i) => acc + digit * weights[i], 0);
  if (prefix === "T" || prefix === "G") sum += 4;
  const checks = prefix === "S" || prefix === "T" ? ST_CHECKS : FG_CHECKS;
  return `${prefix}${digits.join("")}${checks[sum % 11]}`;
}

export function withWrongCheckLetter(nric: string): string {
  const checks = nric.startsWith("S") || nric.startsWith("T") ? ST_CHECKS : FG_CHECKS;
  const wrong = checks.find((letter) => letter !== nric.slice(-1))!;
  return `${nric.slice(0, -1)}${wrong}`;
}

const FIRST_NAMES = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah", "Ivan", "Julia"];
const LAST_NAMES = ["Tan", "Lim", "Lee", "Wong", "Chen", "Ng", "Goh", "Chua", "Ong", "Koh"];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomContactNo(): string {
  return `9${Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join("")}`;
}

export interface Identity {
  firstName: string;
  lastName: string;
  fullName: string;
  preferredName: string;
  nric: string;
  contactNo: string;
}

export function generateIdentity(prefix: NRICPrefix = "S"): Identity {
  const first = randomItem(FIRST_NAMES).toUpperCase();
  const last = randomItem(LAST_NAMES).toUpperCase();
  return {
    firstName: `TESTING ${first}`,
    lastName: last,
    fullName: `TESTING ${first} ${last}`,
    preferredName: `TESTING ${first}`,
    nric: generateNRIC(prefix),
    contactNo: randomContactNo(),
  };
}

export async function fillPatientDetails(page: Page, patient: Identity) {
  await page.fill("#patient-name", patient.fullName);
  await page.fill("#patient-preferred-name", patient.preferredName);
  await page.fill("#patient-nric", patient.nric);
  await page.fill("#patient-dob", PATIENT_DOB);
  await page.check("#patient-gender-male");
  await page.fill("#patient-home-number", "61234567");
  await page.fill("#patient-handphone-number", patient.contactNo);
  await page.fill("#patient-address", "123 ORCHARD ROAD SINGAPORE 238858");
  await page.selectOption("#patient-preferred-language", { index: 1 });
  await page.check("#patient-respite-care-no");
  await page.fill("#patient-joining-date", TODAY);
}

export async function fillNewGuardian(page: Page, index: number, guardian: Identity, relationship = "Child") {
  await page.fill(`input[name="guardians.${index}.firstName"]`, guardian.firstName);
  await page.fill(`input[name="guardians.${index}.lastName"]`, guardian.lastName);
  await page.fill(`input[name="guardians.${index}.preferredName"]`, guardian.preferredName);
  await page.selectOption(`select[name="guardians.${index}.relationshipName"]`, relationship);
  await page.fill(`input[name="guardians.${index}.nric"]`, guardian.nric);
  await page.fill(`input[name="guardians.${index}.dateOfBirth"]`, GUARDIAN_DOB);
  await page.check(`input[value="F"][name="guardians.${index}.gender"]`);
  await page.fill(`input[name="guardians.${index}.contactNo"]`, guardian.contactNo);
  await page.fill(`input[name="guardians.${index}.address"]`, "456 BUKIT TIMAH ROAD SINGAPORE 259756");
}

export async function openAddPatientForm(page: Page) {
  await page.goto(`${appBaseUrl}/supervisor/add-patient`);
  await page.waitForSelector("#personal-info");
}

export async function submitAddPatient(page: Page): Promise<number> {
  const addPatientResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && /\/patients\/add(\?|$)/.test(response.url())
  );

  await page.locator('button[type="submit"]', { hasText: "Add Patient" }).click();

  const body = await (await addPatientResponse).json();
  await expect(page.getByText("Patient Created Successfully")).toBeVisible({ timeout: 15_000 });

  return Number(body.data.id);
}

export async function createPatientWithNewGuardian(page: Page) {
  const patient = generateIdentity("S");
  const guardian = generateIdentity("T");

  await openAddPatientForm(page);
  await fillPatientDetails(page, patient);
  await fillNewGuardian(page, 0, guardian);
  const patientId = await submitAddPatient(page);

  return { patientId, patient, guardian };
}

export interface GuardianPatient {
  id: number;
  isPrimary: boolean;
}

function isGet(response: Response, pathPattern: RegExp) {
  return response.request().method() === "GET" && pathPattern.test(new URL(response.url()).pathname);
}

export async function loginAsGuardianAndListPatients(page: Page): Promise<GuardianPatient[]> {
  const currentUserResponse = page.waitForResponse((r) => isGet(r, /\/current_user\/?$/) && r.ok());
  await login(page, guardianEmail, guardianPassword);
  const { userId } = await (await currentUserResponse).json();

  await page.waitForURL(/\/guardian\/manage-patients/);
  const patientTabs = page.getByRole("tab");
  await patientTabs.first().waitFor({ state: "visible" });
  const count = await patientTabs.count();

  const patients: GuardianPatient[] = [];
  for (let i = 0; i < count; i++) {
    await patientTabs.nth(i).click();

    const allocationResponse = page.waitForResponse((r) => isGet(r, /\/allocation\/patient\/\d+\/?$/));
    await page.getByRole("button", { name: "View More" }).first().click();
    await expect(page).toHaveURL(/\/guardian\/view-patient\/\d+/);

    const allocation = await (await allocationResponse).json();
    patients.push({
      id: Number(page.url().match(/view-patient\/(\d+)/)![1]),
      isPrimary: allocation.guardianApplicationUserId === userId,
    });

    await page.goBack();
    await patientTabs.first().waitFor({ state: "visible" });
  }

  return patients;
}

export async function openPatientTab(
  page: Page,
  patientId: number,
  tab: string,
  role: "supervisor" | "guardian" = "supervisor"
) {
  await page.goto(`${appBaseUrl}/${role}/view-patient/${patientId}?tab=${tab}`);
}
