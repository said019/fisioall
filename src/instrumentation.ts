// Next.js instrumentation hook — corre una sola vez al arrancar el server.
// https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation

export async function register() {
  // Solo en runtime Node (no Edge) y solo en producción / dev start, no durante build
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.SKIP_SCHEDULER === "1") return;

  const { startScheduler } = await import("@/lib/scheduler");
  startScheduler();
}
