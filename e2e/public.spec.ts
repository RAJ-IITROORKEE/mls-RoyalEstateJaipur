import { expect, test } from "@playwright/test";

function readHeroAnimations(element: Element) {
  const heading = element.querySelector("h1");

  return {
    background: getComputedStyle(element, "::before").animationName,
    title: heading ? getComputedStyle(heading).animationName : "missing",
  };
}

test.describe("public experience", () => {
  test("home page presents the animated search hero and accessible card actions", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Find your next property in Jaipur" }),
    ).toBeVisible();
    const hero = page.locator(".home-hero");
    const heroMotion = await hero.evaluate(readHeroAnimations);
    expect(heroMotion).toEqual({
      background: "hero-spotlight-drift",
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
    const reducedMotion = await hero.evaluate(readHeroAnimations);
    expect(reducedMotion).toEqual({ background: "none", title: "none" });
  });

  test("catalogue and contact pages expose labelled controls", async ({
    page,
  }) => {
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
  });
});
