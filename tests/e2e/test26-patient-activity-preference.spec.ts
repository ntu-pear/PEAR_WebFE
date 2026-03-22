import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "tests/e2e/test.env") });

const frontendUrl = process.env.FRONTEND_URL!;
const supervisorEmail = process.env.SUPERVISOR_ACCOUNT_EMAIL!;
const supervisorPassword = process.env.SUPERVISOR_ACCOUNT_PASSWORD!;

test("Supervisor - Patient Activity Preference Page", async ({ page }) => {
  
  // ================= LOGIN =================
  await test.step("Login", async () => {
    await page.goto(frontendUrl);

    await page.getByRole("textbox", { name: "Enter a valid email address." }).fill(supervisorEmail);
    await page.getByRole("textbox", { name: "Password" }).fill(supervisorPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText("Login successful.")).toBeVisible();
  });

  // ================= SEARCH PATIENT =================
  await test.step("Search patient BI GONG", async () => {
    const searchInput = page.getByRole("searchbox", { name: "Search" });

    await searchInput.fill("BI GONG");

    // wait for results
    await page.waitForTimeout(800);

    const row = page.locator("table tbody tr", {
      has: page.locator("text=BI GONG"),
    }).first();

    await expect(row).toBeVisible();
  });

  // ================= VIEW MORE =================
  await test.step("Click View More", async () => {
    const row = page.locator("table tbody tr", {
      has: page.locator("text=BI GONG"),
    }).first();

    const viewMoreBtn = row.getByRole("link", { name: "View More" });

    await expect(viewMoreBtn).toBeVisible();
    await viewMoreBtn.click();

    await expect(page).toHaveURL(/view-patient/);

    // wait for page to load
    await page.waitForTimeout(1000);
  });

  // ================= CLICK ACTIVITY PREFERENCE =================
  await test.step("Open Activity Preferences", async () => {
    const activityTab = page.getByRole("tab", {
        name: /activity preference/i,
    });

    await expect(activityTab).toBeVisible();
    await activityTab.click();

    const panel = page.getByRole("tabpanel", {
        name: /activity preference/i,
    });

    await expect(panel).toBeVisible();

    // use unique text under the heading instead of the heading itself
    await expect(
        panel.getByText(
            /view and manage activity preferences/i
        )
    ).toBeVisible();

});

  // ================= TABLE CHECK =================
  await test.step("Check table visible", async () => {
    await expect(page.getByRole("table")).toBeVisible();

    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  // ================= TOGGLE PREFERENCE =================
  await test.step("Toggle preference", async () => {
    const firstRow = page.locator("tbody tr").first();

    const preferenceBtn = firstRow.getByRole("button", {
      name: /like|neutral|dislike/i,
    });

    await preferenceBtn.click();

    // allow UI to refresh
    await page.waitForTimeout(1000);

    // verify UI still visible
    await expect(firstRow).toBeVisible();
  });

  // ================= ADD EXCLUSION =================
  await test.step("Add Activity Exclusion", async () => {
    await page.getByRole("button", {
        name: "Add Activity Exclusion",
    }).click();

    await expect(
        page.getByRole("heading", {
            name: "Add Activity Exclusion",
            level: 2,
    })
    ).toBeVisible();

    const dialog = page.getByRole("dialog", { name: /add activity exclusion/i });
    await expect(dialog).toBeVisible();

    // Search
    await dialog
        .getByRole("textbox", { name: /search activities/i })
        .fill("Playwright");

    // Select activity 
    const activityRow = dialog.getByText(
        "PLAYWRIGHT TEST ACTIVITY(Do not delete, this is to playwright test centre activities)"
    );

    await expect(activityRow).toBeVisible();
    await activityRow.click();


    // remarks
    await dialog
        .getByRole("textbox", { name: /exclusion remarks/i })
        .fill("Test exclusion remarks");

    // create
    const createBtn = dialog.getByRole("button", { name: /create/i });

    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await expect(page.getByText("Exclusion(s) created")).toBeVisible();
  });

  // ================= WAIT =================
  await expect(
      page.getByRole("dialog", { name: /add activity exclusion/i })
  ).toBeHidden();

  // ================= CHECK EXCLUSION =================
  await test.step("Check exclusion exists", async () => {
      const statusBadge = page.locator("text=Yes").first();
      await expect(statusBadge).toBeVisible();
  });

  const playwrightRow = page.locator("tbody tr").filter({
      has: page.getByRole("cell", { name: /^PLAYWRIGHT TEST ACTIVITY$/ }),
  });

  await expect(playwrightRow).toBeVisible();

  // ================= EDIT EXCLUSION =================
  await test.step("Edit exclusion", async () => {
    // Ensure Add dialog fully closed
    await expect(
      page.getByRole("dialog", { name: /add activity exclusion/i })
    ).toBeHidden();

    // Wait for the correct row
    const playwrightRow = page.locator("tbody tr").filter({
      has: page.getByRole("cell", {
        name: /^PLAYWRIGHT TEST ACTIVITY$/,
      }),
    });

    await expect(playwrightRow).toBeVisible();

    
    // Click EDIT
    await playwrightRow.getByRole("button", { name: "Edit exclusion" }).click();

    // Scope assertions to the edit dialog
    const editDialog = page.getByRole("dialog", { name: /edit exclusion/i });
    await expect(editDialog).toBeVisible();

    const updateButton = editDialog.getByRole("button", { name: "Update" });
    await expect(updateButton).toBeVisible();

    await updateButton.click();
    await expect(page.getByText("Exclusion updated")).toBeVisible();


  });

  // ================= DELETE EXCLUSION =================
await test.step("Delete exclusion", async () => {
  await expect(
    page.getByRole("dialog", { name: /edit exclusion/i })
  ).toBeHidden();

  const playwrightRow = page.locator("tbody tr").filter({
    has: page.getByRole("cell", { name: /^PLAYWRIGHT TEST ACTIVITY$/ }),
  });

  await expect(playwrightRow).toBeVisible();

  page.once("dialog", dialog => {
  expect(dialog.message()).toMatch(/delete/i);
  dialog.accept();
});

await playwrightRow
  .getByRole("button", { name: "Delete exclusion" })
  .click();

await expect(
  page.getByRole("region", { name: /notifications/i })
    .getByText("Exclusion deleted", { exact: true })
).toBeVisible();
});


});