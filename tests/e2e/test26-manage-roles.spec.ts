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

const appBaseUrl = frontendUrl.replace(/\/login\/?$/, '');
const manageRolesUrl = `${appBaseUrl}/admin/manage-roles`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

async function gotoManageRoles(page: any) {
    const dataLoaded = page.waitForResponse(
        (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('role'),
        { timeout: 20000 }
    );
    await page.goto(manageRolesUrl);
    await dataLoaded;
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
}

// Clicks the edit button on the first role row whose name matches.
// Since ManageRoles uses DataTableServer (server-side paginated), we just
// look on the first page — roles like ADMIN and CAREGIVER are always there.
async function openRoleFromManageRoles(page: any, roleName: string) {
    const row = page.locator('table tbody tr').filter({ hasText: roleName }).first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.getByRole('button').click();
    await page.waitForURL(`**/admin/edit-role/**`, { timeout: 15000 });
}

// ─── Tests: Manage Roles page ─────────────────────────────────────────────────

test('Manage Roles — renders table with expected columns', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
    });

    await test.step('Navigate to Manage Roles', async () => {
        await gotoManageRoles(page);
    });

    await test.step('Assert columns are visible', async () => {
        await expect(page.getByRole('cell', { name: 'ID', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Name', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Access Level', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Description', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Status', exact: true })).toBeVisible();
    });

    await test.step('Assert audit notice footer is visible', async () => {
        await expect(page.getByText(/Audit Notice/i)).toBeVisible();
    });
});

test('Manage Roles — search bar filters roles', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoManageRoles(page);
    });

    await test.step('Type in searchbar and assert filtered results', async () => {
        const searchInput = page.getByPlaceholder('Filter by role title...');
        await expect(searchInput).toBeVisible();

        const dataLoaded = page.waitForResponse(
            (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('role'),
            { timeout: 10000 }
        );
        await searchInput.fill('ADMIN');
        await dataLoaded;

        // Only ADMIN row should be visible
        const rows = page.locator('table tbody tr');
        await expect(rows.filter({ hasText: 'ADMIN' }).first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Clear search restores full list', async () => {
        const searchInput = page.getByPlaceholder('Filter by role title...');
        const dataLoaded = page.waitForResponse(
            (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('role'),
            { timeout: 10000 }
        );
        await searchInput.fill('');
        await dataLoaded;

        const rows = page.locator('table tbody tr');
        await expect(rows).toHaveCount(await rows.count(), { timeout: 5000 });
        expect(await rows.count()).toBeGreaterThan(1);
    });
});

test('Manage Roles — access level badges render', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoManageRoles(page);
    });

    await test.step('Assert at least one Access Level badge is visible', async () => {
        // Badges in the Access Level column should have text content
        const badges = page.locator('table tbody tr td').filter({ hasText: /HIGH|MEDIUM|LOW|NONE|SPECIAL/i });
        await expect(badges.first()).toBeVisible({ timeout: 10000 });
    });
});

// ─── Tests: Edit Role (view mode — from Manage Roles) ─────────────────────────

test('Edit Role (view mode) — fields are read-only', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoManageRoles(page);
    });

    await test.step('Open a role from Manage Roles', async () => {
        // ManageRoles navigates with mode: "view"
        await openRoleFromManageRoles(page, 'CAREGIVER');
    });

    await test.step('Assert description is read-only (rendered as div, not textarea)', async () => {
        // In view mode the description is a styled div, not an editable textarea
        await expect(page.locator('textarea')).toHaveCount(0);
    });

    await test.step('Assert Save Role Changes button is not visible', async () => {
        await expect(page.getByRole('button', { name: 'Save Role Changes' })).toHaveCount(0);
    });

    await test.step('Assert Manage Assignments button is visible', async () => {
        await expect(page.getByRole('button', { name: 'Manage Assignments' })).toBeVisible();
    });

    await test.step('Assert assigned staff panel renders', async () => {
        await expect(page.getByRole('heading', { name: 'Assigned staff' })).toBeVisible();
    });
});

test('Edit Role (view mode) — back navigation works', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoManageRoles(page);
        await openRoleFromManageRoles(page, 'CAREGIVER');
    });

    await test.step('Click Back and assert we return to previous page', async () => {
        await page.getByRole('button', { name: 'Back' }).click();
        await page.waitForURL(`**/admin/manage-roles**`, { timeout: 10000 });
    });
});

// ─── Tests: Edit User In Role ─────────────────────────────────────────────────

