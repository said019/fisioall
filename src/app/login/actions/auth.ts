"use server";

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

const prisma = new PrismaClient();

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Correo y contraseña son obligatorios." };
    }

    try {
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) {
            return { error: "Credenciales incorrectas" };
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
            return { error: "Credenciales incorrectas" };
        }

        // Credentials match, create session
        await createSession(user.id, user.tenantId, user.rol);

        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return { error: "Ocurrió un error inesperado. Intenta de nuevo." };
    }
}
