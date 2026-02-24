import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Activity, CalendarDays, Users, TrendingUp, CreditCard } from "lucide-react";

export default function DashboardPage() {
    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Citas de Hoy</CardTitle>
                        <CalendarDays className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground text-chart-2 font-medium mt-1">
                            +3 desde ayer
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-muted-foreground text-chart-2 font-medium mt-1">
                            +18 este mes
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Membresías por Vencer</CardTitle>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">8</div>
                        <p className="text-xs text-muted-foreground text-destructive font-medium mt-1">
                            Requieren seguimiento
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Estimados</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,234.00</div>
                        <p className="text-xs text-muted-foreground text-chart-2 font-medium mt-1">
                            +19% este mes
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Próximas Citas</CardTitle>
                        <CardDescription>Tienes 4 citas programadas en las próximas 3 horas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground italic">
                            * La lista de citas se integrará con el backend pronto.
                        </p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Accesos Rápidos</CardTitle>
                        <CardDescription>Acciones frecuentes para tu clínica.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button className="w-full justify-start cursor-pointer" variant="outline">
                            <CalendarDays className="mr-2 h-4 w-4" /> Nueva Cita
                        </Button>
                        <Button className="w-full justify-start cursor-pointer" variant="outline">
                            <Users className="mr-2 h-4 w-4" /> Registrar Paciente
                        </Button>
                        <Button className="w-full justify-start cursor-pointer" variant="outline">
                            <Activity className="mr-2 h-4 w-4" /> Escribir Nota SOAP
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
