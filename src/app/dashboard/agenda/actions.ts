"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── FETCH CITAS FOR A WEEK ─────────────────────────────────────────────────
export async function getCitasSemana(fechaInicio: string, fechaFin: string) {
  const { tenantId } = await requireAuth();

  const citas = await prisma.cita.findMany({
    where: {
      tenantId,
      fechaHoraInicio: {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      },
    },
    include: {
      paciente: {
        select: { nombre: true, apellido: true, telefono: true },
      },
      fisioterapeuta: {
        select: { nombre: true, apellido: true, colorAgenda: true },
      },
      membresia: {
        select: { sesionesUsadas: true, sesionesTotal: true },
      },
    },
    orderBy: { fechaHoraInicio: "asc" },
  });

  return citas.map((c) => ({
    id: c.id,
    pacienteId: c.pacienteId,
    paciente: `${c.paciente.nombre} ${c.paciente.apellido}`,
    iniciales: `${c.paciente.nombre[0]}${c.paciente.apellido[0]}`.toUpperCase(),
    telefono: c.paciente.telefono,
    fisioterapeuta: `${c.fisioterapeuta.nombre} ${c.fisioterapeuta.apellido}`,
    colorFisio: c.fisioterapeuta.colorAgenda ?? "#4a7fa5",
    motivo: c.tipoSesion ?? "Sesión",
    fechaHoraInicio: c.fechaHoraInicio.toISOString(),
    fechaHoraFin: c.fechaHoraFin.toISOString(),
    estado: c.estado,
    sala: c.sala,
    numeroSesion: c.numeroSesion,
    sesion: c.membresia
      ? `${(c.membresia.sesionesUsadas ?? 0)}/${c.membresia.sesionesTotal}`
      : null,
  }));
}

// ─── FETCH CITAS FOR TODAY ───────────────────────────────────────────────────
export async function getCitasHoy() {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  return getCitasSemana(inicio.toISOString(), fin.toISOString());
}

