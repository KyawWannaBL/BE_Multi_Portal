import { test, expect } from "@playwright/test";

test("login page renders", async ({ page }) => {
  await page.goto("/");
  // unauth → redirects to /login
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(/Britium/i)).toBeVisible();
});
