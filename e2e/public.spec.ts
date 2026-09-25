import { expect, test } from "@playwright/test";

function readHeroAnimations(element: Element) {
  const heading = element.querySelector("h1");

  return {
    backdrop: element
      .querySelector("[data-hero-backdrop]")
      ?.getAttribute("data-motion-enabled"),
    title: heading ? getComputedStyle(heading).animationName : "missing",
  };
}

test.describe("public experience", () => {
  test("public theme control is in the footer", async ({ page }) => {
    await page.goto("/");

    const themeControl = page.getByRole("combobox", { name: "Color theme" });
    await expect(
      page.locator("header").getByRole("combobox", { name: "Color theme" }),
    ).toHaveCount(0);
    await expect(
      page.locator("footer").getByRole("combobox", { name: "Color theme" }),
    ).toBeVisible();

    await themeControl.selectOption("dark");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("home page presents the animated search hero and accessible card actions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Find your next property in Jaipur" }),
    ).toBeVisible();
    const hero = page.locator(".home-hero");
    await expect(hero.locator("[data-hero-backdrop]")).toHaveAttribute(
      "data-motion-enabled",
      "true",
    );
    const heroMotion = await hero.evaluate(readHeroAnimations);
    expect(heroMotion).toEqual({
      backdrop: "true",
      title: "hero-title-reveal",
    });
    await expect(page.getByRole("radio", { name: "Buy" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Rent" })).toBeVisible();

    const firstCard = page.locator("article.group a").first();
    const action = page.locator(".property-card-cta").first();
    await expect(action).toBeVisible();
    const restingBackground = await action.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await firstCard.focus();
    await expect
      .poll(
        () => action.evaluate((element) => getComputedStyle(element).backgroundColor),
        { timeout: 1_000 },
      )
      .not.toBe(restingBackground);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(hero.locator("[data-hero-backdrop]")).toHaveAttribute(
      "data-motion-enabled",
      "false",
    );
    const reducedMotion = await hero.evaluate(readHeroAnimations);
    expect(reducedMotion).toEqual({ backdrop: "false", title: "none" });
  });

  test("catalogue and contact pages expose labelled controls", async ({
    page,
  }) => {
    await page.goto("/blogs");
    await expect(
      page.getByRole("heading", { name: "Notes for better property decisions." }),
    ).toBeVisible();
    const featuredArticle = page.locator('a[data-featured="true"]');
    await expect(featuredArticle).toBeVisible();
    await expect(featuredArticle.getByText("Featured guide")).toBeVisible();
    await expect(featuredArticle.getByText("Read article")).toBeVisible();

    await page.goto("/properties");
    await expect(
      page.getByRole("heading", { name: "Properties in Jaipur" }),
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: "Search by title, area, locality" }),
    ).toBeVisible();
    await expect(page.locator(".property-card-cta").first()).toBeVisible();
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
    await expect(
      page.getByRole("combobox", { name: "Color theme" }),
    ).toHaveCount(0);
  });
});
