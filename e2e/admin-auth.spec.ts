import { config } from "dotenv";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const authTestBaseUrl = process.env.AUTH_TEST_BASE_URL;

test("configured admin can sign in through the browser form", async ({
  page,
}) => {
  test.skip(
    !adminEmail || !adminPassword,
    "Bootstrap admin credentials are not configured.",
  );

  await page.goto(
    authTestBaseUrl
      ? new URL("/sign-in", authTestBaseUrl).toString()
      : "/sign-in",
  );
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword!);
  await page
    .locator("form")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());

  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "The next useful action." }),
  ).toBeVisible();

  await page.goto("/admin/properties");
  await expect(
    page.getByRole("heading", { name: "Property management" }),
  ).toBeVisible();
  await expect(page.getByText("Total inventory", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Search")).toBeVisible();
  await expect(page.getByLabel("Sort")).toBeVisible();
});

test("signed-in submission flow exposes the dedicated Photos step", async ({
  page,
}) => {
  test.skip(
    !adminEmail || !adminPassword,
    "Bootstrap admin credentials are not configured.",
  );

  await page.goto(
    authTestBaseUrl
      ? new URL("/sign-in", authTestBaseUrl).toString()
      : "/sign-in",
  );
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword!);
  await page
    .locator("form")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });

  await page.route("**/api/submissions", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        submission: {
          id: "00000000-0000-4000-8000-000000000001",
          status: "DRAFT",
        },
      },
      status: 200,
    });
  });
  await page.route("**/api/submissions/*/media", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: { media: [] },
      status: 200,
    });
  });

  await page.goto(
    authTestBaseUrl
      ? new URL("/account/submissions/new", authTestBaseUrl).toString()
      : "/account/submissions/new",
  );

  await expect(page.getByText("Step 1 of 6")).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Photos" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Locality").fill("C-Scheme");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Listing title").fill("Owner preview test property");
  await page
    .getByLabel("Description")
    .fill("A complete property description for the owner preview workflow.");
  await page.getByLabel("Area").fill("1500");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Photos" })).toBeVisible();
  await expect(page.getByText("Add the first preview image")).toBeVisible();
  await expect(page.getByText("0/5 uploaded · minimum 1")).toBeVisible();
});
