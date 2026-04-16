"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { randomBytes } from "crypto";

/** Obtiene el token de calendario del usuario actual — lo genera si no existe. */
export async function getTokenCalendar() {
  const { userId } = await requireAuth();

  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { tokenCalendar: true },
  });

  if (user?.tokenCalendar) return { token: user.tokenCalendar };

  const token = randomBytes(24).toString("hex");
  await prisma.usuario.update({
    where: { id: userId },
    data: { tokenCalendar: token },
  });
  return { token };
}

/** Regenera el token — invalida la suscripción previa. */
export async function regenerarTokenCalendar() {
  const { userId } = await requireAuth();
  const token = randomBytes(24).toString("hex");
  await prisma.usuario.update({
    where: { id: userId },
    data: { tokenCalendar: token },
  });
  return { token };
}
