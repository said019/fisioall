import { prisma } from "@/lib/prisma";
import { buildICS, type ICSEvent } from "@/lib/ics";

// Feed suscribible de todas las citas del usuario (admin/fisio).
// URL: /api/calendar/feed/{tokenCalendar}/ics
// Se suscribe en Apple Calendar / Google Calendar con webcal://.
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;

  if (!token) return new Response("Token requerido", { status: 400 });

  const user = await prisma.usuario.findUnique({
    where: { tokenCalendar: token },
    select: { id: true, tenantId: true, nombre: true, apellido: true, rol: true, email: true },
  });

  if (!user) return new Response("Token inválido", { status: 404 });

  // Rango: últimas 4 semanas + próximos 6 meses
  const hoy = new Date();
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 28);
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 6, hoy.getDate());

  // Admin ve todas las citas del tenant; fisio solo las suyas
  const whereClause =
    user.rol === "admin"
      ? { tenantId: user.tenantId, fechaHoraInicio: { gte: desde, lte: hasta } }
      : {
          tenantId: user.tenantId,
          fisioterapeutaId: user.id,
          fechaHoraInicio: { gte: desde, lte: hasta },
        };

  const citas = await prisma.cita.findMany({
    where: whereClause,
    include: {
      paciente: { select: { nombre: true, apellido: true, telefono: true } },
      fisioterapeuta: { select: { nombre: true, apellido: true, email: true } },
    },
    orderBy: { fechaHoraInicio: "asc" },
  });

  const events: ICSEvent[] = citas.map((c) => ({
    uid: `cita-${c.id}@kayakalp.com.mx`,
    summary: `${c.tipoSesion ?? "Sesión"} — ${c.paciente.nombre} ${c.paciente.apellido}`,
    description: [
      `Paciente: ${c.paciente.nombre} ${c.paciente.apellido}`,
      c.paciente.telefono ? `Tel: ${c.paciente.telefono}` : null,
      `Fisioterapeuta: ${c.fisioterapeuta.nombre} ${c.fisioterapeuta.apellido}`,
      c.sala ? `Sala: ${c.sala}` : null,
      `Estado: ${c.estado ?? "agendada"}`,
    ]
      .filter(Boolean)
      .join("\n"),
    location: "Av. María No. 25, San Juan del Río, Qro.",
    start: c.fechaHoraInicio,
    end: c.fechaHoraFin,
    organizerName: "Kaya Kalp",
    organizerEmail: c.fisioterapeuta.email ?? "agenda@kayakalp.com.mx",
    status: c.estado === "cancelada" || c.estado === "no_show" ? "CANCELLED" : "CONFIRMED",
  }));

  const ics = buildICS(events, `Kaya Kalp — ${user.nombre} ${user.apellido}`);

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300", // 5 min — Apple refresca según su política
    },
  });
}
