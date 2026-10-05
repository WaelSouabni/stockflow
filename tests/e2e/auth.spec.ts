import { expect, test } from "@playwright/test";

test("admin can sign in and reach the dashboard", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  await page.getByLabel("Email professionnel").fill("admin@stockflow.test");
  await page.getByLabel("Mot de passe").fill("StockFlow123!");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("a new company is onboarded and cannot see another tenant's product", async ({ page }) => {
  const unique = Date.now();
  await page.goto("/register");
  await page.getByLabel("Nom de l’entreprise").fill(`Tenant Test ${unique}`);
  await page.getByLabel("Votre nom").fill("Tenant Admin");
  await page.getByLabel("Email professionnel").fill(`tenant-${unique}@stockflow.test`);
  await page.getByLabel("Mot de passe").fill("StockFlow123!");
  await page.getByRole("button", { name: "Créer mon espace" }).click();

  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Nom de l’entreprise").fill(`Tenant Test ${unique}`);
  await page.getByLabel("Email professionnel").fill(`tenant-${unique}@stockflow.test`);
  await page.getByLabel("Adresse").fill("1 rue Test");
  await page.getByLabel("Ville").fill("Tunis");
  await page.getByLabel("Code postal").fill("1000");
  await page.getByLabel("Pays").fill("Tunisie");
  await page.getByRole("button", { name: "Terminer la configuration" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/products");
  await expect(page.getByText("Laptop Pro 14")).not.toBeVisible();
  await expect(page.getByText("LAP-001")).not.toBeVisible();
});
