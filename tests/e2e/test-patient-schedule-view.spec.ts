import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Read from "test.env" file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'test.env') });

// these are the variables used in the test to be included in the .env file
const frontendUrl = process.env.FRONTEND_URL as string;
const supervisorAccountEmail = process.env.SUPERVISOR_ACCOUNT_EMAIL as string;
const supervisorAccountPassword = process.env.SUPERVISOR_ACCOUNT_PASSWORD as string;
// IP address of the host server not needed since scheduler is on different server

// Ensure all required environment variables are set
if (!frontendUrl || !supervisorAccountEmail || !supervisorAccountPassword) {
  throw new Error('Missing required environment variables in test.env');
}

test('Supervisor: View Patient Scheduled Activities', async ({ page }) => {
  await page.goto(frontendUrl);
  await page.getByRole('textbox', { name: 'Enter a valid email address.' }).click();
  await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(supervisorAccountEmail);
  await page.getByRole('textbox', { name: 'Enter a valid email address.' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(supervisorAccountPassword);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Wait for navigation to complete and page to be fully loaded else menu button might not work
  await page.waitForURL(/\/(?!login)/); // Wait for URL to change from login page
  await page.waitForLoadState('networkidle'); // Wait for network requests to finish

  // navigate to the schedule page
  await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
  await page.locator('a').filter({ hasText: 'Patient Schedule' }).click();
  
  await page.locator('div').filter({ hasText: /^Generate Schedule$/ }).click();
  // check that the timetable is visible
  await expect(page.getByRole('main').filter({ hasText: 'Toggle themeToggle themeToday' }).getByRole('main')).toBeVisible();

  // Find and capture the first patient's display text (try both formats)
  let patientElement = page.locator('div').filter({ hasText: /\(ID: \d+\)Active$/ }).first();
  let patientDisplayText: string | null = null;
  let patientSearchTerm = '';

  // try to find name with format "NAME (ID: X)Active", might fail if backend does not return the name
  try {
    await expect(patientElement).toBeVisible();
    patientDisplayText = await patientElement.textContent();
    console.log('Found patient with full format:', patientDisplayText);
    
    // Extract the name part since the textcontent will include timeslots text
    const patientNameMatch = patientDisplayText?.match(/^(.+?)\s*\(ID: \d+\)Active/);
    patientSearchTerm = patientNameMatch ? patientNameMatch[1].trim() : "";
    if (patientSearchTerm === "") {
      throw new Error("Could not extract patient name");
    }
  } catch (error) {
    // If that fails, try to find the fallback format "Patient ID: X"
    console.log('Full format not found, trying fallback format...');
    patientElement = page.locator('div').filter({ hasText: /^Patient ID: \d+/ }).first();
    await expect(patientElement).toBeVisible();
    patientDisplayText = await patientElement.textContent();
    console.log('Found patient with fallback format:', patientDisplayText);
    
    // Extract the name part since the textcontent will include timeslots text
    const fallbackMatch = patientDisplayText?.match(/^(Patient ID: \d+)/);
    patientSearchTerm = fallbackMatch ? fallbackMatch[1] : "Patient ID";
  }
  
  console.log('Will search for:', patientSearchTerm);
  
  // swap to daily view
  await page.getByRole('button', { name: 'Daily' }).click();
  // click on an activity in the timetable
  await page.locator('div:nth-child(3) > .relative').first().click();
  // Check that the modal appears with activity details
  await expect(page.getByText('Activity Details')).toBeVisible();
  await expect(page.locator('span').filter({ hasText: patientSearchTerm })).toBeVisible();
  // close the modal using the test ID
  await page.getByTestId('activity-details-close-button').click();

  // check that the gear icon is beside the patient name
  await expect(page.locator('.sticky > .p-1').first()).toBeVisible();
  // the export button is visible
  await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
  
  // Test patient search functionality
  await page.getByRole('textbox', { name: 'Search patients...' }).click();
  await page.getByRole('textbox', { name: 'Search patients...' }).fill(patientSearchTerm);
  // Verify search results show the expected patient using exact text match
  await expect(page.getByText(patientSearchTerm, { exact: true })).toBeVisible();
});