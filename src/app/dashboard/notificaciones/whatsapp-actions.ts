"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getEvolutionClient,
  isConfigured,
  formatPhone,
} from "@/lib/evolution";

// ── Types ──────────────────────────────────────────────────────────────────

interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function notConfigured<T = unknown>(): ActionResult<T> {
  return {
    ok: false,
    error:
      "WhatsApp no configurado. Contacta al administrador para agregar las variables de Evolution API.",
  };
}

// ── Actions ────────────────────────────────────────────────────────────────

/** Returns the current WhatsApp connection state. */
export async function getWhatsAppStatus(): Promise<
  ActionResult<{ state: string; instanceName: string }>
> {
  await requireAuth();
  if (!isConfigured()) return notConfigured();

  try {
    const client = getEvolutionClient();
    const status = await client.getStatus();
    return {
      ok: true,
      data: { state: status.state, instanceName: status.instanceName },
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Creates / connects the instance and returns the QR code as base64. */
export async function connectWhatsApp(): Promise<
  ActionResult<{ base64: string; code: string; pairingCode: string | null }>
> {
  await requireAuth();
  if (!isConfigured()) return notConfigured();

  try {
    const client = getEvolutionClient();
    const qr = await client.connectInstance();
    return {
      ok: true,
      data: {
        base64: qr.base64,
        code: qr.code,
        pairingCode: qr.pairingCode,
      },
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Disconnects (logout) the current WhatsApp session. */
export async function disconnectWhatsApp(): Promise<ActionResult> {
  await requireAuth();
  if (!isConfigured()) return notConfigured();

  try {
    const client = getEvolutionClient();
    await client.logout();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Sends a plain text WhatsApp message to a patient. */
export async function sendWhatsAppMessage(
  pacienteId: string,
  mensaje: string,
): Promise<ActionResult> {
  const { tenantId } = await requireAuth();
  if (!isConfigured()) return notConfigured();

  try {
    const paciente = await prisma.paciente.findFirst({
      where: { id: pacienteId, tenantId },
      select: { telefono: true, nombre: true, apellido: true },
    });

    if (!paciente) {
      return { ok: false, error: "Paciente no encontrado." };
    }

    if (!paciente.telefono) {
      return { ok: false, error: "El paciente no tiene número de teléfono registrado." };
    }

    const client = getEvolutionClient();
    await client.sendText(formatPhone(paciente.telefono), mensaje);

    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Sends a formatted appointment reminder to the patient of a given cita. */
export async function sendAppointmentReminder(
  citaId: string,
): Promise<ActionResult> {
  const { tenantId } = await requireAuth();
  if (!isConfigured()) return notConfigured();

  try {
    const cita = await prisma.cita.findFirst({
      where: { id: citaId, tenantId },
      include: {
        paciente: { select: { nombre: true, apellido: true, telefono: true } },
        fisioterapeuta: { select: { nombre: true, apellido: true } },
      },
    });

    if (!cita) {
      return { ok: false, error: "Cita no encontrada." };
    }

    if (!cita.paciente.telefono) {
      return { ok: false, error: "El paciente no tiene número de teléfono registrado." };
    }

    const fecha = cita.fechaHoraInicio.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Mexico_City",
    });
    const hora = cita.fechaHoraInicio.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Mexico_City",
    });
    const fisio = `${cita.fisioterapeuta.nombre} ${cita.fisioterapeuta.apellido}`;

    const mensaje = [
      `Hola ${cita.paciente.nombre} 👋`,
      ``,
      `Te recordamos tu cita en *Kaya Kalp*:`,
      cita.tipoSesion ? `📋 *${cita.tipoSesion}*` : null,
      `📅 ${fecha}`,
      `🕐 ${hora}`,
      `👩‍⚕️ ${fisio}`,
      ``,
      `📍 Av. María No. 25, San Juan del Río, Qro.`,
      ``,
      `Responde:`,
      `1️⃣ *1* — Confirmar asistencia`,
      `2️⃣ *2* — Cancelar`,
      `3️⃣ *3* — Reagendar`,
    ]
      .filter(Boolean)
      .join("\n");

    const client = getEvolutionClient();
    await client.sendText(formatPhone(cita.paciente.telefono), mensaje);

    // Mark reminder as sent
    await prisma.cita.update({
      where: { id: citaId },
      data: { recordatorioEnviado: true, recordatorioAt: new Date() },
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
