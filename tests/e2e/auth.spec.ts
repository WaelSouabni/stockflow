import { expect, test } from "@playwright/test";

test("admin can sign in and reach the dashboard", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  await page.getByPlaceholder("Email").fill("admin@stockflow.test");
  await page.getByPlaceholder("Mot de passe").fill("StockFlow123!");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});
