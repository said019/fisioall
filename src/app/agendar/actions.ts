"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const TENANT_SLUG = "kaya-kalp";

async function getTenantId() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) throw new Error("Tenant not found");
  return tenant.id;
}

// ─── BUSCAR PACIENTE POR TELÉFONO ──────────────────────────────────────────
export async function buscarPorTelefono(telefono: string) {
  const tenantId = await getTenantId();
  const clean = telefono.replace(/\D/g, "");

  if (clean.length < 10) return { error: "Ingresa un número de 10 dígitos" };

  const paciente = await prisma.paciente.findFirst({
    where: {
      tenantId,
      OR: [
        { telefono: { contains: clean.slice(-10) } },
        { whatsapp: { contains: clean.slice(-10) } },
      ],
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      telefono: true,
      email: true,
      fotoUrl: true,
      totalSesiones: true,
      fechaPrimeraCita: true,
    },
  });

  if (!paciente) return { notFound: true };

  return {
    paciente: {
      id: paciente.id,
      nombre: `${paciente.nombre} ${paciente.apellido}`,
      iniciales: `${paciente.nombre[0]}${paciente.apellido[0]}`.toUpperCase(),
      telefono: paciente.telefono,
      email: paciente.email,
      totalSesiones: paciente.totalSesiones ?? 0,
      miembroDesde: paciente.fechaPrimeraCita
        ? paciente.fechaPrimeraCita.toLocaleDateString("es-MX", { month: "long", year: "numeric" })
        : null,
    },
  };
}

// ─── REGISTRAR PACIENTE NUEVO ──────────────────────────────────────────────
export async function registrarPaciente(telefono: string, nombre: string, apellido: string, email?: string) {
  const tenantId = await getTenantId();
  const clean = telefono.replace(/\D/g, "").slice(-10);

  if (!nombre.trim() || !apellido.trim()) {
    return { error: "Nombre y apellido son obligatorios" };
  }
  if (clean.length < 10) {
    return { error: "Número de teléfono inválido" };
  }

  // Verificar que no exista ya
  const existe = await prisma.paciente.findFirst({
    where: { tenantId, telefono: { contains: clean } },
  });
  if (existe) {
    return { error: "Ya existe una cuenta con ese número" };
  }

  const paciente = await prisma.paciente.create({
    data: {
      tenantId,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: clean,
      email: email?.trim() || null,
      fechaPrimeraCita: new Date(),
    },
  });

  return {
    paciente: {
      id: paciente.id,
      nombre: `${paciente.nombre} ${paciente.apellido}`,
      iniciales: `${paciente.nombre[0]}${paciente.apellido[0]}`.toUpperCase(),
      telefono: paciente.telefono,
      email: paciente.email,
      totalSesiones: 0,
      miembroDesde: new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
    },
  };
}

// ─── OBTENER CITAS DEL PACIENTE ────────────────────────────────────────────
export async function getCitasPaciente(pacienteId: string) {
  const citas = await prisma.cita.findMany({
    where: { pacienteId },
    include: {
      fisioterapeuta: { select: { nombre: true, apellido: true } },
    },
    orderBy: { fechaHoraInicio: "desc" },
    take: 20,
  });

  const now = new Date();

  return citas.map((c) => ({
    id: c.id,
    tipoSesion: c.tipoSesion ?? "Sesión",
    fecha: c.fechaHoraInicio.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    hora: c.fechaHoraInicio.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    duracion: Math.round(
      (c.fechaHoraFin.getTime() - c.fechaHoraInicio.getTime()) / 60000
    ),
    fisioterapeuta: `${c.fisioterapeuta.nombre} ${c.fisioterapeuta.apellido}`,
    estado: c.estado ?? "agendada",
    sala: c.sala,
    esFutura: c.fechaHoraInicio > now,
    fechaISO: c.fechaHoraInicio.toISOString(),
  }));
}

// ─── OBTENER MEMBRESÍAS / TARJETAS DEL PACIENTE ───────────────────────────
export async function getMembresiasPaciente(pacienteId: string) {
  const membresias = await prisma.membresia.findMany({
    where: { pacienteId, estado: "activa" },
    include: {
      paquete: { select: { nombre: true, numSesiones: true } },
    },
  });

  return membresias.map((m) => ({
    id: m.id,
    paquete: m.paquete?.nombre ?? "Sesiones individuales",
    sesionesUsadas: m.sesionesUsadas ?? 0,
    sesionesTotal: m.sesionesTotal,
    estado: m.estado,
  }));
}

