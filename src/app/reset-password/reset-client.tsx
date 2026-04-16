"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { actualizarPassword } from "./actions";

type Validacion =
  | { valido: true; email: string; nombre: string }
  | { valido: false; error: string };

export default function ResetPasswordClient({
  token,
  validacion,
}: {
  token: string;
  validacion: Validacion;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(actualizarPassword, null);

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => router.push("/login"), 2500);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center bg-muted p-4">
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
            <CardTitle className="text-xl">Nueva contraseña</CardTitle>
            <CardDescription>
              {validacion.valido
                ? `Hola ${validacion.nombre}, define tu nueva contraseña.`
                : "No podemos procesar tu solicitud."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!validacion.valido ? (
              <div className="space-y-4">
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{validacion.error}</p>
                </div>
                <Link href="/forgot-password">
                  <Button className="w-full h-12 cursor-pointer">Solicitar un nuevo enlace</Button>
                </Link>
              </div>
            ) : state?.success ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-md flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <p className="font-semibold">¡Contraseña actualizada!</p>
                  <p className="mt-1 text-emerald-700">
                    Te llevaremos al login en unos segundos…
                  </p>
                </div>
              </div>
            ) : (
              <>
                {state?.error && (
                  <div role="alert" className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center mb-4">
                    <AlertCircle className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />
                    {state.error}
                  </div>
                )}
                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="token" value={token} />
                  <div className="space-y-2">
                    <Label>Correo</Label>
                    <Input value={validacion.email} disabled className="h-12 bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      className="h-12 focus-visible:ring-primary"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">Confirmar contraseña</Label>
                    <Input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Repite la contraseña"
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
                        Guardando...
                      </>
                    ) : (
                      "Actualizar contraseña"
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
