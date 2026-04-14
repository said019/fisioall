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

// ─── OBTENER CONFIG DE HORARIOS (para el calendario público) ─────────────
// Calcula los días inactivos basándose en los HorarioUsuario reales.
// Si se pasa un fisioId, solo revisa los días de ese terapeuta.
// Si se pasa una especialidad (sin fisioId), une los días de todos los
// terapeutas con esa especialidad. Un día está activo si AL MENOS un
// terapeuta tiene franjas ese día.
export async function getScheduleConfig(fisioId?: string, especialidad?: string) {
  const tenantId = await getTenantId();

  // Días bloqueados del tenant
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const cfg = (tenant?.configuracion ?? {}) as Record<string, unknown>;
  const diasBloqueados = (cfg.diasBloqueados as { fecha: string; motivo: string }[]) ?? [];

  // Determinar qué usuarios considerar
  let usuarioIds: string[] = [];
  if (fisioId) {
    usuarioIds = [fisioId];
  } else if (especialidad) {
    const fisios = await prisma.usuario.findMany({
      where: { tenantId, activo: true, especialidades: { has: especialidad } },
      select: { id: true },
    });
    usuarioIds = fisios.map((f) => f.id);
  } else {
    const fisios = await prisma.usuario.findMany({
      where: { tenantId, activo: true },
      select: { id: true },
    });
    usuarioIds = fisios.map((f) => f.id);
  }

  // Obtener todos los HorarioUsuario activos de esos usuarios
  const horarios = await prisma.horarioUsuario.findMany({
    where: { tenantId, usuarioId: { in: usuarioIds }, activo: true },
    select: { diaKey: true },
  });

  const diasSemanaMap: Record<string, number> = {
    domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
  };

  // Días que tienen al menos un horario activo
  const diasActivos = new Set(horarios.map((h) => diasSemanaMap[h.diaKey]).filter((n) => n !== undefined));

  // Todos los días de la semana que NO tienen horario → inactivos
  const diasInactivos = [0, 1, 2, 3, 4, 5, 6].filter((d) => !diasActivos.has(d));

  return {
    diasInactivos,
    diasBloqueados: diasBloqueados.map((d) => d.fecha),
  };
}

