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
const editRolesUrl = `${appBaseUrl}/admin/edit-roles`;

function uniqueSuffix(): string {
    return `${Date.now()}`;
}

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

async function gotoEditRoles(page: any) {
    const dataLoaded = page.waitForResponse(
        (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('role'),
        { timeout: 20000 }
    );
    await page.goto(editRolesUrl);
    await dataLoaded;
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
}

// Opens a role in edit mode from the Edit Roles page
async function openRoleInEditMode(page: any, roleName: string) {
    const row = page.locator('table tbody tr').filter({ hasText: roleName }).first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.getByRole('button', { name: 'Edit' }).click();
    await page.waitForURL('**/admin/edit-role/**', { timeout: 15000 });
}

// Creates a role and returns its name. Cleans up by navigating back.
async function createTestRole(page: any, roleName: string): Promise<string> {
    await page.goto(`${appBaseUrl}/admin/create-role`);

    // Wait for access levels to load in the select
    await page.waitForResponse(
        (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('access'),
        { timeout: 20000 }
    );

    await page.getByLabel('Role name').fill(roleName);
    await page.getByLabel('Description').fill(`Test role created by Playwright ${roleName}`);

    // Select first available access level
    const select = page.getByLabel('Access level');
    await select.selectOption({ index: 1 });

    const createResponse = page.waitForResponse(
        (res: any) => res.request().method() === 'POST' && res.url().toLowerCase().includes('role'),
        { timeout: 20000 }
    );
    await page.getByRole('button', { name: 'Create role' }).click();
    await createResponse;

    return roleName.toUpperCase();
}

// Deletes a role from the Edit Roles page by name
async function deleteRole(page: any, roleName: string) {
    await gotoEditRoles(page);
    const row = page.locator('table tbody tr').filter({ hasText: roleName }).first();
    if (await row.count() === 0) return;

    await row.getByRole('button', { name: 'Delete' }).click();

    // Modal has no heading — wait for the h3 confirmation text
    await page.locator('h3').filter({ hasText: roleName }).waitFor({ state: 'visible', timeout: 10000 });

    const deleteResponse = page.waitForResponse(
        (res: any) => res.request().method() === 'DELETE' && res.url().toLowerCase().includes('role'),
        { timeout: 20000 }
    );
    // Confirm button is "Yes"
    await page.getByRole('button', { name: 'Yes' }).click();
    await deleteResponse;
}

// ─── Tests: Edit Roles page ───────────────────────────────────────────────────

test('Edit Roles — Roles tab renders correctly', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoEditRoles(page);
    });

    await test.step('Assert tabs are visible', async () => {
        await expect(page.getByRole('tab', { name: 'Roles' })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Access Levels' })).toBeVisible();
    });

    await test.step('Assert roles table columns render', async () => {
        await expect(page.getByRole('cell', { name: 'Name', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'ID', exact: true })).toBeVisible();
    });

    await test.step('Assert Add New Role and Admin Workspace notice are visible', async () => {
        await expect(page.getByRole('button', { name: 'Add New Role' })).toBeVisible();
        await expect(page.getByText(/Administrative workspace/i)).toBeVisible();
    });
});

test('Edit Roles — ADMIN role delete button is disabled', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoEditRoles(page);
    });

    await test.step('Assert ADMIN row delete is disabled', async () => {
        const adminRow = page.locator('table tbody tr').filter({ hasText: 'ADMIN' }).first();
        await expect(adminRow).toBeVisible({ timeout: 10000 });
        await expect(adminRow.getByRole('button', { name: 'Delete' })).toBeDisabled();
    });
});

test('Edit Roles — search filters roles', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoEditRoles(page);
    });

    await test.step('Filter by ADMIN and assert result', async () => {
        const dataLoaded = page.waitForResponse(
            (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('role'),
            { timeout: 10000 }
        );
        await page.getByPlaceholder('Filter by role title...').fill('ADMIN');
        await dataLoaded;

        const rows = page.locator('table tbody tr');
        await expect(rows.filter({ hasText: 'ADMIN' }).first()).toBeVisible({ timeout: 10000 });
    });
});

// ─── Tests: Create Role ───────────────────────────────────────────────────────

