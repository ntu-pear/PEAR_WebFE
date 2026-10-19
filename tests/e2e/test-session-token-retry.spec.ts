import { test, expect, type Page, type Route } from "@playwright/test";
import { appBaseUrl, login, supervisorEmail, supervisorPassword } from "./helpers";

const GUARDIAN_LIST = "**/Guardian/GetPatientGuardianByPatientId**";
const REFRESH = /\/refresh\/?(\?|$)/;

function unauthorized(route: Route) {
  return route.fulfill({
    status: 401,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify({ detail: "Token expired" }),
  });
}

async function openFirstPatient(page: Page): Promise<string> {
  await page.goto(`${appBaseUrl}/supervisor/manage-patients`);
  await page.getByRole("tab", { name: "All Patients" }).click();

  const firstRow = page.locator("table tbody tr").first();
  await expect(firstRow).toBeVisible();
  await firstRow.getByRole("link", { name: "View More" }).or(firstRow.getByRole("button", { name: "View More" })).first().click();
  await expect(page).toHaveURL(/\/supervisor\/view-patient\/\d+/);

  return page.url().match(/view-patient\/(\d+)/)![1];
}

test.describe("Session - Expired access token", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, supervisorEmail, supervisorPassword);
  });

  test("A request rejected with 401 is retried after refreshing the token", async ({ page }) => {
    const patientId = await openFirstPatient(page);
    let expiredToken: string | null = null;
    const retriedTokens: string[] = [];

    await page.route(GUARDIAN_LIST, async (route) => {
      if (route.request().method() !== "GET") return route.continue();
      const token = route.request().headers()["authorization"] ?? "";
      expiredToken ??= token;
      if (token === expiredToken) return unauthorized(route);
      retriedTokens.push(token);
      return route.continue();
    });

    const refresh = page.waitForRequest(
      (request) => request.method() === "POST" && REFRESH.test(new URL(request.url()).pathname)
    );

    await test.step("Open the Guardian tab with the current token rejected", async () => {
      await page.goto(`${appBaseUrl}/supervisor/view-patient/${patientId}?tab=guardian`);
    });

    await test.step("The token is refreshed and the request is sent again with the new token", async () => {
      await refresh;
      await expect.poll(() => retriedTokens.length).toBeGreaterThan(0);
      expect(retriedTokens.every((token) => token.startsWith("Bearer ") && token !== expiredToken)).toBe(true);
    });

    await test.step("The tab loads without an error or a logout", async () => {
      await expect(page.locator("table tbody tr").first()).toBeVisible();
      await expect(page.getByText("Failed to fetch guardian for patient")).toHaveCount(0);
      await expect(page).toHaveURL(new RegExp(`/supervisor/view-patient/${patientId}`));
    });
  });

  test("A failed refresh sends the user back to login", async ({ page }) => {
    const patientId = await openFirstPatient(page);

    await page.route(GUARDIAN_LIST, (route) =>
      route.request().method() === "GET" ? unauthorized(route) : route.continue()
    );
    await page.route(
      (url) => REFRESH.test(url.pathname),
      (route) => (route.request().method() === "POST" ? unauthorized(route) : route.continue())
    );

    await test.step("Open the Guardian tab with every request rejected", async () => {
      await page.goto(`${appBaseUrl}/supervisor/view-patient/${patientId}?tab=guardian`);
    });

    await test.step("The user is logged out", async () => {
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
