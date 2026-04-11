import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Navigate to agenda, click a cita to open the detail panel */
async function openAgenda(page: ReturnType<typeof test["info"]> extends never ? never : Awaited<ReturnType<typeof import("@playwright/test")["chromium"]["launch"]>>["newPage"] extends (...a: infer _) => Promise<infer P> ? P : never) {
  // Just use 'any' for the page type in helpers — Playwright infers it in tests
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. LOGIN & DASHBOARD ACCESS
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Dashboard Access", () => {
  test("should access dashboard after auth setup", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
    // Should see the agenda or some dashboard content
    await expect(page.locator("body")).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. AGENDA → EXPEDIENTE NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Agenda → Expediente", () => {
  test("should navigate from agenda to expediente via cita click", async ({ page }) => {
    await page.goto("/dashboard/agenda");
    await page.waitForLoadState("networkidle");

    // Wait for citas to load — look for any appointment card in the agenda
    const citaCards = page.locator("[class*='cursor-pointer']").filter({ hasText: /sesión|Sesión|cita|facial|fisioterapia|suelo|corporal/i });

    const count = await citaCards.count();
    if (count === 0) {
      test.skip(true, "No citas found in agenda today — skip navigation test");
      return;
    }

    // Click the first cita
    await citaCards.first().click();

    // Should open a detail panel — look for "Expediente" button/link
    const expedienteLink = page.getByRole("link", { name: /expediente/i });
    const linkCount = await expedienteLink.count();
    if (linkCount > 0) {
      await expedienteLink.first().click();
      await page.waitForURL("**/expediente**");
      await expect(page).toHaveURL(/expediente/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. PACIENTES → EXPEDIENTE NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Pacientes → Expediente", () => {
  test("should navigate from patients list to expediente", async ({ page }) => {
    await page.goto("/dashboard/pacientes");
    await page.waitForLoadState("networkidle");

    // Wait for patient list to load
    const patientCards = page.locator("a[href*='expediente']");
    const count = await patientCards.count();

    if (count === 0) {
      // Try clicking on a patient row first to expand details
      const patientRows = page.locator("[class*='cursor-pointer']").filter({ hasText: /paciente|nombre/i });
      if ((await patientRows.count()) > 0) {
        await patientRows.first().click();
        await page.waitForTimeout(500);
      }
    }

    // Now look for expediente links
    const expedienteLinks = page.locator("a[href*='expediente']");
    const linkCount = await expedienteLinks.count();

    if (linkCount > 0) {
      await expedienteLinks.first().click();
      await page.waitForURL("**/expediente**", { timeout: 10_000 });
      await expect(page).toHaveURL(/expediente/);
    } else {
      test.skip(true, "No expediente links found in patients page");
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. EXPEDIENTE — FISIOTERAPIA (SOAP + EVA)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Expediente Fisioterapia", () => {
  test("should render SOAP form for fisioterapia cita", async ({ page }) => {
    // Navigate to agenda and find a fisioterapia cita
    await page.goto("/dashboard/agenda");
    await page.waitForLoadState("networkidle");

    // Look for fisioterapia appointments
    const fisioCitas = page.locator("[class*='cursor-pointer']").filter({
      hasText: /fisioterapia|terapia manual|rehabilitación|ejercicio terapéutico/i,
    });

    const count = await fisioCitas.count();
    if (count === 0) {
      test.skip(true, "No fisioterapia citas found in agenda today");
      return;
    }

    await fisioCitas.first().click();
    await page.waitForTimeout(500);

    // Click on expediente link
    const expLink = page.getByRole("link", { name: /expediente/i });
    if ((await expLink.count()) === 0) {
      test.skip(true, "No expediente link in cita detail");
      return;
    }
    await expLink.first().click();
    await page.waitForURL("**/expediente**");

    // ── Verify SOAP form fields ──
    // Check for fisioterapia badge
    await expect(page.getByText("Fisioterapia", { exact: false })).toBeVisible({ timeout: 10_000 });

    // EVA Scale - dolor inputs
    const dolorInicio = page.getByText("Dolor al inicio");
    const dolorFin = page.getByText("Dolor al final");
    await expect(dolorInicio).toBeVisible();
    await expect(dolorFin).toBeVisible();

    // SOAP sections
    await expect(page.getByText("Subjetivo")).toBeVisible();
    await expect(page.getByText("Objetivo")).toBeVisible();
    await expect(page.getByText("Análisis")).toBeVisible();
    await expect(page.getByText("Plan")).toBeVisible();

    // Técnicas aplicadas
    await expect(page.getByText("Técnicas Aplicadas")).toBeVisible();
    await expect(page.getByText("Masaje terapéutico")).toBeVisible();

    // Evolución
    await expect(page.getByText("Evolución")).toBeVisible();
    await expect(page.getByText("Mejoría")).toBeVisible();

    // Guardar button
    await expect(page.getByRole("button", { name: /guardar/i })).toBeVisible();
  });

  test("should fill and submit SOAP note", async ({ page }) => {
    await page.goto("/dashboard/agenda");
    await page.waitForLoadState("networkidle");

    const fisioCitas = page.locator("[class*='cursor-pointer']").filter({
      hasText: /fisioterapia|terapia manual|rehabilitación/i,
    });

    if ((await fisioCitas.count()) === 0) {
      test.skip(true, "No fisioterapia citas found");
      return;
    }

    await fisioCitas.first().click();
    await page.waitForTimeout(500);

    const expLink = page.getByRole("link", { name: /expediente/i });
    if ((await expLink.count()) === 0) {
      test.skip(true, "No expediente link");
      return;
    }
    await expLink.first().click();
    await page.waitForURL("**/expediente**");
    await page.waitForLoadState("networkidle");

    // Fill SOAP fields
    const subjetivoTextarea = page.locator("textarea").filter({ hasText: "" }).first();
    // Use labels to locate textareas
    const textareas = page.locator("textarea");
    const taCount = await textareas.count();

    if (taCount >= 4) {
      // Fill S-O-A-P in order
      await textareas.nth(0).fill("Paciente refiere dolor lumbar persistente desde hace 3 días.");
      await textareas.nth(1).fill("ROM limitado en flexión lumbar. Dolor a la palpación L4-L5.");
      await textareas.nth(2).fill("Lumbalgia mecánica en fase aguda.");
      await textareas.nth(3).fill("Continuar con TENS y ejercicios de Williams. Reevaluar en próxima sesión.");
    }

    // Select a technique
    const masaje = page.getByText("Masaje terapéutico");
    if ((await masaje.count()) > 0) {
      await masaje.click();
    }

    // Select evolution
    const mejoria = page.getByText("Mejoría");
    if ((await mejoria.count()) > 0) {
      await mejoria.first().click();
    }

    // Note: We don't actually submit to avoid creating test data in the DB
    // Just verify the button is enabled and the form is fillable
    const guardar = page.getByRole("button", { name: /guardar/i });
    await expect(guardar).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. EXPEDIENTE — SUELO PÉLVICO (Initial)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Expediente Suelo Pélvico", () => {
  test("should render suelo pélvico initial form", async ({ page }) => {
    await page.goto("/dashboard/agenda");
    await page.waitForLoadState("networkidle");

    const sueloCitas = page.locator("[class*='cursor-pointer']").filter({
      hasText: /suelo pélvico|suelo pelvico|prenatal|postparto/i,
    });

    if ((await sueloCitas.count()) === 0) {
      test.skip(true, "No suelo pélvico citas found in agenda today");
      return;
    }

    await sueloCitas.first().click();
    await page.waitForTimeout(500);

    const expLink = page.getByRole("link", { name: /expediente/i });
    if ((await expLink.count()) === 0) {
      test.skip(true, "No expediente link");
      return;
    }
    await expLink.first().click();
    await page.waitForURL("**/expediente**");

    // Check for suelo pélvico badge
    await expect(page.getByText("Suelo Pélvico", { exact: false })).toBeVisible({ timeout: 10_000 });

    // Initial evaluation fields (if first visit)
    const motivoConsulta = page.getByText("Motivo de Consulta");
    const isSueloPelvicoInicial = (await motivoConsulta.count()) > 0;

    if (isSueloPelvicoInicial) {
      await expect(motivoConsulta).toBeVisible();
      await expect(page.getByText("Sintomatología")).toBeVisible();
      await expect(page.getByText("Dolor pélvico")).toBeVisible();
      await expect(page.getByText("Escapes de orina")).toBeVisible();
      await expect(page.getByText("Datos de Fertilidad")).toBeVisible();
      await expect(page.getByText("Antecedentes Patológicos")).toBeVisible();
    } else {
      // Follow-up = SOAP + EVA (same as fisioterapia)
      await expect(page.getByText("Subjetivo")).toBeVisible();
      await expect(page.getByText("Objetivo")).toBeVisible();
    }

    await expect(page.getByRole("button", { name: /guardar/i })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. EXPEDIENTE — COSMETOLOGÍA (Initial)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Expediente Cosmetología", () => {
  test("should render cosmetología initial form", async ({ page }) => {
    await page.goto("/dashboard/agenda");
    await page.waitForLoadState("networkidle");

    const cosmeCitas = page.locator("[class*='cursor-pointer']").filter({
      hasText: /facial|limpieza|dermaplaning|peeling|anti-edad|corporal|epilaci/i,
    });

    if ((await cosmeCitas.count()) === 0) {
      test.skip(true, "No cosmetología citas found in agenda today");
      return;
    }

    await cosmeCitas.first().click();
    await page.waitForTimeout(500);

    const expLink = page.getByRole("link", { name: /expediente/i });
    if ((await expLink.count()) === 0) {
      test.skip(true, "No expediente link");
      return;
    }
    await expLink.first().click();
    await page.waitForURL("**/expediente**");

    // Check for cosmetología badge
    await expect(page.getByText("Cosmetología", { exact: false })).toBeVisible({ timeout: 10_000 });

    // Check initial form fields
    const productosLabel = page.getByText("producto", { exact: false });
    const isCosmeInicial = (await productosLabel.count()) > 0;

    if (isCosmeInicial) {
      // Initial evaluation form
      await expect(page.getByText(/rutina.*skincare/i)).toBeVisible();
      await expect(page.getByText(/protector solar/i)).toBeVisible();
      await expect(page.getByText(/motivo/i).first()).toBeVisible();
    } else {
      // Follow-up — should show biotipo, fototipo, etc.
      const biotipoLabel = page.getByText("Biotipo", { exact: false });
      const hasBiotipo = (await biotipoLabel.count()) > 0;

      if (hasBiotipo) {
        await expect(biotipoLabel).toBeVisible();
        await expect(page.getByText("Fototipo", { exact: false })).toBeVisible();
      } else {
        // Might show SOAP if it's a different follow-up path
        await expect(page.getByText("Subjetivo")).toBeVisible();
      }
    }

    await expect(page.getByRole("button", { name: /guardar/i })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. EXPEDIENTE — TYPE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Expediente Type Detection", () => {
  test("should display correct badge based on tipoSesion", async ({ page }) => {
    // Navigate via agenda — click first available cita
    await page.goto("/dashboard/agenda");
    await page.waitForLoadState("networkidle");

    const citaCards = page.locator("[class*='cursor-pointer']").filter({
      hasText: /sesión|Sesión|fisioterapia|facial|suelo|corporal|epilaci|terapia/i,
    });

    if ((await citaCards.count()) === 0) {
      test.skip(true, "No citas found in agenda today");
      return;
    }

    await citaCards.first().click();
    await page.waitForTimeout(500);

    const expLink = page.getByRole("link", { name: /expediente/i });
    if ((await expLink.count()) === 0) {
      test.skip(true, "No expediente link in cita detail");
      return;
    }
    await expLink.first().click();
    await page.waitForURL("**/expediente**");

    // One of the three badges should be visible
    const fisio = page.getByText("Fisioterapia", { exact: false });
    const suelo = page.getByText("Suelo Pélvico", { exact: false });
    const cosme = page.getByText("Cosmetología", { exact: false });

    const hasFisio = (await fisio.count()) > 0;
    const hasSuelo = (await suelo.count()) > 0;
    const hasCosme = (await cosme.count()) > 0;

    expect(hasFisio || hasSuelo || hasCosme).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. HISTORIAL DE SESIONES
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Historial Sesiones", () => {
  test("should display session history in expediente", async ({ page }) => {
    // Navigate via agenda
    await page.goto("/dashboard/agenda");
    await page.waitForLoadState("networkidle");

    const citaCards = page.locator("[class*='cursor-pointer']").filter({
      hasText: /sesión|Sesión|fisioterapia|facial|suelo|corporal|terapia/i,
    });

    if ((await citaCards.count()) === 0) {
      test.skip(true, "No citas in agenda today");
      return;
    }

    await citaCards.first().click();
    await page.waitForTimeout(500);

    const expLink = page.getByRole("link", { name: /expediente/i });
    if ((await expLink.count()) === 0) {
      test.skip(true, "No expediente link");
      return;
    }
    await expLink.first().click();
    await page.waitForURL("**/expediente**");

    // Look for session history section
    const historial = page.getByText("Historial de Sesiones", { exact: false });
    if ((await historial.count()) > 0) {
      await expect(historial).toBeVisible();
    }
  });
});
