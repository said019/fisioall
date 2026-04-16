import { runRecordatorios } from "@/lib/cron-jobs";

// Endpoint público — la lógica es idempotente (recordatorioEnviado evita duplicados).
// El cron real corre en process via src/lib/scheduler.ts.
export async function GET() {
  const result = await runRecordatorios();
  return Response.json(result);
}