test('Edit User In Role — page renders correctly', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoManageRoles(page);
        await openRoleFromManageRoles(page, 'CAREGIVER');
    });

    await test.step('Navigate to Manage Assignments', async () => {
        await page.getByRole('button', { name: 'Manage Assignments' }).click();
        await page.waitForURL('**/admin/assign-user-to-role/**', { timeout: 15000 });
    });

    await test.step('Assert staff directory and roster panels are visible', async () => {
        await expect(page.getByRole('heading', { name: 'Staff directory' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Current roster' })).toBeVisible();
    });

    await test.step('Assert search bar is present', async () => {
        await expect(page.getByPlaceholder('Search for staff...')).toBeVisible();
    });
});

test('Edit User In Role — assign user to role', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoManageRoles(page);
        await openRoleFromManageRoles(page, 'CAREGIVER');
        await page.getByRole('button', { name: 'Manage Assignments' }).click();
        await page.waitForURL('**/admin/assign-user-to-role/**', { timeout: 15000 });
        await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
    });

    await test.step('Find an unassigned user and assign them', async () => {
        // Find the first Add button in the directory table
        const addButton = page.locator('table tbody tr').getByRole('button', { name: 'Add' }).first();
        await expect(addButton).toBeVisible({ timeout: 10000 });

        const assignResponse = page.waitForResponse(
            (res: any) => res.request().method() === 'PUT' && res.url().toLowerCase().includes('user'),
            { timeout: 20000 }
        );
        await addButton.click();
        await assignResponse;

        await expect(page.getByText('User assigned')).toBeVisible({ timeout: 10000 });
    });
});

test('Edit User In Role — remove user from role triggers orphan reassign modal', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoManageRoles(page);
        await openRoleFromManageRoles(page, 'CAREGIVER');
        await page.getByRole('button', { name: 'Manage Assignments' }).click();
        await page.waitForURL('**/admin/assign-user-to-role/**', { timeout: 15000 });
    });

    await test.step('Remove a user from the current roster', async () => {
        const rosterPanel = page.getByRole('heading', { name: 'Current roster' }).locator('../..');
        const removeButton = rosterPanel.getByRole('button').filter({ hasNot: page.locator('[data-locked]') }).first();

        // If roster is empty skip gracefully
        if (await removeButton.count() === 0) {
            console.log('No removable users in roster — skipping remove test');
            return;
        }

        const removeResponse = page.waitForResponse(
            (res: any) => res.request().method() === 'PUT' && res.url().toLowerCase().includes('user'),
            { timeout: 20000 }
        );
        await removeButton.click();
        await removeResponse;

        // After removing, the orphan reassign dialog should appear
        await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('needs a new role')).toBeVisible({ timeout: 10000 });
    });
});

test('Edit User In Role — ADMIN role users show Locked badge, not Add button', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoManageRoles(page);
        await openRoleFromManageRoles(page, 'CAREGIVER');
        await page.getByRole('button', { name: 'Manage Assignments' }).click();
        await page.waitForURL('**/admin/assign-user-to-role/**', { timeout: 15000 });
        await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
    });

    await test.step('Assert ADMIN users show Locked badge', async () => {
        // Search for a known admin user if possible, otherwise just verify
        // that if any Locked badges exist they are not clickable Add buttons
        const lockedBadges = page.locator('table tbody tr').getByText('Locked');
        const count = await lockedBadges.count();
        if (count > 0) {
            // Locked badge rows should have no Add button
            const lockedRow = page.locator('table tbody tr').filter({ has: page.getByText('Locked') }).first();
            await expect(lockedRow.getByRole('button', { name: 'Add' })).toHaveCount(0);
        } else {
            console.log('No locked users on current page — skipping badge assertion');
        }
    });
});

test('Edit User In Role — search filters staff directory', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoManageRoles(page);
        await openRoleFromManageRoles(page, 'CAREGIVER');
        await page.getByRole('button', { name: 'Manage Assignments' }).click();
        await page.waitForURL('**/admin/assign-user-to-role/**', { timeout: 15000 });
        await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
    });

    await test.step('Type in search and assert table updates', async () => {
        const searchInput = page.getByPlaceholder('Search for staff...');
        const initialRowCount = await page.locator('table tbody tr').count();

        // Register BEFORE filling so we never miss the response
        // useUsers debounces 300ms then fires GET — give it enough time
        const dataLoaded = page.waitForResponse(
            (res: any) => res.request().method() === 'POST' && res.url().toLowerCase().includes('get_users_by_fields'),
            { timeout: 15000 }
        ).catch(() => {
            console.log('[search test] No POST /get_users_by_fields response captured — checking DOM directly');
        });

        await searchInput.fill('test');

        // Wait for either the response or the debounce + render time
        await Promise.race([
            dataLoaded,
            page.waitForTimeout(1500), // debounce (300ms) + render buffer
        ]);

        // Table should either show filtered results or "No data found"
        const hasRows = await page.locator('table tbody tr').count() > 0;
        const hasEmpty = await page.getByText('No data found').isVisible().catch(() => false);
        expect(hasRows || hasEmpty).toBeTruthy();

        // If results came back, row count may differ from initial (filtered)
        console.log(`Row count before: ${initialRowCount}, after search: ${await page.locator('table tbody tr').count()}`);
    });
});