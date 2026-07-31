import { expect, test } from "@playwright/test";

test.describe("public experience", () => {
  test("home page exposes keyboard-accessible primary navigation", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /find a property/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore properties" }),
    ).toHaveAttribute("href", "/properties");
    await expect(page.locator("html")).toHaveClass(/light/);
    await expect(
      page.getByRole("heading", { name: "Properties ready to explore" }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Filter recent properties by type"),
    ).toBeVisible();
    await expect(page.getByLabel("Sort recent properties")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });

  test("catalogue and contact pages expose labelled controls", async ({
    page,
  }) => {
    await page.goto("/properties");
    await expect(
      page.getByRole("heading", {
        name: /properties with the useful details/i,
      }),
    ).toBeVisible();
    await expect(page.getByLabel("Search locality")).toBeVisible();
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: "Send an enquiry" }),
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel(/consent/i)).toBeVisible();
  });

  test("protected admin aliases send signed-out visitors to admin sign-in", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fadmin/);
    await expect(
      page.getByRole("heading", { name: "Welcome back." }),
    ).toBeVisible();
  });
});