// ─── HORARIOS DISPONIBLES PARA UN DÍA ─────────────────────────────────────
// Genera slots basándose en los HorarioUsuario (franjas) de los terapeutas.
// Las franjas ya tienen las horas de comida excluidas implícitamente:
//   Pao: L 16-19, M-J 10-12 y 16-19, V 10-13
//   Jenni: L-V 9-14 y 15-17 (comida 14-15 está en el gap)
//   Gaby: L-V 9-13 y 15-19 (comida 13-15 está en el gap)
//
// Si fisioId se pasa → solo muestra slots de ese terapeuta.
// Si no, pero hay especialidad → une las franjas de todos los terapeutas con esa especialidad.
export async function getHorariosDisponibles(
  fecha: string,
  fisioId?: string,
  especialidad?: string,
  duracionMin: number = 60,
) {
  const tenantId = await getTenantId();
  const dia = new Date(fecha);
  const inicioDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
  const finDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

  const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const diaKey = diasSemana[dia.getDay()];
  const fechaISO = `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, "0")}-${String(dia.getDate()).padStart(2, "0")}`;

  // Verificar días bloqueados
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const cfg = (tenant?.configuracion ?? {}) as Record<string, unknown>;
  const diasBloqueados = (cfg.diasBloqueados as { fecha: string; motivo: string }[]) ?? [];
  if (diasBloqueados.some((d) => d.fecha === fechaISO)) return [];

  // Determinar usuarios a considerar
  let usuarioIds: string[] = [];
  if (fisioId) {
    usuarioIds = [fisioId];
  } else if (especialidad) {
    const fisios = await prisma.usuario.findMany({
      where: { tenantId, activo: true, especialidades: { has: especialidad } },
      select: { id: true },
    });
    usuarioIds = fisios.map((f) => f.id);
  } else {
    const fisios = await prisma.usuario.findMany({
      where: { tenantId, activo: true },
      select: { id: true },
    });
    usuarioIds = fisios.map((f) => f.id);
  }

  if (usuarioIds.length === 0) return [];

  // Obtener franjas de todos los terapeutas para este día
  const horarios = await prisma.horarioUsuario.findMany({
    where: { tenantId, usuarioId: { in: usuarioIds }, diaKey, activo: true },
    select: { usuarioId: true, franjas: true },
  });

  if (horarios.length === 0) return [];

  // Recolectar todas las franjas (unión de todos los terapeutas)
  type Franja = { inicio: string; fin: string };
  const todasFranjas: Franja[] = [];
  for (const h of horarios) {
    const franjas = h.franjas as Franja[];
    todasFranjas.push(...franjas);
  }

  // Hora actual en CDMX para filtrar slots pasados
  const ahoraMx = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const hoyStr = `${ahoraMx.getFullYear()}-${String(ahoraMx.getMonth() + 1).padStart(2, "0")}-${String(ahoraMx.getDate()).padStart(2, "0")}`;
  const esHoy = fechaISO === hoyStr;
  const minutosActuales = esHoy ? ahoraMx.getHours() * 60 + ahoraMx.getMinutes() : -1;

  // Citas ya ocupadas ese día (solo del terapeuta específico, o todas)
  const citasWhere: Record<string, unknown> = {
    tenantId,
    estado: { notIn: ["cancelada", "no_show"] },
    fechaHoraInicio: { gte: inicioDia, lt: finDia },
  };
  if (fisioId) {
    citasWhere.fisioterapeutaId = fisioId;
  }

  const citasOcupadas = await prisma.cita.findMany({
    where: citasWhere,
    select: { fechaHoraInicio: true, fechaHoraFin: true },
  });

  const horasOcupadas = citasOcupadas.map((c) => ({
    inicio: c.fechaHoraInicio.getHours() * 60 + c.fechaHoraInicio.getMinutes(),
    fin: c.fechaHoraFin.getHours() * 60 + c.fechaHoraFin.getMinutes(),
  }));

  // Google Calendar events
  let gcalOcupadas: { inicio: number; fin: number }[] = [];
  try {
    const { listCalendarEvents } = await import("@/lib/google-calendar");
    const gcalEvents = await listCalendarEvents(tenantId, inicioDia, finDia);
    gcalOcupadas = gcalEvents.map((e) => ({
      inicio: e.start.getHours() * 60 + e.start.getMinutes(),
      fin: e.end.getHours() * 60 + e.end.getMinutes(),
    }));
  } catch {
    // Google Calendar not connected — continue
  }

  const todasOcupadas = [...horasOcupadas, ...gcalOcupadas];

  // Generar slots cada hora en punto (9:00, 10:00, 11:00...)
  // El intervalo es SIEMPRE 60 min — la duración solo se usa para verificar
  // que la sesión cabe dentro de la franja, no para espaciar los slots.
  const INTERVALO = 60;
  const slotsSet = new Set<string>();
  const slotsResult: { hora: string; disponible: boolean }[] = [];

  for (const franja of todasFranjas) {
    const [hIni, mIni] = franja.inicio.split(":").map(Number);
    const [hFin, mFin] = franja.fin.split(":").map(Number);
    // Arrancar siempre en la hora en punto más próxima >= inicio de la franja
    let minutos = (hIni * 60 + mIni);
    if (mIni > 0) minutos = (hIni + 1) * 60; // redondear a la siguiente hora entera
    const finMinutos = hFin * 60 + mFin;

    while (minutos + duracionMin <= finMinutos) {
      const hora = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;

      if (!slotsSet.has(hora)) {
        slotsSet.add(hora);
        const yaPaso = esHoy && minutos <= minutosActuales;
        const ocupado = todasOcupadas.some((o) => minutos >= o.inicio && minutos < o.fin);
        slotsResult.push({ hora, disponible: !ocupado && !yaPaso });
      }
      minutos += INTERVALO;
    }
  }

  // Ordenar por hora
  slotsResult.sort((a, b) => a.hora.localeCompare(b.hora));

  return slotsResult;
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
  const comprobanteUrl = formData.get("comprobanteUrl") as string;

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
    // Construir la fecha respetando la zona horaria real de México (con DST automático).
    // Estrategia: interpretar fecha+hora como si fuera UTC, luego calcular el offset
    // real de "America/Mexico_City" para ese instante y compensar.
    const [y, mo, d] = fecha.split("-").map(Number);
    const [h, mi] = horaInicio.split(":").map(Number);
    // Fecha en UTC puro (va a diferir de México, pero nos sirve para calcular el offset)
    const utcRef = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
    // Obtener hora que Mexico_City muestra para ese instante UTC
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Mexico_City",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    }).formatToParts(utcRef);
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
    const mxDisplayed = Date.UTC(
      Number(p.year), Number(p.month) - 1, Number(p.day),
      Number(p.hour) === 24 ? 0 : Number(p.hour), Number(p.minute), Number(p.second)
    );
    // El offset es la diferencia entre lo que México mostraría y lo que pusimos
    const offsetMs = utcRef.getTime() - mxDisplayed;
    // Fecha/hora correcta en UTC que representa las HH:MM en Ciudad de México
    const fechaHoraInicio = new Date(Date.UTC(y, mo - 1, d, h, mi, 0) + offsetMs);
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

    // Always pendiente_anticipo at public booking — admin must validate the
    // comprobante (if any) before flipping the cita to confirmada. A subida
    // de comprobante por sí sola no confirma nada.
    const pago = await prisma.pago.create({
      data: {
        tenantId,
        pacienteId,
        citaId: cita.id,
        monto: 200,
        metodo: comprobanteUrl ? "transferencia" : "otro",
        estado: "pendiente",
        comprobanteUrl: comprobanteUrl || null,
        concepto: "Anticipo obligatorio",
        registradoPor: fisioId,
        fechaPago: new Date(),
      },
    });

    await prisma.cita.update({
      where: { id: cita.id },
      data: {
        anticipoPagoId: pago.id,
        anticipoPagado: false,
        anticipoVenceAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estado: "pendiente_anticipo",
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

    // Send WhatsApp to paciente (best-effort) — differ copy by whether a
    // comprobante was uploaded. A comprobante subido NO confirma nada: el
    // admin debe validarlo antes de que la cita pase a confirmada.
    try {
      const pac = await prisma.paciente.findUnique({
        where: { id: pacienteId },
        select: { nombre: true, apellido: true, telefono: true },
      });
      const fisio = await prisma.usuario.findUnique({
        where: { id: fisioId },
        select: { nombre: true, apellido: true },
      });
      const waPayload = {
        pacienteNombre: `${pac?.nombre ?? ""} ${pac?.apellido ?? ""}`.trim(),
        pacienteTelefono: pac?.telefono ?? "",
        tipoSesion: tipoSesion || "Sesión",
        fisioterapeuta: `${fisio?.nombre ?? ""} ${fisio?.apellido ?? ""}`.trim(),
        fechaHoraInicio,
        fechaHoraFin,
        sala: null,
        citaId: cita.id,
      };
      if (comprobanteUrl) {
        const { sendComprobanteRecibidoWhatsApp } = await import("@/lib/send-whatsapp");
        await sendComprobanteRecibidoWhatsApp(waPayload);
      } else {
        const { sendCitaAgendadaWhatsApp } = await import("@/lib/send-whatsapp");
        await sendCitaAgendadaWhatsApp(waPayload);
      }
    } catch (waErr) {
      console.error("[WhatsApp] Public booking send failed:", waErr);
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
