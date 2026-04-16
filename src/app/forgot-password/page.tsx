"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { solicitarResetPassword } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(solicitarResetPassword, null);

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center bg-muted p-4">
      <Link
        href="/login"
        className="absolute top-8 left-8 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al login
      </Link>

      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          <Image
            src="/images/logo-kaya-kalp.webp"
            alt="Kaya Kalp"
            width={400}
            height={309}
            className="h-28 w-auto"
            priority
          />
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
            <CardDescription>
              Te enviaremos un enlace a tu correo para restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state?.error && (
              <div role="alert" className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center mb-4">
                <AlertCircle className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />
                {state.error}
              </div>
            )}

            {state?.success ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-md flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <p className="font-semibold">Revisa tu correo</p>
                  <p className="mt-1 text-emerald-700">
                    Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.
                    Revisa tu bandeja de entrada (y la carpeta de spam por si acaso).
                  </p>
                  <p className="mt-2 text-xs text-emerald-700">⏰ El enlace expira en 1 hora.</p>
                </div>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@mail.com"
                    required
                    className="h-12 focus-visible:ring-primary"
                    disabled={isPending}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 mt-2 cursor-pointer"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar enlace de recuperación"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border p-6">
            <div className="text-sm text-center text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline cursor-pointer">
                Iniciar sesión
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
