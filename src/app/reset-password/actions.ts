"use server";

import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export type ValidacionResult =
  | { valido: true; email: string; nombre: string }
  | { valido: false; error: string };

export async function validarToken(token: string): Promise<ValidacionResult> {
  if (!token) return { valido: false, error: "Token inválido" };

  const user = await prisma.usuario.findFirst({
    where: { tokenRecuperacion: token },
    select: { id: true, email: true, tokenExp: true, nombre: true },
  });

  if (!user) return { valido: false, error: "Enlace inválido o ya fue usado" };
  if (!user.tokenExp || user.tokenExp < new Date()) {
    return { valido: false, error: "El enlace ha expirado. Solicita uno nuevo." };
  }

  return { valido: true, email: user.email, nombre: user.nombre };
}

export async function actualizarPassword(prevState: unknown, formData: FormData) {
  const token = (formData.get("token") as string)?.trim();
  const password = (formData.get("password") as string) ?? "";
  const passwordConfirm = (formData.get("passwordConfirm") as string) ?? "";

  if (!token) return { error: "Token inválido" };

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (password !== passwordConfirm) {
    return { error: "Las contraseñas no coinciden" };
  }

  const user = await prisma.usuario.findFirst({
    where: { tokenRecuperacion: token },
    select: { id: true, tokenExp: true },
  });

  if (!user) return { error: "Enlace inválido o ya fue usado" };
  if (!user.tokenExp || user.tokenExp < new Date()) {
    return { error: "El enlace ha expirado. Solicita uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      passwordHash,
      tokenRecuperacion: null,
      tokenExp: null,
    },
  });

  return { success: true };
}
