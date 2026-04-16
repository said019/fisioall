import { prisma } from "@/lib/prisma";
import { buildICS } from "@/lib/ics";

// Endpoint público: cualquier persona con el ID puede descargar el .ics.
// Los IDs son UUID v4 (no adivinable).
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const cita = await prisma.cita.findUnique({
    where: { id },
    include: {
      paciente: { select: { nombre: true, apellido: true } },
      fisioterapeuta: { select: { nombre: true, apellido: true, email: true } },
      tenant: { select: { nombre: true } },
    },
  });

  if (!cita) {
    return new Response("Cita no encontrada", { status: 404 });
  }

  const ics = buildICS([
    {
      uid: `cita-${cita.id}@kayakalp.com.mx`,
      summary: `${cita.tipoSesion ?? "Sesión"} — ${cita.paciente.nombre} ${cita.paciente.apellido}`,
      description: [
        `Paciente: ${cita.paciente.nombre} ${cita.paciente.apellido}`,
        `Fisioterapeuta: ${cita.fisioterapeuta.nombre} ${cita.fisioterapeuta.apellido}`,
        cita.sala ? `Sala: ${cita.sala}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      location: "Av. María No. 25, San Juan del Río, Qro.",
      start: cita.fechaHoraInicio,
      end: cita.fechaHoraFin,
      organizerName: cita.tenant?.nombre ?? "Kaya Kalp",
      organizerEmail: cita.fisioterapeuta.email ?? "agenda@kayakalp.com.mx",
      status: cita.estado === "cancelada" ? "CANCELLED" : "CONFIRMED",
    },
  ]);

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="cita-kaya-kalp.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
