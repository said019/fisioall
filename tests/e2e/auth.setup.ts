import { test as setup, expect } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/login");

  // Fill login form (defaults are pre-filled but we set explicitly)
  await page.getByLabel("Correo Electrónico").fill("doctor@clinica.com");
  await page.getByLabel("Contraseña").fill("password123");

  // Submit
  await page.getByRole("button", { name: "Entrar al Dashboard" }).click();

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
  await expect(page).toHaveURL(/dashboard/);

  // Save auth state
  await page.context().storageState({ path: AUTH_FILE });
});
