import { expect, test } from "@playwright/test";

test("protected routes redirect unauthenticated users to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