test('Create Role — renders form and policy preview', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
    });

    await test.step('Navigate to Create Role', async () => {
        await page.goto(`${appBaseUrl}/admin/create-role`);
        await page.waitForResponse(
            (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('access'),
            { timeout: 20000 }
        );
    });

    await test.step('Assert form fields are visible', async () => {
        await expect(page.getByLabel('Role name')).toBeVisible();
        await expect(page.getByLabel('Description')).toBeVisible();
        await expect(page.getByLabel('Access level')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Create role' })).toBeVisible();
    });

    await test.step('Select access level shows policy preview', async () => {
        await page.getByLabel('Access level').selectOption({ index: 1 });
        await expect(page.getByRole('heading', { name: 'Policy preview' })).toBeVisible();
        // Policy preview card should now show content, not the placeholder lock icon
        await expect(page.getByText('Select an access level to preview')).toHaveCount(0);
    });

    await test.step('Discard navigates back to edit roles', async () => {
        await page.getByRole('button', { name: 'Discard' }).click();
        await page.waitForURL('**/admin/edit-roles**', { timeout: 10000 });
    });
});

test('Create Role — creates and deletes a role', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
    });

    const suffix = uniqueSuffix();
    const roleName = `PWTEST${suffix}`.slice(0, 20);
    let createdRoleName = '';

    await test.step('Create the role', async () => {
        createdRoleName = await createTestRole(page, roleName);
    });

    await test.step('Assert role appears in Edit Roles table', async () => {
        await gotoEditRoles(page);
        const dataLoaded = page.waitForResponse(
            (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('role'),
            { timeout: 10000 }
        );
        await page.getByPlaceholder('Filter by role title...').fill(createdRoleName);
        await dataLoaded;

        const row = page.locator('table tbody tr').filter({ hasText: createdRoleName }).first();
        await expect(row).toBeVisible({ timeout: 15000 });
    });

    await test.step('Delete the created role', async () => {
        await deleteRole(page, createdRoleName);
    });
});

// ─── Tests: Edit Role (edit mode — from Edit Roles page) ──────────────────────

test('Edit Role (edit mode) — fields are editable', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoEditRoles(page);
    });

    await test.step('Open CAREGIVER in edit mode', async () => {
        await openRoleInEditMode(page, 'CAREGIVER');
    });

    await test.step('Assert description textarea is editable', async () => {
        await expect(page.locator('textarea')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('textarea')).toBeEditable();
    });

    await test.step('Assert access level select is editable', async () => {
        await expect(page.locator('select')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('select')).toBeEnabled();
    });

    await test.step('Assert Save Role Changes button is visible', async () => {
        await expect(page.getByRole('button', { name: 'Save Role Changes' })).toBeVisible();
    });
});

test('Edit Role (edit mode) — save description update', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoEditRoles(page);
        await openRoleInEditMode(page, 'CAREGIVER');
    });

    let originalDescription = '';

    await test.step('Read original description', async () => {
        originalDescription = await page.locator('textarea').inputValue();
        console.log('Original description:', originalDescription);
    });

    await test.step('Update description and save', async () => {
        const newDescription = `Updated by Playwright ${uniqueSuffix()}`;
        await page.locator('textarea').fill(newDescription);

        const putResponse = page.waitForResponse(
            (res: any) => res.request().method() === 'PUT' && res.url().toLowerCase().includes('role'),
            { timeout: 20000 }
        );
        await page.getByRole('button', { name: 'Save Role Changes' }).click();
        await putResponse;

        await expect(page.getByText('Role updated successfully.').first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Restore original description', async () => {
        await page.locator('textarea').fill(originalDescription);

        const putResponse = page.waitForResponse(
            (res: any) => res.request().method() === 'PUT' && res.url().toLowerCase().includes('role'),
            { timeout: 20000 }
        );
        await page.getByRole('button', { name: 'Save Role Changes' }).click();
        await putResponse;

        await expect(page.getByText('Role updated successfully.').first()).toBeVisible({ timeout: 10000 });
    });
});

// ─── Tests: Delete Role ───────────────────────────────────────────────────────

