import dotenv from 'dotenv';
import path from 'path';
import { test, expect } from '@playwright/test';

dotenv.config({ path: path.resolve(process.cwd(), 'tests/e2e/test.env') });

test.describe.configure({ mode: 'serial' });

const frontendUrl = process.env.FRONTEND_URL!;
if (!frontendUrl) throw new Error('Missing FRONTEND_URL');
const adminEmail = process.env.ADMIN_ACCOUNT_EMAIL!;
if (!adminEmail) throw new Error('Missing ADMIN_ACCOUNT_EMAIL');
const adminPassword = process.env.ADMIN_ACCOUNT_PASSWORD!;
if (!adminPassword) throw new Error('Missing ADMIN_ACCOUNT_PASSWORD');
const userServiceURL = process.env.USER_SERVICE_URL as string;
const roleServiceURL = process.env.ROLE_SERVICE_URL as string;
const accessLevelServiceURL = process.env.ACCESS_LEVEL_SERVICE_URL as string;

const appBaseUrl = frontendUrl.replace(/\/login\/?$/, '');

function uniqueSuffix(): string {
    return `${Date.now()}`;
}

function uniqueRank(): number {
    return Math.floor(Date.now() % 100000);
}

async function setupRouteInterception(page: any, ...hostServers: string[]) {
    await page.route('**', async (route: any) => {
        const request = route.request();
        let url = request.url();
        const matchedHost = hostServers.find(host => host && url.includes(host));
        if (matchedHost) {
            const prevUrl = url;
            url = url.replace(matchedHost, 'http://localhost');
            console.log(`Rewrote URL: ${prevUrl} to ${url}`);
            await route.continue({ url });
        } else {
            await route.continue();
        }
    });
}

async function loginAsAdmin(page: any) {
    await page.goto(frontendUrl);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(adminEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(adminPassword);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.waitForURL('**/admin/manage-accounts', { timeout: 45000 });
}

/**
 * Navigates to the access levels tab and waits for the single GET fetch
 * to complete and the table to render. fetchAccessLevels() fetches ALL
 * records in one call — DataTableClient handles pagination client-side.
 */
async function gotoAccessLevels(page: any) {
    // Register the GET listener before navigating so we never miss it
    const dataLoaded = page.waitForResponse(
        (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('access'),
        { timeout: 20000 }
    );
    await page.goto(`${appBaseUrl}/admin/edit-roles?page=0&tab=levels`);
    await dataLoaded;
    // Wait for the heading AND for React to finish rendering the response into the table
    await page.getByRole('heading', { name: 'Access Level Definitions' }).waitFor({ state: 'visible' });
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
}

/**
 * Searches every CLIENT-SIDE page for a row matching the given text.
 * Since all data is already in memory, this just clicks Next through
 * the DataTableClient pages without any network calls.
 * Returns true if found (leaves the browser on the page containing the row).
 */
async function findRowAcrossPages(page: any, text: string): Promise<boolean> {
    while (true) {
        const row = page.locator('table tbody tr').filter({ hasText: text }).first();
        if (await row.count()) return true;

        const nextBtn = page.getByRole('button', { name: 'Next' });
        if (await nextBtn.isDisabled()) return false;
        await nextBtn.click();
        // No network call happens here — just a React state update, so a short wait is enough
        await page.waitForTimeout(200);
    }
}

/**
 * Finds a row by levelName across all client-side pages and deletes it.
 * Safe to call even if the row no longer exists.
 */
async function cleanupAccessLevel(page: any, levelName: string) {
    await gotoAccessLevels(page);
    const found = await findRowAcrossPages(page, levelName);
    if (!found) return;

    const row = page.locator('table tbody tr').filter({ hasText: levelName }).first();
    await row.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('heading', { name: 'Delete Access Level' }).waitFor({ state: 'visible' });

    // Register before clicking confirm so we never miss the response
    const deleteResponse = page.waitForResponse(
        (res: any) => res.request().method() === 'DELETE' && res.url().toLowerCase().includes('access'),
        { timeout: 20000 }
    );

    // Target the confirm button inside the modal directly by its role + destructive appearance
    await page.getByRole('button', { name: 'Delete' }).last().click();
    await deleteResponse;
}

/**
 * Fills and submits the Create Access Level modal.
 *
 * Submit flow in AddAccessLevelModal:
 *   POST createAccessLevel → await onSuccess() [refetches table via GET] → closeModal()
 *
 * So we wait for: POST → GET refetch → modal closes → assert toast.
 */
async function fillAndSubmitCreateForm(
    page: any,
    { levelName, code, rank, description }: { levelName: string; code: string; rank: number; description: string }
) {
    await page.getByRole('button', { name: 'Add Access Level' }).click();
    await page.getByRole('heading', { name: 'Create Access Level' }).waitFor({ state: 'visible' });

    await page.getByLabel('Code').fill(code);
    await page.getByLabel('Level Rank').fill(String(rank));
    await page.getByLabel('Level Name').fill(levelName);
    await page.getByLabel('Description').fill(description);

    // Register both listeners BEFORE clicking
    const postResponse = page.waitForResponse(
        (res: any) => res.request().method() === 'POST' && res.url().toLowerCase().includes('access'),
        { timeout: 20000 }
    );
    const getRefetch = page.waitForResponse(
        (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('access'),
        { timeout: 20000 }
    );

    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for POST then the GET refetch triggered by onSuccess()
    await postResponse;
    await getRefetch;

    // Modal closes after the refetch resolves
    await page.getByRole('heading', { name: 'Create Access Level' }).waitFor({ state: 'hidden', timeout: 10000 });

    // Toast should still be visible at this point
    await expect(page.getByText('Access level created successfully.')).toBeVisible({ timeout: 10000 });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('Render Access Levels tab', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL, accessLevelServiceURL);
    });

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Navigate to Access Level Definitions page', async () => {
        await gotoAccessLevels(page);
    });

    await test.step('Assert table and actions are visible', async () => {
        await expect(page.getByRole('heading', { name: 'Access Level Definitions' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Access Level' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Name', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'ID', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Rank', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Code', exact: true })).toBeVisible();
    });
});

