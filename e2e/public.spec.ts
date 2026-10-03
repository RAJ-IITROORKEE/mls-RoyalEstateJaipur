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
  test("shared hero controls preserve URL-backed property search", async ({
    page,
  }) => {
    await page.goto("/");
    const search = page.getByRole("search");
    const rent = search.getByRole("radio", { name: "Rent" });
    await rent.focus();
    await rent.press("Space");
    await expect(rent).toBeChecked();
    await search
      .getByRole("searchbox", { name: "Search by title, area, locality" })
      .fill("Jaipur");
    await search
      .getByRole("combobox", { name: "Property type" })
      .selectOption("RESIDENTIAL");
    await search.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/\/properties\?/);
    const query = new URL(page.url()).searchParams;
    expect(query.get("intent")).toBe("RENT");
    expect(query.get("q")).toBe("Jaipur");
    expect(query.get("category")).toBe("RESIDENTIAL");
  });

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
    await expect(
      page.locator('meta[name="theme-color"]').first(),
    ).toHaveAttribute("content", "#020617");
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.emulateMedia({ colorScheme: "light" });
    await themeControl.selectOption("system");
    await expect(page.locator("html")).toHaveClass(/light/);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("home page presents the animated search hero and accessible card actions", async ({
    page,
  }) => {
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
    const lights = hero.locator("[data-spotlight-moving]");
    const firstTransform = await lights
      .first()
      .evaluate((element) => getComputedStyle(element).transform);
    await expect
      .poll(() =>
        lights
          .first()
          .evaluate((element) => getComputedStyle(element).transform),
      )
      .not.toBe(firstTransform);
    await page
      .getByRole("button", { name: "Pause background animation" })
      .click();
    await expect(hero.locator("[data-hero-backdrop]")).toHaveAttribute(
      "data-motion-enabled",
      "false",
    );
    await expect(lights.first()).toHaveCSS("animation-play-state", "paused");
    const pausedTransform = await lights
      .first()
      .evaluate((element) => getComputedStyle(element).transform);
    await expect(
      page.getByRole("button", { name: "Resume background animation" }),
    ).toBeFocused();
    await expect(lights.first()).toHaveCSS("transform", pausedTransform);
    await page
      .getByRole("button", { name: "Resume background animation" })
      .click();
    await expect(hero.locator("[data-hero-backdrop]")).toHaveAttribute(
      "data-motion-enabled",
      "true",
    );
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(hero.locator("[data-hero-backdrop]")).toHaveAttribute(
      "data-motion-enabled",
      "false",
    );
    await hero.scrollIntoViewIfNeeded();
    await expect(hero.locator("[data-hero-backdrop]")).toHaveAttribute(
      "data-motion-enabled",
      "true",
    );
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
        () =>
          action.evaluate(
            (element) => getComputedStyle(element).backgroundColor,
          ),
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
    await expect(lights.first()).toHaveCSS("animation-name", "none");
    await expect(
      page.getByRole("button", { name: "Pause background animation" }),
    ).toHaveCount(0);
  });

  test("catalogue and contact pages expose labelled controls", async ({
    page,
  }) => {
    await page.goto("/blogs");
    await expect(
      page.getByRole("heading", {
        name: "Notes for better property decisions.",
      }),
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

  test("core public pages stay within the viewport at required widths", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    for (const width of [320, 375, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["/", "/properties", "/blogs"]) {
        await page.goto(route);
        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(
          dimensions.scrollWidth,
          `${route} at ${width}px`,
        ).toBeLessThanOrEqual(dimensions.clientWidth);
      }
    }
  });
});
