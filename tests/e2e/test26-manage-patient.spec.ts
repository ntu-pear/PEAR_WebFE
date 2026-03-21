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
const supervisorEmail = process.env.SUPERVISOR_ACCOUNT_EMAIL!;
if (!supervisorEmail) throw new Error('Missing SUPERVISOR_ACCOUNT_EMAIL');
const supervisorPassword = process.env.SUPERVISOR_ACCOUNT_PASSWORD!;
if (!supervisorPassword) throw new Error('Missing SUPERVISOR_ACCOUNT_PASSWORD')
const doctorEmail = process.env.DOCTOR_ACCOUNT_EMAIL!;
if (!doctorEmail) throw new Error('Missing SUPERVISOR_ACCOUNT_EMAIL');
const doctorPassword = process.env.DOCTOR_ACCOUNT_PASSWORD!;
if (!doctorPassword) throw new Error('Missing SUPERVISOR_ACCOUNT_PASSWORD')

async function login(page: any, email: string, password: string, roleUrl: string) {
    await page.goto(frontendUrl);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);

    const loginResponse = page.waitForResponse((resp: any) => resp.url().includes('/login'));
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await loginResponse;

    await expect(page.getByText('Login successful.')).toBeVisible();
    await page.waitForURL(new RegExp(`${roleUrl}/manage-patients`));
    if(roleUrl!="guardian")
        await page.getByRole('tab', { name: 'My Patients' }).waitFor({ state: 'visible' });
}

async function testSearchFilterViewMore(page: any, role: 'supervisor' | 'doctor') {
    await test.step('Search by patient name', async () => {
        const searchInput = page.getByRole('searchbox', { name: 'Search' });
        await searchInput.fill('JON ONG');
        await page.waitForTimeout(800);
        await page.locator('table tbody tr').first().waitFor({ state: 'visible' });

        const rows = page.locator('table tbody tr');
        const count = await rows.count();
        await expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const rowText = (await rows.nth(i).innerText()).toLowerCase();
            expect(rowText).toContain('jon ong');
        }
        console.log(`Search returned ${count} rows`);

        // Clear search before filter tests
        await searchInput.clear();
        await page.waitForTimeout(800);
        await page.locator('table tbody tr').first().waitFor({ state: 'visible' });
    });

    await test.step('Filter by Active status', async () => {
        const filterButton = page.getByRole('button', { name: 'Filter' });
        await filterButton.click();
        await expect(page.getByText('Filter by Status')).toBeVisible();

        await page.getByRole('menuitemradio', { name: 'Active', exact: true }).click();
        await page.waitForTimeout(800);
        await page.locator('table tbody tr').first().waitFor({ state: 'visible' });

        const inactiveBadges = page.locator('table tbody tr').getByText('Inactive', { exact: true });
        await expect(inactiveBadges).toHaveCount(0);
        console.log('Filtered by Active patients — no Inactive badges visible');
    });

    await test.step('Filter by Inactive status', async () => {
        const filterButton = page.getByRole('button', { name: 'Filter' });
        await filterButton.click();
        await expect(page.getByText('Filter by Status')).toBeVisible();

        await page.getByRole('menuitemradio', { name: 'Inactive', exact: true }).click();
        await page.waitForTimeout(800);
        // Inactive list may be empty — just wait for DOM to settle
        await page.waitForTimeout(500);

        const activeBadges = page.locator('table tbody tr').getByText('Active', { exact: true });
        await expect(activeBadges).toHaveCount(0);
        console.log('Filtered by Inactive patients — no Active badges visible');
    });

    await test.step('Reset filter to All', async () => {
        const filterButton = page.getByRole('button', { name: 'Filter' });
        await filterButton.click();
        await expect(page.getByText('Filter by Status')).toBeVisible();

        await page.getByRole('menuitemradio', { name: 'All', exact: true }).click();
        await page.waitForTimeout(800);
        await page.locator('table tbody tr').first().waitFor({ state: 'visible' });

        const allCount = await page.locator('table tbody tr').count();
        await expect(allCount).toBeGreaterThan(0);
        console.log(`Reset to All — ${allCount} rows visible`);
    });

    await test.step('Click View More on first row', async () => {
        const firstRow = page.locator('table tbody tr').first();
        await firstRow.waitFor({ state: 'visible' });

        const viewMoreBtn = firstRow.getByRole('link', { name: 'View More' });
        await expect(viewMoreBtn).toBeVisible();
        await viewMoreBtn.click();

        await expect(page).toHaveURL(new RegExp(`/${role}/view-patient/\\d+\\?tab=information`));
        console.log(`View More navigated to: ${page.url()}`);

        await page.goBack();
        await page.getByRole('tab', { name: 'My Patients' }).waitFor({ state: 'visible' });
    });
}

