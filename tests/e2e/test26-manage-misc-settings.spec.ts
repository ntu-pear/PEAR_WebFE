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
const adminConfigServiceURL = process.env.ADMIN_CONFIG_SERVICE_URL as string; // add this to your test.env

const appBaseUrl = frontendUrl.replace(/\/login\/?$/, '');
const settingsUrl = `${appBaseUrl}/admin/manage-miscellaneous`; // adjust path if different

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
 * Navigates to the settings page and waits for the GET /admin/config
 * response and the inputs to be rendered before returning.
 */
async function gotoSettings(page: any) {
    const dataLoaded = page.waitForResponse(
        (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('config'),
        { timeout: 20000 }
    );
    await page.goto(settingsUrl);
    await dataLoaded;
    // Wait for the inputs to be visible — confirms loading state has resolved
    await page.getByLabel('Web Inactivity Timeout').waitFor({ state: 'visible', timeout: 10000 });
}

/**
 * Reads the current values from all three inputs and returns them.
 * Useful for saving state before a test mutates it so we can restore after.
 */
async function readCurrentValues(page: any) {
    return {
        sessionExpireMinutes: Number(await page.getByLabel('Web Inactivity Timeout').inputValue()),
        maxPatientPhoto: Number(await page.getByLabel('Max Photos per Patient').inputValue()),
        maxItemsToReturn: Number(await page.getByLabel('Maximum Items to Return').inputValue()),
    };
}

/**
 * Fills all three inputs and clicks Save Changes, then waits for the
 * PUT response to complete.
 */
async function saveSettings(page: any, values: {
    sessionExpireMinutes: number;
    maxPatientPhoto: number;
    maxItemsToReturn: number;
}) {
    const putResponse = page.waitForResponse(
        (res: any) => res.request().method() === 'PUT' && res.url().toLowerCase().includes('config'),
        { timeout: 20000 }
    );

    await page.getByLabel('Web Inactivity Timeout').fill(String(values.sessionExpireMinutes));
    await page.getByLabel('Max Photos per Patient').fill(String(values.maxPatientPhoto));
    await page.getByLabel('Maximum Items to Return').fill(String(values.maxItemsToReturn));

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await putResponse;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('Render settings page', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, adminConfigServiceURL);
    });

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Navigate to settings page', async () => {
        await gotoSettings(page);
    });

    await test.step('Assert page structure is visible', async () => {
        await expect(page.getByRole('heading', { name: 'System Configurations' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Global Parameters' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    });

    await test.step('Assert all three inputs are rendered with values', async () => {
        const sessionInput = page.getByLabel('Web Inactivity Timeout');
        const photosInput = page.getByLabel('Max Photos per Patient');
        const itemsInput = page.getByLabel('Maximum Items to Return');

        await expect(sessionInput).toBeVisible();
        await expect(photosInput).toBeVisible();
        await expect(itemsInput).toBeVisible();

        // All inputs should have a positive number loaded from the API
        const sessionVal = Number(await sessionInput.inputValue());
        const photosVal = Number(await photosInput.inputValue());
        const itemsVal = Number(await itemsInput.inputValue());

        expect(sessionVal).toBeGreaterThan(0);
        expect(photosVal).toBeGreaterThan(0);
        expect(itemsVal).toBeGreaterThan(0);
    });

    await test.step('Assert info banner is visible', async () => {
        await expect(page.getByText('Important Notes')).toBeVisible();
    });
});

test('Edit and save settings', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, adminConfigServiceURL);
    });

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Navigate to settings page', async () => {
        await gotoSettings(page);
    });

    // Save original values so we can restore them after the test
    let originalValues: Awaited<ReturnType<typeof readCurrentValues>>;

    await test.step('Read original values', async () => {
        originalValues = await readCurrentValues(page);
        console.log('Original values:', originalValues);
    });

    const testValues = {
        sessionExpireMinutes: originalValues!.sessionExpireMinutes + 1,
        maxPatientPhoto: originalValues!.maxPatientPhoto + 1,
        maxItemsToReturn: originalValues!.maxItemsToReturn + 1,
    };

    await test.step('Update all fields and save', async () => {
        await saveSettings(page, testValues);
        await expect(page.getByText('System configurations updated successfully.')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Reload page and assert updated values persisted', async () => {
        await gotoSettings(page);
        const reloaded = await readCurrentValues(page);
        expect(reloaded.sessionExpireMinutes).toBe(testValues.sessionExpireMinutes);
        expect(reloaded.maxPatientPhoto).toBe(testValues.maxPatientPhoto);
        expect(reloaded.maxItemsToReturn).toBe(testValues.maxItemsToReturn);
    });

    await test.step('Restore original values', async () => {
        await saveSettings(page, originalValues!);
        await expect(page.getByText('System configurations updated successfully.')).toBeVisible({ timeout: 10000 });
    });
});

test('Validation — reject zero or empty values', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, adminConfigServiceURL);
    });

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Navigate to settings page', async () => {
        await gotoSettings(page);
    });

    await test.step('Clear Web Inactivity Timeout and attempt save', async () => {
        await page.getByLabel('Web Inactivity Timeout').fill('0');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText('Web Inactivity Timeout must be at least 1 minute.')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Clear Max Photos and attempt save', async () => {
        // Restore timeout to valid value first
        await page.getByLabel('Web Inactivity Timeout').fill('10');
        await page.getByLabel('Max Photos per Patient').fill('0');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText('Maximum No of Photos per Patient must be at least 1.')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Clear Max Items and attempt save', async () => {
        await page.getByLabel('Max Photos per Patient').fill('10');
        await page.getByLabel('Maximum Items to Return').fill('0');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText('Maximum Items to Return must be at least 1.')).toBeVisible({ timeout: 5000 });
    });
});

test('Save Changes button is disabled while loading', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, adminConfigServiceURL);
    });

    await test.step('Login as Admin', async () => {
        await loginAsAdmin(page);
    });

    await test.step('Assert Save Changes is disabled before data loads', async () => {
        // Intercept the GET to delay it so we can catch the loading state
        await page.route('**', async (route: any) => {
            const url = route.request().url();
            if (route.request().method() === 'GET' && url.toLowerCase().includes('config')) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            await route.continue();
        });

        await page.goto(settingsUrl);

        // During the loading delay the button should be disabled
        await expect(page.getByRole('button', { name: 'Save Changes' })).toBeDisabled({ timeout: 3000 });
    });
});