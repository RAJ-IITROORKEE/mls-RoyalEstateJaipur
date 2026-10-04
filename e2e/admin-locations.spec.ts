import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

test("locations page and mutations reject a guest", async ({
  page,
  request,
  baseURL,
}) => {
  await page.goto("/admin/settings/locations");
  await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fadmin/);
  const response = await request.post("/api/admin/localities", {
    data: {},
    headers: { origin: baseURL ?? "http://127.0.0.1:3100" },
  });
  expect(response.status()).toBe(401);
});

test("admin location table, CRUD, guards and responsive overlays", async ({
  page,
  baseURL,
}) => {
  test.setTimeout(240_000);
  // This test creates one inactive disposable location and deletes only its returned ID.
  if (
    !baseURL ||
    !new URL(baseURL).hostname.match(/^(localhost|127\.0\.0\.1)$/)
  )
    throw new Error(
      "Run the mutating location test through the local application only.",
    );
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password)
    throw new Error(
      "Configure private bootstrap admin credentials to verify locations.",
    );
  await page.goto("/sign-in?redirect=%2Fadmin%2Fsettings%2Flocations");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .locator("form")
    .getByRole("button", { name: "Sign in", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/settings\/locations$/, {
    timeout: 30_000,
  });
  await expect(
    page.getByRole("heading", { name: "Property locations", exact: true }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Foundation preview")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Admin navigation" })
      .getByRole("link", { name: "FAQs", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("complementary", { name: "Admin sidebar" })
      .locator('img[src*="logo"]'),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Admin navigation" })
      .getByRole("link", { name: "Users", exact: true }),
  ).toHaveAccessibleName("Users");
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();

  for (const theme of ["light", "dark"]) {
    await page
      .getByRole("combobox", { name: "Color theme" })
      .selectOption(theme);
    await expect(page.locator("html")).toHaveClass(
      new RegExp(`\\b${theme}\\b`),
    );
    await expect(
      page.getByRole("heading", { name: "Property locations", exact: true }),
    ).toHaveCSS(
      "color",
      theme === "dark" ? "rgb(241, 245, 249)" : "rgb(16, 42, 34)",
    );
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  const name = `QA disposable ${Date.now()}`;
  let createdId: string | undefined;
  try {
    await page
      .getByRole("button", { name: "Add location", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Add location",
      exact: true,
    });
    await dialog.getByLabel("Location name").fill(name);
    await dialog
      .getByRole("checkbox", { name: "Active in property search" })
      .uncheck();
    const created = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/localities") &&
        response.request().method() === "POST",
    );
    await dialog
      .getByRole("button", { name: "Save location", exact: true })
      .click();
    const createResponse = await created;
    expect(createResponse.status()).toBe(201);
    const body: unknown = await createResponse.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("locality" in body) ||
      !body.locality ||
      typeof body.locality !== "object" ||
      !("id" in body.locality) ||
      typeof body.locality.id !== "string"
    )
      throw new Error("Create response did not contain the new location ID.");
    createdId = body.locality.id;
    await expect(dialog).toBeHidden();
    await page.getByLabel("Search locations").fill(name);
    await page.getByLabel("Sort locations").selectOption("name_desc");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page).toHaveURL(/sort=name_desc/);
    await expect(
      page.getByRole("status").filter({ hasText: "1 location" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: `Edit ${name}`, exact: true })
      .click();
    const edit = page.getByRole("dialog", {
      name: "Edit location",
      exact: true,
    });
    await edit.getByLabel("Display order").fill("7");
    await edit.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(
      page.getByRole("alertdialog", { name: "Discard unsaved changes?" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Keep editing", exact: true })
      .click();
    await expect(edit.getByLabel("Display order")).toHaveValue("7");
    const updated = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/admin/localities/${createdId}`) &&
        response.request().method() === "PATCH",
    );
    await edit
      .getByRole("button", { name: "Save location", exact: true })
      .click();
    expect((await updated).status()).toBe(200);
    await expect(edit).toBeHidden();
    await page.reload();
    await expect(
      page.getByRole("cell", { name: "7", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: `Delete ${name}`, exact: true })
      .click();
    await expect(
      page.getByRole("alertdialog", { name: `Delete ${name}?`, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();

    for (const width of [320, 375, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        )
        .toBe(true);
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole("button", { name: "Open admin navigation" }).click();
    const drawer = page.getByRole("dialog", {
      name: "Admin navigation",
      exact: true,
    });
    await expect(
      drawer.getByRole("link", { name: "Settings", exact: true }),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open admin navigation" }),
    ).toBeFocused();
  } finally {
    if (createdId) {
      const removed = await page.request.delete(
        `/api/admin/localities/${createdId}`,
        {
          headers: { origin: baseURL, "content-type": "application/json" },
          data: {},
        },
      );
      expect(
        removed.status(),
        "Cleanup deletes only the inactive location created by this test",
      ).toBe(200);
    }
  }
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "No matching locations" }),
  ).toBeVisible({ timeout: 30_000 });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/submissions");
  const filters = page.getByRole("navigation", { name: "Submission status" });
  await expect(filters).toBeVisible({ timeout: 30_000 });
  for (const label of ["Needs review", "Changes requested", "Approved"]) {
    await filters.getByRole("link", { name: label, exact: true }).click();
    await expect(
      filters.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("aria-current", "page", { timeout: 30_000 });
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});
