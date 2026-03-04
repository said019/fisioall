"use server";

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validations";

const prisma = new PrismaClient();

export async function loginAction(prevState: unknown, formData: FormData) {
    const raw = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    // Validate with Zod
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
        return { error: firstError };
    }

    const { email, password } = parsed.data;

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