// testing manage patient, GUARDIAN role
test('Guardian - Manage Patient Page', async ({ page }) => {
    await test.step('Login as guardian', async () => {
        await login(page, guardianEmail, guardianPassword, 'guardian');
    });

    await test.step('Check patient tabs exist and click View More on each', async () => {
        const patientTabs = page.getByRole('tab');
        await patientTabs.first().waitFor({ state: 'visible' });
        const tabCount = await patientTabs.count();
        await expect(tabCount).toBeGreaterThan(0);

        for (let i = tabCount - 1; i >= 0; i--) {
            const tab = patientTabs.nth(i);
            const tabName = (await tab.textContent())?.trim();
            console.log('Clicking patient tab:', tabName);

            await tab.click();
            const tabContent = page.getByRole('tabpanel', { name: tabName! });
            await expect(tabContent).toBeVisible();

            const viewMoreBtn = page.getByRole('button', { name: 'View More' }).first();
            await expect(viewMoreBtn).toBeVisible();
            await viewMoreBtn.click();

            await expect(page).toHaveURL(new RegExp(`/guardian/view-patient/\\d+\\?tab=information`));
            await page.goBack();
            await page.getByRole('tab').first().waitFor({ state: 'visible' });
        }
    });
});

test('Supervisor - Manage Patient Page', async ({ page }) => {
    await test.step('Login as supervisor', async () => {
        await login(page, supervisorEmail, supervisorPassword, 'supervisor');
    });

    await test.step('Toggle between My Patients and All Patients tabs', async () => {
        const myPatientsTab = page.getByRole('tab', { name: 'My Patients' });
        const allPatientsTab = page.getByRole('tab', { name: 'All Patients' });

        await expect(myPatientsTab).toBeVisible();
        await expect(allPatientsTab).toBeVisible();
        await expect(myPatientsTab).toHaveAttribute('data-state', 'active');
        console.log('My Patients tab is active by default');

        await allPatientsTab.click();
        await expect(allPatientsTab).toHaveAttribute('data-state', 'active');
        await expect(page.getByText('Manage all patients and view their details.')).toBeVisible();
        console.log('Switched to All Patients tab');

        await myPatientsTab.click();
        await expect(myPatientsTab).toHaveAttribute('data-state', 'active');
        await expect(page.getByText('Manage your patients and view their details.')).toBeVisible();
        await page.locator('table tbody tr').first().waitFor({ state: 'visible' }); 
        console.log('Switched back to My Patients tab');
    });

    await testSearchFilterViewMore(page, 'supervisor');
});

test('Doctor - Manage Patient Page', async ({ page }) => {
    await test.step('Login as doctor', async () => {
        await login(page, doctorEmail, doctorPassword, 'doctor');
    });

    await test.step('Toggle between My Patients and All Patients tabs', async () => {
        const myPatientsTab = page.getByRole('tab', { name: 'My Patients' });
        const allPatientsTab = page.getByRole('tab', { name: 'All Patients' });

        await expect(myPatientsTab).toBeVisible();
        await expect(allPatientsTab).toBeVisible();
        await expect(myPatientsTab).toHaveAttribute('data-state', 'active');
        console.log('My Patients tab is active by default');

        await allPatientsTab.click();
        await expect(allPatientsTab).toHaveAttribute('data-state', 'active');
        await expect(page.getByText('Manage all patients and view their details.')).toBeVisible();
        console.log('Switched to All Patients tab');

        await myPatientsTab.click();
        await expect(myPatientsTab).toHaveAttribute('data-state', 'active');
        await expect(page.getByText('Manage your patients and view their details.')).toBeVisible();
        await page.locator('table tbody tr').first().waitFor({ state: 'visible' }); 
        console.log('Switched back to My Patients tab');
    });

    await testSearchFilterViewMore(page, 'doctor');
});