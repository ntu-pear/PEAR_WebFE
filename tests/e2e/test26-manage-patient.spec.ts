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

test('Supervisor - Manage Patient Page', async ({ page }) => {
    await page.goto(frontendUrl!);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).click();
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(supervisorEmail);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(supervisorPassword);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Wait for navigation to complete and page to be fully loaded else menu button might not work
    await page.waitForURL(/\/(?!login)/); // Wait for URL to change from login page
    // await page.waitForLoadState('networkidle'); // Wait for network requests to finish
    await page.waitForURL(/supervisor\/manage-patients/);

    const myPatientsTab = page.getByRole('tab', { name: 'My Patients' })
    const allPatientsTab = page.getByRole('tab', { name: 'All Patients' })

    await expect(myPatientsTab).toBeVisible()
    await expect(allPatientsTab).toBeVisible()
    await expect(myPatientsTab).toHaveAttribute('data-state', 'active')
    console.log("My Patient tab is active by default")

    await allPatientsTab.click()
    await expect(allPatientsTab).toHaveAttribute('data-state', 'active')
    await expect(page.getByText('Manage all patients and view their details.')).toBeVisible()
    console.log("Switched to All Patient tab")

    await myPatientsTab.click()
    await expect(myPatientsTab).toHaveAttribute('data-state', 'active')
    await expect(page.getByText('Manage your patients and view their details.')).toBeVisible()
    console.log("Switched to My Patient tab")
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByRole('searchbox', { name: 'Search' })
    await searchInput.fill("JON ONG")
    await page.waitForTimeout(800)
    await page.waitForLoadState('networkidle')
    const rowsAfterSearch = page.locator('table tbody tr')
    const searchResultCount = await rowsAfterSearch.count()
    await expect(searchResultCount).toBeGreaterThan(0)
    for (let i = 0; i < searchResultCount; i++) {
        const rowText = (await rowsAfterSearch.nth(i).innerText()).toLowerCase()
        expect(rowText).toContain("JON ONG".toLowerCase())
    }

    const filterButton = page.getByRole('button', { name: 'Filter' })
    await filterButton.click()
    await expect(page.getByText('Filter by Status')).toBeVisible()

    await page.getByRole('menuitemradio', { name: 'Active', exact: true }).click()
    await page.waitForTimeout(800)
    await page.waitForLoadState('networkidle')
    const activeRows = page.locator('table tbody tr')
    const activeCount = await activeRows.count()
    const inactiveBadges = page.locator('table tbody tr').getByText('Inactive')
    await expect(inactiveBadges).toHaveCount(0)
    console.log("Filtered by Active patients")

    await filterButton.click()
    await page.getByRole('menuitemradio', { name: 'Inactive', exact: true }).click()
    await page.waitForTimeout(800)
    await page.waitForLoadState('networkidle')
    const activeBadgesAfterInactiveFilter = page.locator('table tbody tr').getByText('Active')
    await expect(activeBadgesAfterInactiveFilter).toHaveCount(0)
    console.log("Filtered by Inactive patients")

    await filterButton.click()
    await page.getByRole('menuitemradio', { name: 'All' }).click()
    await page.waitForTimeout(800)
    await page.waitForLoadState('networkidle')
    const allCount = await page.locator('table tbody tr').count()
    await expect(allCount).toBeGreaterThanOrEqual(activeCount)
    console.log("Filtered by All patients")

    const firstRow = page.locator('table tbody tr').first()
    await firstRow.waitFor({ state: 'visible' })
    const viewMoreBtn = firstRow.getByRole('link', { name: "View More" })
    await expect(viewMoreBtn).toBeVisible()
    await viewMoreBtn.click()
    await expect(page).toHaveURL(new RegExp(`/supervisor/view-patient/\\d\\?tab=information`))
    await page.goBack()
    await page.waitForURL(/supervisor\/manage-patients/);
})

test('Doctor - Manage Patient Page', async ({ page }) => {
    await page.goto(frontendUrl!);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).click();
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(doctorEmail);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(doctorPassword);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Wait for navigation to complete and page to be fully loaded else menu button might not work
    await page.waitForURL(/\/(?!login)/); // Wait for URL to change from login page
    // await page.waitForLoadState('networkidle'); // Wait for network requests to finish
    await page.waitForURL(/doctor\/manage-patients/);

    const myPatientsTab = page.getByRole('tab', { name: 'My Patients' })
    const allPatientsTab = page.getByRole('tab', { name: 'All Patients' })

    await expect(myPatientsTab).toBeVisible()
    await expect(allPatientsTab).toBeVisible()
    await expect(myPatientsTab).toHaveAttribute('data-state', 'active')
    console.log("My Patient tab is active by default")

    await allPatientsTab.click()
    await expect(allPatientsTab).toHaveAttribute('data-state', 'active')
    await expect(page.getByText('Manage all patients and view their details.')).toBeVisible()
    console.log("Switched to All Patient tab")

    await myPatientsTab.click()
    await expect(myPatientsTab).toHaveAttribute('data-state', 'active')
    await expect(page.getByText('Manage your patients and view their details.')).toBeVisible()
    console.log("Switched to My Patient tab")
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByRole('searchbox', { name: 'Search' })
    await searchInput.fill("JON ONG")
    await page.waitForTimeout(800)
    await page.waitForLoadState('networkidle')
    const rowsAfterSearch = page.locator('table tbody tr')
    const searchResultCount = await rowsAfterSearch.count()
    await expect(searchResultCount).toBeGreaterThan(0)
    for (let i = 0; i < searchResultCount; i++) {
        const rowText = (await rowsAfterSearch.nth(i).innerText()).toLowerCase()
        expect(rowText).toContain("JON ONG".toLowerCase())
    }

    const filterButton = page.getByRole('button', { name: 'Filter' })
    await filterButton.click()
    await expect(page.getByText('Filter by Status')).toBeVisible()

    await page.getByRole('menuitemradio', { name: 'Active', exact: true }).click()
    await page.waitForTimeout(800)
    await page.waitForLoadState('networkidle')
    const activeRows = page.locator('table tbody tr')
    const activeCount = await activeRows.count()
    const inactiveBadges = page.locator('table tbody tr').getByText('Inactive')
    await expect(inactiveBadges).toHaveCount(0)
    console.log("Filtered by Active patients")

    await filterButton.click()
    await page.getByRole('menuitemradio', { name: 'Inactive', exact: true }).click()
    await page.waitForTimeout(800)
    await page.waitForLoadState('networkidle')
    const activeBadgesAfterInactiveFilter = page.locator('table tbody tr').getByText('Active')
    await expect(activeBadgesAfterInactiveFilter).toHaveCount(0)
    console.log("Filtered by Inactive patients")

    await filterButton.click()
    await page.getByRole('menuitemradio', { name: 'All' }).click()
    await page.waitForTimeout(800)
    await page.waitForLoadState('networkidle')
    const allCount = await page.locator('table tbody tr').count()
    await expect(allCount).toBeGreaterThanOrEqual(activeCount)
    console.log("Filtered by All patients")

    const firstRow = page.locator('table tbody tr').first()
    await firstRow.waitFor({ state: 'visible' })
    const viewMoreBtn = firstRow.getByRole('link', { name: "View More" })
    await expect(viewMoreBtn).toBeVisible()
    await viewMoreBtn.click()
    await expect(page).toHaveURL(new RegExp(`/doctor/view-patient/\\d\\?tab=information`))
    await page.goBack()
    await page.waitForURL(/doctor\/manage-patients/);
})