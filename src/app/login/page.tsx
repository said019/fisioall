"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { loginAction } from "./actions/auth";

export default function LoginPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(loginAction, null);

    useEffect(() => {
        if (state?.success) {
            router.push("/dashboard");
        }
    }, [state, router]);

    return (
        <div className="min-h-[100dvh] flex flex-col justify-center items-center bg-muted p-4">
            <Link href="/" className="absolute top-8 left-8 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
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
                    <p className="text-muted-foreground">Ingresa tus credenciales para acceder al sistema</p>
                </div>

                <Card className="border-border shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
                        <CardDescription>
                            Introduce tu correo y contraseña para entrar al sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {state?.error && (
                            <div role="alert" className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center mb-4">
                                <AlertCircle className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />
                                {state.error}
                            </div>
                        )}
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
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4 cursor-pointer">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="h-12 focus-visible:ring-primary"
                                    disabled={isPending}
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 mt-2 cursor-pointer" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    "Entrar al Dashboard"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center flex-col gap-4 border-t border-border p-6">
                        <div className="text-sm text-center text-muted-foreground">
                            ¿No tienes una cuenta?{" "}
                            <Link href="#" className="font-semibold text-primary hover:underline cursor-pointer">
                                Crear cuenta
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
