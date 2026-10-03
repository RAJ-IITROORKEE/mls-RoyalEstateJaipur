import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

test("shared component preview is protected", async ({ page }) => {
  await page.goto("/admin/design-system");
  await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fadmin/);
});

test("admin can review themed controls, keyboard overlays and responsive states", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password)
    throw new Error(
      "Configure bootstrap admin credentials privately to verify the real component preview.",
    );
  await page.goto("/sign-in?redirect=%2Fadmin%2Fdesign-system");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .locator("form")
    .getByRole("button", { name: "Sign in", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/design-system$/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", {
      name: "A clearer way to find your next place.",
    }),
  ).toBeVisible();

  for (const theme of ["light", "dark"]) {
    await page
      .getByRole("combobox", { name: "Color theme" })
      .selectOption(theme);
    await expect(page.locator("html")).toHaveClass(
      new RegExp(`\\b${theme}\\b`),
    );
    await expect(
      page.locator('[data-slot="card-description"]').first(),
    ).toHaveCSS(
      "color",
      theme === "dark" ? "rgb(148, 163, 184)" : "rgb(82, 99, 92)",
    );
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(result.violations, `${theme} preview accessibility`).toEqual([]);
  }

  const locality = page.getByRole("combobox", {
    name: "Locality: All locations",
  });
  await locality.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("combobox", { name: "Search localities" }).fill("Jagat");
  const localityScan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(localityScan.violations).toEqual([]);
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("combobox", { name: "Locality: Jagatpura" }),
  ).toBeFocused();

  await page.getByRole("tab", { name: "Details", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Process", exact: true }),
  ).toHaveAttribute("data-state", "active");
  await page
    .getByRole("button", { name: "Does an enquiry reserve a property?" })
    .click();
  await expect(
    page.getByText(
      "No. The team confirms current availability and discusses the next step.",
    ),
  ).toBeVisible();

  for (const triggerName of ["Open details", "Open filters"]) {
    const trigger = page.getByRole("button", {
      name: triggerName,
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (let step = 0; step < 4; step += 1) {
      await page.keyboard.press("Tab");
      await expect
        .poll(() =>
          dialog.evaluate((element) =>
            element.contains(document.activeElement),
          ),
        )
        .toBe(true);
    }
    const dialogScan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(dialogScan.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  await page.getByRole("button", { name: "Remove sample" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep sample" }).click();
  await expect(
    page.getByRole("button", { name: "Remove sample" }),
  ).toBeFocused();

  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => {
    document.body.style.zoom = "2";
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Open details", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    document.body.style.zoom = "1";
  });
});
