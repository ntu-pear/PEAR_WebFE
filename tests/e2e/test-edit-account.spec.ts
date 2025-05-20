import { test, expect } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Read from ".env" file.
dotenv.config({ path: 'test.env' });

const baseUrl = process.env.BASE_URL as string;
const adminAccountEmail = process.env.ADMIN_ACCOUNT_EMAIL as string;
const adminAccountPassword = process.env.ADMIN_ACCOUNT_PASSWORD as string;

test('test edit account modal', async ({ page }) => {
  await page.goto(baseUrl);
  await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(adminAccountEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(adminAccountPassword);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  await expect(page.getByText('Login successful.')).toBeVisible();
  await expect(page.locator('[id="radix-\\:rf\\:-content-all"] div').filter({ hasText: 'IDNameStatusEmailLast' }).nth(1)).toBeVisible();

  var testAccountRow = page.getByRole('row', { name: 'Ud3a7b1b8cc Test Account (' });
  // search for the test account row, timeout after default of 30s
  const timeout = 30000;
  const startTime = Date.now();
  while (await testAccountRow.count() === 0 && (Date.now() - startTime < timeout)) {
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
  // check the unmask nric eye button
  const unmaskNricBtn = page.locator('div').filter({ hasText: /^\*\*\*\*\*\d+[A-Z]$/ }).getByRole('button');
  await expect(unmaskNricBtn).toBeVisible();
  const nricLocator = await page.locator("#accountinfo-nric");
  await expect(nricLocator).toBeVisible();
  const maskedNRIC = await nricLocator.innerText();

  // get the created and modified date
  const createdDate = await page.locator("#accountinfo-created-date").innerText();
  const modifiedDate = await page.locator("#accountinfo-modified-date").innerText();
  console.log("created and modified date " + createdDate + " " + modifiedDate);

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
  await expect(page.locator("#accountinfo-preferred-name")).toContainText(newPreferredName);

  // check dates, created date should be the same, modified date should be different
  const newCreatedDate = await page.locator("#accountinfo-created-date").innerText();
  const newModifiedDate = await page.locator("#accountinfo-modified-date").innerText();
  expect(newCreatedDate).toEqual(createdDate);
  expect(newModifiedDate).not.toEqual(modifiedDate);

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