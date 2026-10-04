import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`About and illustrative preview photography in ${theme}`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Your next place.A clearer way to find it.",
      { timeout: 30_000 },
    );
    await expect
      .poll(() =>
        page
          .locator('img[src*="villa.webp"]')
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
    await expect(
      page.getByText("Architecture inspiration · Stock photograph"),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
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
    await page.goto("/properties");
    const previewPhotos = page.getByText(
      "Preview listing · Illustrative photo",
      { exact: true },
    );
    await expect(previewPhotos).toHaveCount(5, { timeout: 30_000 });
    const cards = page.locator("article").filter({ has: previewPhotos });
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          card
            .locator("img")
            .evaluate(
              (image: HTMLImageElement) =>
                image.complete && image.naturalWidth > 0,
            ),
        )
        .toBe(true);
    }
    await page.goto("/properties/preview-3-bhk-villa-rent-saligrampura");
    await expect(
      page.getByText(
        /Preview listing · Illustrative stock photo, not the listed/,
      ),
    ).toBeVisible({ timeout: 30_000 });
  });
}