// ─── CREATE CITA ─────────────────────────────────────────────────────────────
export async function crearCita(prevState: unknown, formData: FormData) {
  const { tenantId, userId } = await requireAuth();

  const pacienteId = formData.get("pacienteId") as string;
  const fisioterapeutaId = (formData.get("fisioterapeutaId") as string) || userId;
  const fecha = formData.get("fecha") as string;
  const horaInicio = formData.get("horaInicio") as string;
  const duracion = Number(formData.get("duracion") || 60);
  const tipoSesion = formData.get("tipoSesion") as string;
  const sala = formData.get("sala") as string;

  if (!pacienteId || !fecha || !horaInicio) {
    return { error: "Paciente, fecha y hora son obligatorios" };
  }

  try {
    // Append Mexico City offset (UTC-6, permanent since DST was abolished in 2022)
    const fechaHoraInicio = new Date(`${fecha}T${horaInicio}:00-06:00`);
    const fechaHoraFin = new Date(fechaHoraInicio.getTime() + duracion * 60 * 1000);

    const cita = await prisma.cita.create({
      data: {
        tenantId,
        fisioterapeutaId,
        pacienteId,
        fechaHoraInicio,
        fechaHoraFin,
        tipoSesion: tipoSesion || "Sesión de fisioterapia",
        sala: sala || null,
        createdBy: userId,
      },
    });

    // Sync to Google Calendar (best-effort)
    try {
      const { createCalendarEvent } = await import("@/lib/google-calendar");
      const pac = await prisma.paciente.findUnique({
        where: { id: pacienteId },
        select: { nombre: true, apellido: true, telefono: true },
      });
      const googleEventId = await createCalendarEvent(tenantId, {
        fechaHoraInicio,
        fechaHoraFin,
        pacienteNombre: `${pac?.nombre ?? ""} ${pac?.apellido ?? ""}`.trim(),
        pacienteTelefono: pac?.telefono ?? "",
        tipoSesion: tipoSesion || "Sesión de fisioterapia",
      });
      if (googleEventId) {
        await prisma.cita.update({ where: { id: cita.id }, data: { googleEventId } });
      }
    } catch (gcalErr) {
      console.error("[GCal] Sync error on admin create:", gcalErr);
    }

    // Crear pago de anticipo en estado pendiente
    const pagoPendiente = await prisma.pago.create({
      data: {
        tenantId,
        pacienteId,
        monto: 200,
        metodo: "transferencia",
        concepto: "Anticipo de sesión",
        estado: "pendiente",
        registradoPor: userId,
        fechaPago: new Date(),
        citaId: cita.id,
      },
    });

    // Marcar la cita con vencimiento de anticipo (24h)
    await prisma.cita.update({
      where: { id: cita.id },
      data: {
        estado: "pendiente_anticipo",
        anticipoVenceAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        anticipoPagoId: pagoPendiente.id,
      },
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { error: "Error al crear la cita. Intenta de nuevo." };
  }
}

// ─── UPDATE CITA STATUS ──────────────────────────────────────────────────────
export async function actualizarEstadoCita(
  citaId: string,
  estado: "agendada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_show" | "pendiente_anticipo"
) {
  const { tenantId } = await requireAuth();

  try {
    // Fetch cita first for GCal sync
    const cita = await prisma.cita.findFirst({
      where: { id: citaId, tenantId },
      select: { googleEventId: true, tenantId: true },
    });

    await prisma.cita.update({
      where: { id: citaId, tenantId },
      data: { estado },
    });

    // Delete Google Calendar event on cancel
    if ((estado === "cancelada" || estado === "no_show") && cita?.googleEventId) {
      try {
        const { deleteCalendarEvent } = await import("@/lib/google-calendar");
        await deleteCalendarEvent(cita.tenantId, cita.googleEventId);
      } catch (gcalErr) {
        console.error("[GCal] Sync error on status change:", gcalErr);
      }
    }

    // Auto-create NPS survey when cita is completed
    if (estado === "completada") {
      try {
        const { crearEncuesta } = await import("@/app/dashboard/encuestas/actions");
        await crearEncuesta(citaId);
      } catch (encErr) {
        console.error("[Encuesta] Auto-create failed:", encErr);
      }
    }

    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return { error: "Error al actualizar la cita." };
  }
}

// ─── GET FISIOTERAPEUTAS (for selectors) ─────────────────────────────────────
export async function getFisioterapeutas() {
  const { tenantId } = await requireAuth();

  const fisios = await prisma.usuario.findMany({
    where: { tenantId, activo: true },
    select: { id: true, nombre: true, apellido: true, rol: true, colorAgenda: true },
    orderBy: { nombre: "asc" },
  });

  return fisios.map((f) => ({
    id: f.id,
    nombre: `${f.nombre} ${f.apellido}`,
    iniciales: `${f.nombre[0]}${f.apellido[0]}`.toUpperCase(),
    rol: f.rol,
    colorAgenda: f.colorAgenda ?? "#4a7fa5",
  }));
}

// ─── GET PACIENTES LITE (for selectors) ──────────────────────────────────
export async function getPacientesLite() {
  const { tenantId } = await requireAuth();

  const pacientes = await prisma.paciente.findMany({
    where: { tenantId, activo: true },
    select: { id: true, nombre: true, apellido: true, telefono: true },
    orderBy: { nombre: "asc" },
  });

  return pacientes.map((p) => ({
    id: p.id,
    nombre: `${p.nombre} ${p.apellido}`,
    iniciales: `${p.nombre[0]}${p.apellido[0]}`.toUpperCase(),
    telefono: p.telefono,
  }));
}

// ─── CONFIRMAR ANTICIPO ──────────────────────────────────────────────────────
export async function confirmarAnticipo(citaId: string, metodo: string) {
  const { tenantId } = await requireAuth();

  const cita = await prisma.cita.findFirst({
    where: { id: citaId, tenantId },
    select: { anticipoPagoId: true, pacienteId: true },
  });

  if (!cita?.anticipoPagoId) return { error: "No hay anticipo registrado" };

  await prisma.$transaction([
    prisma.pago.update({
      where: { id: cita.anticipoPagoId },
      data: {
        estado: "pagado",
        metodo: metodo as "efectivo" | "transferencia" | "tarjeta_debito" | "tarjeta_credito" | "otro",
      },
    }),
    prisma.cita.update({
      where: { id: citaId },
      data: { estado: "confirmada", anticipoPagado: true },
    }),
    prisma.paciente.update({
      where: { id: cita.pacienteId },
      data: { anticipoSaldo: { increment: 200 } },
    }),
  ]);

  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── GET SLOTS DISPONIBLES (Feature 2) ───────────────────────────────────────
export async function getSlotsDisponibles(params: {
  fecha: string;
  fisioterapeutaId: string;
  tipoSesion: string;
  duracionMin?: number;
}) {
  const { tenantId } = await requireAuth();
  const { fecha, fisioterapeutaId, tipoSesion, duracionMin = 60 } = params; // 60 min = citas cada hora

  const fechaObj = new Date(fecha + "T00:00:00-06:00");
  const diaKey = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][fechaObj.getDay()];

  // 1. Obtener horario del terapeuta para ese día
  const horario = await prisma.horarioUsuario.findFirst({
    where: { tenantId, usuarioId: fisioterapeutaId, diaKey, activo: true },
  });
  if (!horario) return [];

  const franjas = horario.franjas as { inicio: string; fin: string }[];

  // 2. Obtener cubículo preferido para el tipo de sesión
  const cubiculoConfig = await prisma.cubiculoUsuario.findFirst({
    where: { tenantId, usuarioId: fisioterapeutaId, tipoSesion },
  });
  const cubiculosPref = cubiculoConfig?.cubiculoPref ?? [1];

  // 3. Obtener citas ocupadas ese día (Mexico City UTC-6)
  const inicioDia = new Date(fecha + "T00:00:00-06:00");
  const finDia = new Date(fecha + "T23:59:59-06:00");

  const citasOcupadas = await prisma.cita.findMany({
    where: {
      tenantId,
      fechaHoraInicio: { gte: inicioDia, lte: finDia },
      estado: { notIn: ["cancelada"] },
    },
    select: { fechaHoraInicio: true, fechaHoraFin: true, sala: true },
  });

  // 4. Generar slots dentro de las franjas
  const slots: { hora: string; cubiculo: number; disponible: boolean }[] = [];

  for (const franja of franjas) {
    const [hIni, mIni] = franja.inicio.split(":").map(Number);
    const [hFin, mFin] = franja.fin.split(":").map(Number);
    let minutos = hIni * 60 + mIni;
    const finMinutos = hFin * 60 + mFin;

    while (minutos + duracionMin <= finMinutos) {
      const slotIni = new Date(fecha + "T00:00:00-06:00");
      slotIni.setMinutes(slotIni.getMinutes() + minutos);
      const slotFin = new Date(slotIni.getTime() + duracionMin * 60 * 1000);

      let cubiculoLibre: number | null = null;
      for (const cubId of cubiculosPref) {
        const cubiculoStr = `Cubículo ${cubId}`;
        const ocupado = citasOcupadas.some(
          (c) =>
            c.sala === cubiculoStr &&
            c.fechaHoraInicio < slotFin &&
            c.fechaHoraFin > slotIni
        );
        if (!ocupado) {
          cubiculoLibre = cubId;
          break;
        }
      }

      const hora = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
      slots.push({ hora, cubiculo: cubiculoLibre ?? 0, disponible: cubiculoLibre !== null });
      minutos += duracionMin;
    }
  }

  return slots.filter((s) => s.disponible);
}
