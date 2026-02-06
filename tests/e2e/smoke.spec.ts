import { test, expect } from "@playwright/test";

test("signin page renders", async ({ page }) => {
  await page.goto("/signin");
  await expect(
    page.getByRole("heading", { name: "Sign in to continue the session" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with GitHub" })
  ).toBeVisible();
});
