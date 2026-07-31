import { expect, test } from "@playwright/test";

test("signup moves from account details to OTP verification", async ({
  page,
}) => {
  await page.route("**/api/auth/sign-up", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: { email: "owner@example.com", status: "verification_required" },
      status: 200,
    });
  });
  await page.route("**/api/auth/verify-signup", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: { redirect: "/account/submissions", status: "verified" },
      status: 200,
    });
  });

  await page.goto("/sign-up");
  await page.getByLabel("Your name").fill("Asha Owner");
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Password", { exact: true }).fill("secure-pass");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("secure-pass");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(
    page.getByRole("heading", { name: "Enter your code." }),
  ).toBeVisible();
  await expect(page.getByText("owner@example.com")).toBeVisible();
  const digits = ["1", "2", "3", "4", "5", "6"];
  for (const [index, digit] of digits.entries()) {
    await page.getByLabel(`Verification digit ${index + 1}`).fill(digit);
  }
  await page.getByRole("button", { name: "Verify and create account" }).click();

  await expect(
    page.getByRole("heading", { name: "Account verified." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue to workspace" }),
  ).toBeVisible();
});
