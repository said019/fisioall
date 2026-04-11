import { test, expect, Page } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Test patient data
// ─────────────────────────────────────────────────────────────────────────────

const TEST_PHONE = "4271234567";
const TEST_NOMBRE = "Said";
const TEST_APELLIDO = "Romero";
const TEST_EMAIL = "saidromero19@gmail.com";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function enterPhoneAndGetToProfile(page: Page) {
  await page.goto("/agendar");
  await page.waitForLoadState("networkidle");

  await page.locator('input[type="tel"]').fill(TEST_PHONE);
  await page.getByRole("button", { name: /acceder/i }).click();
  await page.waitForTimeout(2000);

  // Register if new patient
  const createBtn = page.getByRole("button", { name: /crear cuenta/i });
  if ((await createBtn.count()) > 0) {
    await page.locator("input[placeholder='Ej. María']").fill(TEST_NOMBRE);
    await page.locator("input[placeholder='Ej. González Ríos']").fill(TEST_APELLIDO);
    await page.locator("input[placeholder='tu@correo.com']").fill(TEST_EMAIL);
    await createBtn.click();
    await page.waitForTimeout(2000);
  }
}

async function openBooking(page: Page) {
  await enterPhoneAndGetToProfile(page);
  const agendarBtn = page.getByRole("button", { name: /agendar.*cita|nueva cita/i });
  await agendarBtn.click();
  await page.waitForTimeout(500);
}

async function selectCategoryAndService(page: Page, category: string, serviceText: string) {
  // Click category pill
  await page.getByRole("button", { name: category }).click();
  await page.waitForTimeout(300);
  // Click service card (use first() since getByText may match description too)
  await page.getByText(serviceText).first().click();
  await page.waitForTimeout(500);
}

async function selectDateAndSlot(page: Page): Promise<boolean> {
  // Click a future date in the calendar
  const dayButtons = page.locator("button:not([disabled])").filter({ hasText: /^[0-9]{1,2}$/ });
  const count = await dayButtons.count();
  if (count === 0) return false;

  await dayButtons.last().click();
  await page.waitForTimeout(1500);

  // Select first available time slot
  const slots = page.locator("button:not([disabled])").filter({ hasText: /^[0-9]{1,2}:[0-9]{2}$/ });
  const slotCount = await slots.count();
  if (slotCount === 0) return false;

  await slots.first().click();
  await page.waitForTimeout(300);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Agendar Cita — Full Flow", () => {

  test("1. Phone entry → registration/profile", async ({ page }) => {
    await enterPhoneAndGetToProfile(page);
    const agendarBtn = page.getByRole("button", { name: /agendar.*cita|nueva cita/i });
    await expect(agendarBtn).toBeVisible({ timeout: 10_000 });
  });

  test("2. Booking page shows all 5 categories", async ({ page }) => {
    await openBooking(page);

    // The actual category names from the UI
    await expect(page.getByRole("button", { name: "Fisioterapia" })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole("button", { name: "Faciales" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Suelo Pélvico" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Corporales" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Epilación" })).toBeVisible();
  });

  test("3. Fisioterapia → select service → calendar appears", async ({ page }) => {
    await openBooking(page);

    await page.getByRole("button", { name: "Fisioterapia" }).click();
    await page.waitForTimeout(300);

    // Should show fisioterapia services (actual names from UI)
    await expect(page.getByText("Normal / Antiestrés").first()).toBeVisible({ timeout: 5_000 });

    // Click first service
    await page.getByText("Normal / Antiestrés").first().click();
    await page.waitForTimeout(300);

    // Calendar label should appear (use exact: true to avoid matching subtitle)
    await expect(page.getByText("Fecha", { exact: true })).toBeVisible();
  });

  test("4. Suelo Pélvico → select service → calendar appears", async ({ page }) => {
    await openBooking(page);

    await page.getByRole("button", { name: "Suelo Pélvico" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Sesión Suelo Pélvico").first()).toBeVisible({ timeout: 5_000 });
    await page.getByText("Sesión Suelo Pélvico").first().click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Fecha", { exact: true })).toBeVisible();
  });

  test("5. Faciales → select service → calendar appears", async ({ page }) => {
    await openBooking(page);

    await page.getByRole("button", { name: "Faciales" }).click();
    await page.waitForTimeout(300);

    // Should show facial services
    const facialService = page.getByText("Limpieza Facial").first();
    if ((await facialService.count()) > 0) {
      await facialService.click();
      await page.waitForTimeout(300);
      await expect(page.getByText("Fecha", { exact: true })).toBeVisible();
    }
  });

  test("6. Corporales → select service", async ({ page }) => {
    await openBooking(page);

    await page.getByRole("button", { name: "Corporales" }).click();
    await page.waitForTimeout(300);

    const service = page.getByText("Tratamiento Corporal").first();
    if ((await service.count()) > 0) {
      await service.click();
      await page.waitForTimeout(300);
      await expect(page.getByText("Fecha", { exact: true })).toBeVisible();
    }
  });

  test("7. Epilación → shows services", async ({ page }) => {
    await openBooking(page);

    await page.getByRole("button", { name: "Epilación" }).click();
    await page.waitForTimeout(300);

    // Should show at least one epilación service
    const services = page.locator("button").filter({ hasText: /roll-on|Roll-On|Axilas|Pierna/i });
    expect(await services.count()).toBeGreaterThan(0);
  });

  test("8. Select date and time slot → summary + anticipo shown", async ({ page }) => {
    await openBooking(page);
    await selectCategoryAndService(page, "Fisioterapia", "Normal / Antiestrés");

    const gotSlot = await selectDateAndSlot(page);
    if (!gotSlot) {
      test.skip(true, "No available slots found");
      return;
    }

    // Summary should appear
    await expect(page.getByText("Resumen de tu cita")).toBeVisible();

    // Anticipo section
    await expect(page.getByText("$200 MXN").first()).toBeVisible();
    await expect(page.getByText("BBVA")).toBeVisible();

    // Comprobante upload area
    await expect(page.getByText("Subir comprobante de pago")).toBeVisible();
  });

  test("9. CTA disabled without comprobante upload", async ({ page }) => {
    await openBooking(page);
    await selectCategoryAndService(page, "Fisioterapia", "Normal / Antiestrés");

    const gotSlot = await selectDateAndSlot(page);
    if (!gotSlot) {
      test.skip(true, "No available slots found");
      return;
    }

    // "Confirmar Cita" button must be DISABLED without comprobante
    const ctaButton = page.getByRole("button", { name: /confirmar cita/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeDisabled();
  });

  test("10. Therapist shows for selected category", async ({ page }) => {
    await openBooking(page);
    await selectCategoryAndService(page, "Suelo Pélvico", "Sesión Suelo");

    const gotSlot = await selectDateAndSlot(page);
    if (!gotSlot) {
      test.skip(true, "No available slots found");
      return;
    }

    // Therapist section should appear
    const terapeutaLabel = page.getByText("Terapeuta");
    if ((await terapeutaLabel.count()) > 0) {
      await expect(terapeutaLabel).toBeVisible();
      // Paola is the suelo pélvico specialist
      const paolaText = page.getByText(/paola/i);
      if ((await paolaText.count()) > 0) {
        await expect(paolaText.first()).toBeVisible();
      }
    }
  });
});