// ─── HORARIOS DISPONIBLES PARA UN DÍA ─────────────────────────────────────
export async function getHorariosDisponibles(fecha: string) {
  const tenantId = await getTenantId();
  const dia = new Date(fecha);
  const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
  const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  // Leer configuración del tenant
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const cfg = (tenant?.configuracion ?? {}) as Record<string, unknown>;

  // Horarios por día desde config
  const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const diaKey = diasSemana[dia.getDay()];
  const horariosConfig = (cfg.horarios as { diaKey: string; activo: boolean; inicio: string; fin: string }[]) ?? [];
  const horarioDia = horariosConfig.find((h) => h.diaKey === diaKey);

  // Si el día no está activo, retornar vacío
  if (horarioDia && !horarioDia.activo) return [];

  // Verificar si es un día bloqueado
  const diasBloqueados = (cfg.diasBloqueados as { fecha: string; motivo: string }[]) ?? [];
  const fechaISO = `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, "0")}-${String(dia.getDate()).padStart(2, "0")}`;
  if (diasBloqueados.some((d) => d.fecha === fechaISO)) return [];

  // Rango de atención del día (default 09:00-19:00)
  const atencionInicio = horarioDia ? parseInt(horarioDia.inicio.split(":")[0]) * 60 + parseInt(horarioDia.inicio.split(":")[1]) : 9 * 60;
  const atencionFin = horarioDia ? parseInt(horarioDia.fin.split(":")[0]) * 60 + parseInt(horarioDia.fin.split(":")[1]) : 19 * 60;

  // Hora de comida
  const comida = (cfg.comida as { activo: boolean; inicio: string; fin: string }) ?? { activo: false, inicio: "14:00", fin: "15:00" };
  const comidaInicio = comida.activo ? parseInt(comida.inicio.split(":")[0]) * 60 + parseInt(comida.inicio.split(":")[1]) : -1;
  const comidaFin = comida.activo ? parseInt(comida.fin.split(":")[0]) * 60 + parseInt(comida.fin.split(":")[1]) : -1;

  // Intervalo de slots (default 30 min)
  const intervalo = (cfg.intervaloSlots as number) ?? 30;

  // Citas ya ocupadas ese día
  const citasOcupadas = await prisma.cita.findMany({
    where: {
      tenantId,
      estado: { notIn: ["cancelada", "no_show"] },
      fechaHoraInicio: { gte: inicio, lt: fin },
    },
    select: { fechaHoraInicio: true, fechaHoraFin: true },
  });

  const horasOcupadas = citasOcupadas.map((c) => ({
    inicio: c.fechaHoraInicio.getHours() * 60 + c.fechaHoraInicio.getMinutes(),
    fin: c.fechaHoraFin.getHours() * 60 + c.fechaHoraFin.getMinutes(),
  }));

  // Also fetch Google Calendar events to block those slots
  let gcalOcupadas: { inicio: number; fin: number }[] = [];
  try {
    const { listCalendarEvents } = await import("@/lib/google-calendar");
    const gcalEvents = await listCalendarEvents(tenantId, inicio, fin);
    gcalOcupadas = gcalEvents.map((e) => ({
      inicio: e.start.getHours() * 60 + e.start.getMinutes(),
      fin: e.end.getHours() * 60 + e.end.getMinutes(),
    }));
  } catch {
    // Google Calendar not connected or error — continue without it
  }

  const todasOcupadas = [...horasOcupadas, ...gcalOcupadas];

  // Generar slots según config
  const slots: { hora: string; disponible: boolean }[] = [];
  for (let m = atencionInicio; m < atencionFin; m += intervalo) {
    // Saltar hora de comida
    if (comida.activo && m >= comidaInicio && m < comidaFin) continue;

    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const min = String(m % 60).padStart(2, "0");
    const ocupado = todasOcupadas.some(
      (o) => m >= o.inicio && m < o.fin
    );
    slots.push({ hora: `${h}:${min}`, disponible: !ocupado });
  }

  return slots;
}

// ─── OBTENER FISIOTERAPEUTAS ───────────────────────────────────────────────
export async function getFisioterapeutasPublic() {
  const tenantId = await getTenantId();

  const fisios = await prisma.usuario.findMany({
    where: { tenantId, activo: true },
    select: { id: true, nombre: true, apellido: true, especialidades: true },
    orderBy: { nombre: "asc" },
  });

  return fisios.map((f) => ({
    id: f.id,
    nombre: `${f.nombre} ${f.apellido}`,
    especialidades: f.especialidades,
  }));
}

