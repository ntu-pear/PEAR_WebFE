import { test, expect } from '@playwright/test';
import exp from 'constants';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(process.cwd(), 'tests/e2e/test.env') });

const frontendUrl = process.env.FRONTEND_URL!;
if (!frontendUrl) throw new Error('Missing FRONTEND_URL');
const guardianEmail = process.env.GUARDIAN_ACCOUNT_EMAIL!;
if (!guardianEmail) throw new Error('Missing GUARDIAN_ACCOUNT_EMAIL');
const guardianPassword = process.env.GUARDIAN_ACCOUNT_PASSWORD!;
if (!guardianPassword) throw new Error('Missing GUARDIAN_ACCOUNT_PASSWORD')

// testing manage patient, GUARDIAN role
test('Guardian - Manage Patient Page', async ({ page }) => {
    await page.goto(frontendUrl!);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).click();
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(guardianEmail);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(guardianPassword);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Wait for navigation to complete and page to be fully loaded else menu button might not work
    await page.waitForURL(/\/(?!login)/); // Wait for URL to change from login page
    await page.waitForLoadState('networkidle'); // Wait for network requests to finish
    await page.waitForURL(/guardian\/manage-patients/);

    const patientTabs = await page.getByRole('tab')
    await patientTabs.first().waitFor({ state: 'visible' });
    const tabCount = await patientTabs.count();
    await expect(tabCount).toBeGreaterThan(0)

    // Loop through each tab
    for (let i = tabCount - 1; i >= 0; i--) {
        const tab = patientTabs.nth(i)
        const tabName = (await tab.textContent())?.trim()
        console.log("Clicking next patient: ", tabName)
        await tab.click()
        const tabContent = page.getByRole('tabpanel', { name: tabName! })
        await expect(tabContent).toBeVisible()
        const viewMoreBtn = page.getByRole('button', { name: "View More" }).first()
        await expect(viewMoreBtn).toBeVisible()
        await viewMoreBtn.click()
        await expect(page).toHaveURL(new RegExp(`/guardian/view-patient/\\d\\?tab=information`))
        await page.goBack()
        await page.waitForURL(/guardian\/manage-patients/);
    }
})