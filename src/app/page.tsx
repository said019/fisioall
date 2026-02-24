import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Activity, CalendarDays, ShieldCheck, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="px-6 lg:px-12 h-16 flex items-center border-b border-border bg-background">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-foreground">FisioAll</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="#features">Características</Link>
          </Button>
          <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-foreground">
                  Transforma la Gestión de tu
                  <span className="text-primary block mt-2">Clínica de Fisioterapia</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-6">
                  Expedientes clínicos integrales, mapas corporales interactivos, agenda inteligente y control de pagos. Todo en una plataforma segura y accesible.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button size="lg" className="h-12 px-8 bg-chart-2 hover:bg-chart-2/90 text-white font-medium text-lg">
                  Comienza Gratis
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 font-medium text-lg border-primary text-primary hover:bg-primary/10">
                  Agendar Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
                Diseñado para Profesionales
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Herramientas enfocadas en optimizar tu tiempo y mejorar la experiencia de tus pacientes.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="hover:border-primary transition-colors duration-200 cursor-pointer h-full">
                <CardHeader>
                  <CalendarDays className="h-10 w-10 text-primary mb-4" />
                  <CardTitle className="text-xl">Agenda Inteligente</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    Prevención automática de cruce de horarios, recordatorios automáticos por WhatsApp y control de salas.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-colors duration-200 cursor-pointer h-full">
                <CardHeader>
                  <Activity className="h-10 w-10 text-primary mb-4" />
                  <CardTitle className="text-xl">Expediente Clínico Digital</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    Notas SOAP estructuradas, seguimiento del nivel de dolor (EVA) y diagnóstico CIE-10.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-colors duration-200 cursor-pointer h-full">
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-primary mb-4" />
                  <CardTitle className="text-xl">Pagos y Membresías</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    Controla paquetes de sesiones, visualiza pagos pendientes y permite a los pacientes ver su saldo disponible.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-primary-foreground">
              <div className="space-y-2">
                <Users className="h-12 w-12 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Únete a más de 500 Clínicas
                </h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl/relaxed">
                  Eleva el profesionalismo de tus servicios y facilita la operación diaria de tu consultorio.
                </p>
              </div>
              <Button size="lg" className="mt-8 bg-white text-primary hover:bg-gray-100 font-bold h-12 px-8">
                Crea tu Cuenta Hoy
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border bg-background">
        <p className="text-xs text-muted-foreground">
          © 2026 FisioAll. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs text-muted-foreground hover:underline underline-offset-4" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-xs text-muted-foreground hover:underline underline-offset-4" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
