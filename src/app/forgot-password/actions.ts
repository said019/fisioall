"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { getResend, isResendConfigured } from "@/lib/resend";

export async function solicitarResetPassword(prevState: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Ingresa tu correo electrónico" };

  // Buscar usuario (no revelamos si existe o no — siempre respondemos OK por seguridad)
  const user = await prisma.usuario.findUnique({ where: { email } });

  if (user) {
    // Generar token + expiración (1 hora)
    const token = randomBytes(32).toString("hex");
    const expiraAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        tokenRecuperacion: token,
        tokenExp: expiraAt,
      },
    });

    // Construir URL del reset
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.kayakalp.com.mx");
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Mandar email (best-effort)
    if (isResendConfigured()) {
      try {
        const resend = getResend();
        await resend?.emails.send({
          from: "Kaya Kalp <noreply@kayakalp.com.mx>",
          to: email,
          subject: "Recuperar tu contraseña — Kaya Kalp",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1e2d3a;">
              <h1 style="font-size: 24px; margin: 0 0 16px;">Hola ${user.nombre} 👋</h1>
              <p style="font-size: 16px; line-height: 1.6;">
                Recibimos una solicitud para recuperar tu contraseña en <strong>Kaya Kalp</strong>.
              </p>
              <p style="font-size: 16px; line-height: 1.6;">
                Haz click en el siguiente botón para crear una nueva contraseña:
              </p>
              <div style="margin: 32px 0; text-align: center;">
                <a href="${resetUrl}"
                   style="display: inline-block; padding: 14px 32px; background: #4a7fa5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Restablecer contraseña
                </a>
              </div>
              <p style="font-size: 14px; color: #5a7080; line-height: 1.6;">
                O copia y pega este enlace en tu navegador:<br>
                <a href="${resetUrl}" style="color: #4a7fa5; word-break: break-all;">${resetUrl}</a>
              </p>
              <p style="font-size: 14px; color: #5a7080; line-height: 1.6; margin-top: 24px;">
                ⏰ El enlace expira en <strong>1 hora</strong>.
              </p>
              <p style="font-size: 14px; color: #5a7080; line-height: 1.6;">
                Si no solicitaste esto, puedes ignorar este correo. Tu contraseña actual seguirá funcionando.
              </p>
              <hr style="border: none; border-top: 1px solid #e4ecf2; margin: 32px 0;">
              <p style="font-size: 12px; color: #8fa8ba; text-align: center;">
                Kaya Kalp — Centro de Fisioterapia y Bienestar
              </p>
            </div>
          `,
        });
      } catch (err) {
        console.error("[ForgotPassword] Email error:", err);
      }
    }
  }

  // Siempre respondemos éxito (anti-enumeración de correos)
  return { success: true };
}
