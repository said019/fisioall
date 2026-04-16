import { runRecordatorios } from "@/lib/cron-jobs";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runRecordatorios();
  return Response.json(result);
}