test('Create Access Level', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL, accessLevelServiceURL);
    });

    const suffix = uniqueSuffix();
    const levelName = `PW Access ${suffix}`;
    const code = `PW${suffix}`.slice(0, 10);
    const rank = uniqueRank();
    const description = `Created by Playwright ${suffix}`;

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Navigate to Access Level Definitions page', async () => {
        await gotoAccessLevels(page);
    });

    await test.step('Fill form and assert success', async () => {
        await fillAndSubmitCreateForm(page, { levelName, code, rank, description });
    });

    await test.step('Find and assert created row exists', async () => {
        // Data is already refreshed in the table from the onSuccess() refetch —
        // no need to navigate away. Just search the current client-side pages.
        const found = await findRowAcrossPages(page, levelName);
        try {
            expect(found).toBeTruthy();
            const row = page.locator('table tbody tr').filter({ hasText: levelName }).first();
            await expect(row).toContainText(code);
            await expect(row).toContainText(String(rank));
        } catch (e) {
            console.log('Create assertion failure — body text:\n', await page.locator('body').innerText());
            throw e;
        }
    });

    await test.step('Cleanup created record', async () => {
        await cleanupAccessLevel(page, levelName);
    });
});

test('Edit Access Level', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL, accessLevelServiceURL);
    });

    const suffix = uniqueSuffix();
    const levelName = `PW Edit ${suffix}`;
    const code = `ED${suffix}`.slice(0, 10);
    const rank = uniqueRank();
    const description = `Before edit ${suffix}`;
    const updatedDescription = `After edit ${suffix}`;

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Navigate to Access Level Definitions page', async () => {
        await gotoAccessLevels(page);
    });

    await test.step('Create access level to edit', async () => {
        await fillAndSubmitCreateForm(page, { levelName, code, rank, description });

        // Table is already refreshed after create — search current pages directly
        const found = await findRowAcrossPages(page, levelName);
        try {
            expect(found).toBeTruthy();
        } catch (e) {
            console.log('Edit setup failure — body text:\n', await page.locator('body').innerText());
            throw e;
        }
    });

    await test.step('Open edit modal', async () => {
        // findRowAcrossPages left us on the correct page
        const row = page.locator('table tbody tr').filter({ hasText: levelName }).first();
        await expect(row).toBeVisible({ timeout: 10000 });
        await row.getByRole('button', { name: 'Edit' }).click();
        await page.getByRole('heading', { name: 'Edit Access Level' }).waitFor({ state: 'visible' });
    });

    await test.step('Update description and submit', async () => {
        await page.getByLabel('Description').fill(updatedDescription);

        const putResponse = page.waitForResponse(
            (res: any) => (res.request().method() === 'PUT' || res.request().method() === 'PATCH') && res.url().toLowerCase().includes('access'),
            { timeout: 20000 }
        );
        const getRefetch = page.waitForResponse(
            (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('access'),
            { timeout: 20000 }
        );

        await page.getByRole('button', { name: 'Save Changes' }).click();
        await putResponse;
        await getRefetch;
        await page.getByRole('heading', { name: 'Edit Access Level' }).waitFor({ state: 'hidden', timeout: 10000 });
    });

    await test.step('Assert row still exists after edit', async () => {
        const found = await findRowAcrossPages(page, levelName);
        expect(found).toBeTruthy();
    });

    await test.step('Cleanup created record', async () => {
        await cleanupAccessLevel(page, levelName);
    });
});

