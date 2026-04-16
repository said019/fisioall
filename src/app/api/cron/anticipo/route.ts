import { runAnticipos } from "@/lib/cron-jobs";

// Endpoint público — la lógica es idempotente.
// El cron real corre en process via src/lib/scheduler.ts.
export async function GET() {
  const result = await runAnticipos();
  return Response.json(result);
}
