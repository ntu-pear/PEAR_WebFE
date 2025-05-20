import { test, expect } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Read from ".env" file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'test.env') });

const baseUrl = process.env.BASE_URL as string;
const adminAccountEmail = process.env.ADMIN_ACCOUNT_EMAIL as string;
const adminAccountPassword = process.env.ADMIN_ACCOUNT_PASSWORD as string;

test('test edit account modal and check unmask nric', async ({ page }) => {
  // timeout used during search for the test account row
  const searchTimeout = 30000;

  await test.step('Navigate and login to admin', async () => {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(adminAccountEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(adminAccountPassword);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expect(page.getByText('Login successful.')).toBeVisible();
    await expect(page.locator('[id="radix-\\:rf\\:-content-all"] div').filter({ hasText: 'IDNameStatusEmailLast' }).nth(1)).toBeVisible();
  });

  await test.step('Search for the test account', async () => {
    var testAccountRow = page.getByRole('row', { name: 'Ud3a7b1b8cc Test Account (' });
    
    const startTime = Date.now();
    // click next until the test account row is found or timeout, attempts to click every second
    while (await testAccountRow.count() === 0 && (Date.now() - startTime < searchTimeout)) {
      try {
        await page.getByRole('button', { name: 'Next' }).click({ timeout: 1000 });
      } catch (error) {
        if (error.message.includes('Timeout')) {
          console.log('Clicking next timed out, but might be due to waiting for table to rerender.');
        } else {
          throw error; // Re-throw other errors
        }
      }
      testAccountRow = page.getByRole('row', { name: 'Ud3a7b1b8cc Test Account (' });
    }
    await page.getByRole('row', { name: 'Ud3a7b1b8cc Test Account (' }).getByLabel('View more').click();
  });

  var unmaskNricBtn;
  var nricLocator;
  var maskedNRIC = '';
  var newPreferredName = '';
  var createdDate = '';
  var modifiedDate = '';
  await test.step('Check the test account initial values', async () => {
    // check the unmask nric eye button
    unmaskNricBtn = page.locator('div').filter({ hasText: /^\*\*\*\*\*\d+[A-Z]$/ }).getByRole('button');
    await expect(unmaskNricBtn).toBeVisible();
    nricLocator = await page.locator("#accountinfo-nric");
    await expect(nricLocator).toBeVisible();
    maskedNRIC = await nricLocator.innerText();

    // get the created and modified date
    createdDate = await page.locator("#accountinfo-created-date").innerText();
    modifiedDate = await page.locator("#accountinfo-modified-date").innerText();
    console.log("created and modified date " + createdDate + " " + modifiedDate);
  });

  await test.step('Check edit modal prefilled values and make changes', async () => {
    // check edit account modal
    await page.getByRole('button', { name: 'Edit Account' }).click();
    await expect(page.locator('input[name="nric"]')).toHaveValue(maskedNRIC);

    const originalPreferredName = await page.locator('input[name="preferredName"]').inputValue();
    console.log("original preferred name " + originalPreferredName);
    // increment last digit of preferred name
    const lastDigit = parseInt(originalPreferredName.slice(-1)) + 1;
    const newPreferredName = originalPreferredName.slice(0, -1) + lastDigit;
    await page.locator('input[name="preferredName"]').fill(newPreferredName);
    await page.getByRole('button', { name: 'Save' }).click();
    // wait for modal to close
    await expect(page.getByRole('heading', { name: 'Edit Account Information' })).not.toBeVisible();
  });

  await test.step('Check view account ui is updated', async () => {
    await expect(page.locator("#accountinfo-preferred-name")).toContainText(newPreferredName);

    // check dates, created date should be the same, modified date should be different
    const newCreatedDate = await page.locator("#accountinfo-created-date").innerText();
    const newModifiedDate = await page.locator("#accountinfo-modified-date").innerText();
    expect(newCreatedDate).toEqual(createdDate);
    expect(newModifiedDate).not.toEqual(modifiedDate);
  });

  await test.step('Check that unmask NRIC and prefilled value', async () => {
    // check the unmask nric eye button
    await expect(unmaskNricBtn).toBeVisible();
    await unmaskNricBtn.click();
    await page.waitForResponse(resp => resp.url().includes('/admin/get_nric')); // added this line as test will continue before the nric is unmasked
    const unmaskedNRIC = await nricLocator.innerText();
    expect(unmaskedNRIC).not.toEqual(maskedNRIC);

    // check nric in edit modal
    await page.getByRole('button', { name: 'Edit Account' }).click();
    await expect(page.locator('input[name="nric"]')).toHaveValue(unmaskedNRIC);
  });
});