// ─── AGENDAR CITA (público) ───────────────────────────────────────────────
export async function agendarCitaPublica(prevState: unknown, formData: FormData) {
  const tenantId = await getTenantId();
  const pacienteId = formData.get("pacienteId") as string;
  const fecha = formData.get("fecha") as string;
  const horaInicio = formData.get("horaInicio") as string;
  const duracion = Number(formData.get("duracion") || 45);
  const tipoSesion = formData.get("tipoSesion") as string;
  const fisioterapeutaId = formData.get("fisioterapeutaId") as string;

  if (!pacienteId || !fecha || !horaInicio) {
    return { error: "Fecha y hora son obligatorios" };
  }

  // Si no se elige fisio, asignar al admin
  let fisioId = fisioterapeutaId;
  if (!fisioId) {
    const admin = await prisma.usuario.findFirst({
      where: { tenantId, rol: "admin" },
    });
    fisioId = admin?.id ?? "";
  }

  try {
    const fechaHoraInicio = new Date(`${fecha}T${horaInicio}:00`);
    const fechaHoraFin = new Date(fechaHoraInicio.getTime() + duracion * 60 * 1000);

    // Verificar que no esté ocupado
    const conflicto = await prisma.cita.findFirst({
      where: {
        tenantId,
        estado: { notIn: ["cancelada", "no_show"] },
        fechaHoraInicio: { lt: fechaHoraFin },
        fechaHoraFin: { gt: fechaHoraInicio },
      },
    });

    if (conflicto) {
      return { error: "Ese horario ya no está disponible. Elige otro." };
    }

    const cita = await prisma.cita.create({
      data: {
        tenantId,
        fisioterapeutaId: fisioId,
        pacienteId,
        fechaHoraInicio,
        fechaHoraFin,
        tipoSesion: tipoSesion || "Sesión",
        createdBy: fisioId,
      },
    });

    // Sync to Google Calendar (best-effort, non-blocking)
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
        tipoSesion: tipoSesion || "Sesión",
      });
      if (googleEventId) {
        await prisma.cita.update({ where: { id: cita.id }, data: { googleEventId } });
      }
    } catch (gcalErr) {
      console.error("[GCal] Sync error on create:", gcalErr);
    }

    revalidatePath("/agendar");
    return { success: true };
  } catch (error) {
    console.error("Error booking:", error);
    return { error: "Error al agendar. Intenta de nuevo." };
  }
}

// ─── CANCELAR CITA (público) ──────────────────────────────────────────────
export async function cancelarCitaPublica(citaId: string, pacienteId: string) {
  try {
    const cita = await prisma.cita.findFirst({
      where: { id: citaId, pacienteId },
    });

    if (!cita) return { error: "Cita no encontrada" };

    // Solo se puede cancelar citas futuras
    if (cita.fechaHoraInicio < new Date()) {
      return { error: "No se puede cancelar una cita pasada" };
    }

    await prisma.cita.update({
      where: { id: citaId },
      data: { estado: "cancelada" },
    });

    // Delete Google Calendar event (best-effort)
    if (cita.googleEventId) {
      try {
        const { deleteCalendarEvent } = await import("@/lib/google-calendar");
        await deleteCalendarEvent(cita.tenantId, cita.googleEventId);
      } catch (gcalErr) {
        console.error("[GCal] Sync error on cancel:", gcalErr);
      }
    }

    revalidatePath("/agendar");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling:", error);
    return { error: "Error al cancelar. Intenta de nuevo." };
  }
}

// ─── OBTENER TARJETAS DE LEALTAD DEL PACIENTE ────────────────────────────
export async function getTarjetasPaciente(pacienteId: string) {
  const tarjetas = await prisma.tarjetaLealtad.findMany({
    where: { pacienteId, estado: { in: ["activa", "completada"] } },
    orderBy: { updatedAt: "desc" },
  });

  return tarjetas.map((t) => {
    const usados = t.sellosUsados;
    const totales = t.sellosTotal;
    const sellos = Array.from({ length: totales }, (_, i) => i < usados);

    let estado: string = t.estado;
    if (estado === "activa" && usados >= totales) estado = "completada";

    return {
      id: t.id,
      sellosTotal: totales,
      sellosUsados: usados,
      estado,
      sellos,
      recompensa: t.recompensa,
    };
  });
}
