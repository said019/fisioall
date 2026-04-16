import cron from "node-cron";
import { runRecordatorios, runAnticipos } from "@/lib/cron-jobs";

let started = false;

export function startScheduler() {
  if (started) return;
  started = true;

  console.log("[Scheduler] Iniciando jobs...");

  // Recordatorios diarios — 15:00 UTC = 9:00 AM CDMX
  cron.schedule(
    "0 15 * * *",
    async () => {
      const t0 = Date.now();
      console.log("[Scheduler] runRecordatorios — inicio");
      try {
        const result = await runRecordatorios();
        console.log("[Scheduler] runRecordatorios — fin", result, `(${Date.now() - t0}ms)`);
      } catch (err) {
        console.error("[Scheduler] runRecordatorios — error", err);
      }
    },
    { timezone: "UTC" },
  );

  // Anticipos vencidos + recordatorio 12h — cada hora en punto
  cron.schedule(
    "0 * * * *",
    async () => {
      const t0 = Date.now();
      console.log("[Scheduler] runAnticipos — inicio");
      try {
        const result = await runAnticipos();
        console.log("[Scheduler] runAnticipos — fin", result, `(${Date.now() - t0}ms)`);
      } catch (err) {
        console.error("[Scheduler] runAnticipos — error", err);
      }
    },
    { timezone: "UTC" },
  );

  console.log("[Scheduler] Jobs registrados:");
  console.log("  - Recordatorios: 0 15 * * * UTC (9:00 AM CDMX)");
  console.log("  - Anticipos:     0 * * * * UTC (cada hora)");
}