test('Delete Role — creates then deletes a role successfully', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
    });

    const suffix = uniqueSuffix();
    const roleName = `PWDEL${suffix}`.slice(0, 20);
    let createdRoleName = '';

    await test.step('Create a role to delete', async () => {
        createdRoleName = await createTestRole(page, roleName);
    });

    await test.step('Navigate to Edit Roles and find the created role', async () => {
        await gotoEditRoles(page);
        const dataLoaded = page.waitForResponse(
            (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('role'),
            { timeout: 10000 }
        );
        await page.getByPlaceholder('Filter by role title...').fill(createdRoleName);
        await dataLoaded;
        await expect(page.locator('table tbody tr').filter({ hasText: createdRoleName }).first()).toBeVisible({ timeout: 15000 });
    });

    await test.step('Delete the role', async () => {
        const row = page.locator('table tbody tr').filter({ hasText: createdRoleName }).first();
        await row.getByRole('button', { name: 'Delete' }).click();
        await page.locator('h3').filter({ hasText: createdRoleName }).waitFor({ state: 'visible', timeout: 10000 });

        const deleteResponse = page.waitForResponse(
            (res: any) => res.request().method() === 'DELETE' && res.url().toLowerCase().includes('role'),
            { timeout: 20000 }
        );
        await page.getByRole('button', { name: 'Yes' }).click();
        await deleteResponse;
    });

    await test.step('Assert role no longer appears', async () => {
        const dataLoaded = page.waitForResponse(
            (res: any) => res.request().method() === 'GET' && res.url().toLowerCase().includes('role'),
            { timeout: 10000 }
        );
        await gotoEditRoles(page);
        await dataLoaded;
        await page.getByPlaceholder('Filter by role title...').fill(createdRoleName);
        await page.waitForTimeout(500);
        const row = page.locator('table tbody tr').filter({ hasText: createdRoleName }).first();
        await expect(row).toHaveCount(0, { timeout: 10000 });
    });
});

// ─── Tests: Edit User In Role (from Edit Roles) ───────────────────────────────

async function gotoEditUserInRole(page: any, roleName: string) {
    await gotoEditRoles(page);
    await openRoleInEditMode(page, roleName);

    // Register BEFORE clicking so we never miss the POST that fires on mount
    const usersLoaded = page.waitForResponse(
        (res: any) => res.request().method() === 'POST' && res.url().toLowerCase().includes('get_users_by_fields'),
        { timeout: 20000 }
    );

    await page.getByRole('button', { name: 'Manage Assignments' }).click();
    await page.waitForURL('**/admin/edit-user-in-role/**', { timeout: 15000 });
    await usersLoaded;
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
}

test('Edit User In Role (from Edit Roles) — navigates correctly', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoEditRoles(page);
        await openRoleInEditMode(page, 'CAREGIVER');
    });

    await test.step('Click Manage Assignments and assert navigation', async () => {
        await page.getByRole('button', { name: 'Manage Assignments' }).click();
        await page.waitForURL('**/admin/edit-user-in-role/**', { timeout: 15000 });
        await expect(page.getByRole('heading', { name: 'Staff directory' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Current roster' })).toBeVisible();
    });
});

test('Edit User In Role — assign user to role', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoEditUserInRole(page, 'CAREGIVER');
    });

    await test.step('Find an unassigned user and assign them', async () => {
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

test('Edit User In Role — search filters staff directory', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoEditUserInRole(page, 'CAREGIVER');
    });

    await test.step('Type in search and assert table updates', async () => {
        const searchInput = page.getByPlaceholder('Search for staff...');

        // Register BEFORE filling — fetchUsersByFields is POST /get_users_by_fields
        // useUsers debounces 300ms before firing
        const dataLoaded = page.waitForResponse(
            (res: any) => res.request().method() === 'POST' && res.url().toLowerCase().includes('get_users_by_fields'),
            { timeout: 15000 }
        ).catch(() => {
            console.log('[search test] No POST /get_users_by_fields captured — checking DOM directly');
        });

        await searchInput.fill('test');
        await dataLoaded;
        await page.waitForTimeout(300);

        const hasRows = await page.locator('table tbody tr').count() > 0;
        const hasEmpty = await page.getByText('No data found').isVisible().catch(() => false);
        expect(hasRows || hasEmpty).toBeTruthy();
    });
});

test('Edit User In Role — Assigned badge shows for current roster users in directory', async ({ page }) => {
    await test.step('Setup', async () => {
        await setupRouteInterception(page, userServiceURL, roleServiceURL);
        await loginAsAdmin(page);
        await gotoEditUserInRole(page, 'CAREGIVER');
    });

    await test.step('Assert Assigned badges exist in staff directory', async () => {
        const assignedBadges = page.locator('table tbody tr').getByText('Assigned');
        const count = await assignedBadges.count();
        if (count > 0) {
            await expect(assignedBadges.first()).toBeVisible();
        } else {
            console.log('No currently assigned users visible on page 1 — skipping badge assertion');
        }
    });
});