test('Delete Access Level', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL, accessLevelServiceURL);
    });

    const suffix = uniqueSuffix();
    const levelName = `PW Delete ${suffix}`;
    const code = `DL${suffix}`.slice(0, 10);
    const rank = uniqueRank();
    const description = `Delete me ${suffix}`;

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Navigate to Access Level Definitions page', async () => {
        await gotoAccessLevels(page);
    });

    await test.step('Create access level to delete', async () => {
        await fillAndSubmitCreateForm(page, { levelName, code, rank, description });

        const found = await findRowAcrossPages(page, levelName);
        try {
            expect(found).toBeTruthy();
        } catch (e) {
            console.log('Delete setup failure — body text:\n', await page.locator('body').innerText());
            throw e;
        }
    });

    await test.step('Open delete modal', async () => {
        const row = page.locator('table tbody tr').filter({ hasText: levelName }).first();
        await expect(row).toBeVisible({ timeout: 10000 });
        await row.getByRole('button', { name: 'Delete' }).click();
        await page.getByRole('heading', { name: 'Delete Access Level' }).waitFor({ state: 'visible' });
    });

    await test.step('Submit delete and assert success', async () => {
        const deleteResponse = page.waitForResponse(
            (res: any) => res.request().method() === 'DELETE' && res.url().toLowerCase().includes('access'),
            { timeout: 20000 }
        );
        const getRefetch = page.waitForResponse(
            (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('access'),
            { timeout: 20000 }
        );

        await page.getByRole('button', { name: 'Delete' }).last().click();
        await deleteResponse;
        await getRefetch;

        await expect(page.getByText('Access level deleted successfully.')).toBeVisible({ timeout: 10000 });

        // Table already refreshed — confirm row is gone across all client-side pages
        const stillExists = await findRowAcrossPages(page, levelName);
        expect(stillExists).toBeFalsy();
    });
});

test('System Access Level Delete Disabled', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL, accessLevelServiceURL);
    });

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Navigate to Access Level Definitions page', async () => {
        await gotoAccessLevels(page);
    });

    await test.step('Assert seeded system access level cannot be deleted', async () => {
        const possibleSystemRows = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];
        let found = false;

        for (const name of possibleSystemRows) {
            const row = page.locator('table tbody tr').filter({ hasText: name }).first();
            if (await row.count()) {
                await expect(row.getByRole('button', { name: 'Delete' })).toBeDisabled();
                found = true;
                break;
            }
        }

        expect(found).toBeTruthy();
    });
});

test('System Access Level Edit Restrictions', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL, accessLevelServiceURL);
    });

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Navigate to Access Level Definitions page', async () => {
        await gotoAccessLevels(page);
    });

    await test.step('Open edit modal for seeded system access level', async () => {
        const possibleSystemRows = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];
        let found = false;

        for (const name of possibleSystemRows) {
            const row = page.locator('table tbody tr').filter({ hasText: name }).first();
            if (await row.count()) {
                await row.getByRole('button', { name: 'Edit' }).click();
                found = true;
                break;
            }
        }

        expect(found).toBeTruthy();
        await page.getByRole('heading', { name: 'Edit Access Level' }).waitFor({ state: 'visible' });
    });

    await test.step('Assert only description is editable', async () => {
        await expect(page.getByLabel('Code')).toBeDisabled();
        await expect(page.getByLabel('Level Rank')).toBeDisabled();
        await expect(page.getByLabel('Level Name')).toBeDisabled();
        await expect(page.getByLabel('Description')).toBeEditable();
    });
});