import { test, expect } from "@playwright/test";

// run npx playwright test

test("check login page", async ({ page }) => {
  await page.goto("/");

  console.log("Current URL:", page.url()); // Logs the full URL

  const emailInput = page.getByPlaceholder("email");
  await expect(emailInput).toBeEmpty();

  const passwordInput = page.getByPlaceholder("password");
  await expect(passwordInput).toBeEmpty();
});
