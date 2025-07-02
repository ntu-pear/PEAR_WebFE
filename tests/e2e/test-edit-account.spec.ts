import { test, expect } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Read from ".env" file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'test.env') });

// these are the variables used in the test to be included in the .env file
const frontendUrl = process.env.FRONTEND_URL as string;
const adminAccountEmail = process.env.ADMIN_ACCOUNT_EMAIL as string;
const adminAccountPassword = process.env.ADMIN_ACCOUNT_PASSWORD as string;
const editTestAccountID = process.env.EDIT_TEST_ACCOUNT_ID as string;

const hostServerIP = process.env.HOST_SERVER_IP as string; // Optional IP address of the host server, used to rewrite requests to localhost

// Ensure all required environment variables are set
if (!frontendUrl || !adminAccountEmail || !adminAccountPassword || !editTestAccountID) {
  throw new Error('Missing required environment variables in test.env');
}

/*
Test Case: Edit Account Modal Functionality
Validate that:
The preferred name is updated in the account view.
The date of birth is updated in the account view.
The modified date has changed, but the created date remains the same.
The NRIC can be unmasked. The "Edit Account" modal shows the unmasked value.
  */
test('Edit account modal updates preferred name and unmasks NRIC', async ({ page }) => {
  // test account id to be used in the test
  // timeout used during search for the test account row
  const searchTimeout = 30000;
  test.step('intercepts and rewrites requests to localhost if on the same server', async () => {
    // App is unable to reach the backend api when it is running on the same server, 
    // so we need to rewrite the requests to localhost instead.

    // Intercept ALL requests before the page makes them
    await page.route('**', async (route) => {
      const request = route.request();
      let url = request.url();

      if (hostServerIP && url.includes(hostServerIP)) {
        const prevUrl = url;
        url = url.replace(hostServerIP, 'localhost');
        console.log(`Rewrote URL: ${prevUrl} to ${url}`);
        await route.continue({ url });
      } else {
        await route.continue();
      }
    });
  });

  await test.step('Navigate and login to admin', async () => {
    await page.goto(frontendUrl);
    await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(adminAccountEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(adminAccountPassword);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.waitForResponse(resp => resp.url().includes('/login')); // wait for login api to return
    // check that login was successful and the admin page is loaded
    await expect(page.getByText('Login successful.')).toBeVisible();
    await expect(page.getByRole("tabpanel").filter({ hasText: 'IDNameStatusEmailLast' })).toBeVisible();
  });

  await test.step('Search for the test account', async () => {
    const getTestAccountRow = () => page.getByRole('row', { name: `${editTestAccountID} Test` });
    let testAccountRow = getTestAccountRow();

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
      testAccountRow = getTestAccountRow();
    }

    await testAccountRow.getByLabel('View more').click();
  });

  var unmaskNricBtn;
  var nricLocator;
  var maskedNRIC = '';
  var createdDate = '';
  var modifiedDate = '';
  var nric_DateOfBirth = '';
  await test.step('Check the test account initial values', async () => {
    // check the unmask nric eye button
    unmaskNricBtn = page.locator('div').filter({ hasText: /^\*\*\*\*\*\d+[A-Z]$/ }).getByRole('button');
    await expect(unmaskNricBtn).toBeVisible();
    nricLocator = page.locator("#accountinfo-nric");
    await expect(nricLocator).toBeVisible();
    maskedNRIC = await nricLocator.innerText();

    // get the created and modified date
    createdDate = await page.locator("#accountinfo-created-date").innerText();
    modifiedDate = await page.locator("#accountinfo-modified-date").innerText();

    // get nric date of birth
    nric_DateOfBirth = await page.locator("#accountinfo-dob").innerText();
  });

  var newPreferredName = '';
  var newDateOfBirth = '';
  await test.step('Check edit modal prefilled values and make changes', async () => {
    // check edit account modal
    await page.getByRole('button', { name: 'Edit Account' }).click();
    await expect(page.locator('input[name="nric"]')).toHaveValue(maskedNRIC);

    const originalPreferredName = await page.locator('input[name="preferredName"]').inputValue();
    // increment last digit of preferred name
    const lastDigit = parseInt(originalPreferredName.slice(-1)) + 1;
    newPreferredName = originalPreferredName.slice(0, -1) + lastDigit;
    await page.locator('input[name="preferredName"]').fill(newPreferredName);

    newDateOfBirth = getRandDate(nric_DateOfBirth);
    console.log("new date of birth " + newDateOfBirth);
    await page.locator('input[name="nric_DateOfBirth"]').fill(newDateOfBirth);

    await page.getByRole('button', { name: 'Save' }).click();
    // wait for modal to close
    await expect(page.getByRole('heading', { name: 'Edit Account Information' })).not.toBeVisible();
  });

  await test.step('Check view account ui is updated', async () => {
    await expect(page.locator("#accountinfo-preferred-name")).toContainText(newPreferredName);
    await expect(page.locator("#accountinfo-dob")).toContainText(newDateOfBirth);

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
    await expect(page.locator('input[name="nric"]')).toHaveValue(unmaskedNRIC)
  });

  await test.step('Check no changes behaviour', async () => {
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('No changes detected.')).toBeVisible();
  });
});

function getRandDate(excludeDate: string): string {
  // Generate a random time between 100 and 20 years ago
  const today = new Date();
  const hundredYearsAgo = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());

  let newDate: Date;
  let newDateString: string;

  do {
    const timeDiff = twentyYearsAgo.getTime() - hundredYearsAgo.getTime();
    const randomTime = hundredYearsAgo.getTime() + Math.random() * timeDiff;
    newDate = new Date(randomTime);

    // Format date as YYYY-MM-DD
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    newDateString = `${year}-${month}-${day}`;

  } while (newDateString === excludeDate); // avoid same date

  return newDateString;
}
