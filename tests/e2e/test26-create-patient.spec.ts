import dotenv from 'dotenv';
import path from 'path';
import { format } from 'date-fns';
import { test, expect } from '@playwright/test';

dotenv.config({ path: path.resolve(process.cwd(), 'tests/e2e/test.env') });

const frontendUrl = process.env.FRONTEND_URL!;
if (!frontendUrl) throw new Error('Missing FRONTEND_URL');
const supervisorEmail = process.env.SUPERVISOR_ACCOUNT_EMAIL!;
if (!supervisorEmail) throw new Error('Missing SUPERVISOR_ACCOUNT_EMAIL');
const supervisorPassword = process.env.SUPERVISOR_ACCOUNT_PASSWORD!;
if (!supervisorPassword) throw new Error('Missing SUPERVISOR_ACCOUNT_PASSWORD')
const userServiceURL = process.env.USER_SERVICE_URL as string;
const patientServiceURL = process.env.PATIENT_SERVICE_URL as string;

const TODAY = format(new Date(), 'yyyy-MM-dd');
const PATIENT_DOB = '1990-06-15';
const GUARDIAN_DOB = '1965-03-20';

type NRICPREFIX = 'S' | 'T' | 'F' | 'G'
function generateNRIC(prefix: NRICPREFIX = 'S'): string {
    const WEIGHTS = [2, 7, 6, 5, 4, 3, 2];
    const ST_CHECKS = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    const FG_CHECKS = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
    // 7 random body digits
    const digits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));

    // Weighted sum + prefix offset
    let sum = digits.reduce((acc, digit, i) => acc + digit * WEIGHTS[i], 0);
    if (prefix === 'T' || prefix === 'G') sum += 4;

    const checkLetter = (prefix === 'S' || prefix === 'T')
        ? ST_CHECKS[sum % 11]
        : FG_CHECKS[sum % 11];

    return `${prefix}${digits.join('')}${checkLetter}`;
}

const FIRST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward',
    'Fiona', 'George', 'Hannah', 'Ivan', 'Julia'];
const LAST_NAMES = ['Tan', 'Lim', 'Lee', 'Wong', 'Chen',
    'Ng', 'Goh', 'Chua', 'Ong', 'Koh'];
function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
interface GeneratedIdentity {
    fullName: string;   // e.g. "TESTING Alice Tan"
    preferredName: string;   // e.g. "TESTING Alice"
    firstName: string;   // e.g. "TESTING Alice"  (used for guardian)
    lastName: string;   // e.g. "Tan"
    nric: string;   // e.g. "S3821047G"
}
function generateIdentity(prefix: NRICPREFIX = 'S'): GeneratedIdentity {
    const first = randomItem(FIRST_NAMES);
    const last = randomItem(LAST_NAMES);
    return {
        fullName: `TESTING ${first} ${last}`,
        preferredName: `TESTING ${first}`,
        firstName: `TESTING ${first}`,
        lastName: last,
        nric: generateNRIC(prefix),
    };
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

test('Create Patient', async ({ page }) => {
    await test.step('Setup route interception', async () => {
        await setupRouteInterception(page, userServiceURL, patientServiceURL);
    });
    const patient = generateIdentity('S')
    const guardian = generateIdentity('T')

    await test.step('Login as Supervisor', async () => {
        await page.goto(frontendUrl)
        await page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(supervisorEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill(supervisorPassword);
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL(new RegExp(`supervisor/manage-patients`), { timeout: 45000 });
        await page.getByRole('tab', { name: 'My Patients' }).waitFor({ state: 'visible' });
    })

    await test.step('Navigate to Add Patient page', async () => {
        await page.goto(`${frontendUrl}/supervisor/add-patient`);
        await page.waitForSelector('#personal-info');
    })

    await test.step('Fill patient basic information', async () => {
        await page.fill('#patient-name', patient.fullName);
        await page.fill('#patient-preferred-name', patient.preferredName);
        await page.fill('#patient-nric', patient.nric);
        await page.fill('#patient-dob', PATIENT_DOB);
    });

    await test.step('Select patient gender', async () => {
        await page.check('#patient-gender-male');
    });

    await test.step('Fill patient phone numbers', async () => {
        await page.fill('#patient-home-number', '61234567');
        await page.fill('#patient-handphone-number', '91234567');
    });

    await test.step('Fill patient address', async () => {
        await page.fill('#patient-address', '123 Orchard Road Singapore 238858');
    });

    await test.step('Select patient preferred language', async () => {
        await page.selectOption('#patient-preferred-language', { index: 1 });
    });

    await test.step('Select respite care option', async () => {
        await page.check('#patient-respite-care-no');
    });

    await test.step('Fill patient joining date', async () => {
        await page.fill('#patient-joining-date', TODAY);
    });

    await test.step('Fill primary guardian name fields', async () => {
        await page.fill('input[name="guardians.0.firstName"]', guardian.firstName);
        await page.fill('input[name="guardians.0.lastName"]', guardian.lastName);
        await page.fill('input[name="guardians.0.preferredName"]', guardian.preferredName);
    });

    await test.step('Select guardian relationship', async () => {
        await page.selectOption('select[name="guardians.0.relationshipName"]', 'Child');
    });

    await test.step('Fill guardian NRIC', async () => {
        await page.fill('input[name="guardians.0.nric"]', guardian.nric);
    });

    await test.step('Fill guardian date of birth', async () => {
        await page.fill('input[name="guardians.0.dateOfBirth"]', GUARDIAN_DOB);
    });

    await test.step('Select guardian gender', async () => {
        await page.check('input[value="F"][name="guardians.0.gender"]');
    });

    await test.step('Fill guardian contact number', async () => {
        await page.fill('input[name="guardians.0.contactNo"]', '91234568');
    });

    await test.step('Fill guardian address', async () => {
        await page.fill('input[name="guardians.0.address"]', '456 Bukit Timah Road Singapore 259756');
    });

    await test.step('Submit the form', async () => {
        const submitBtn = page.locator('button[type="submit"]', { hasText: 'Add Patient' });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();
    });

    await test.step('Assert success', async () => {
        await expect(
            page.locator('text=Patient Created Successfully')
        ).toBeVisible({ timeout: 15_000 });
    });
})