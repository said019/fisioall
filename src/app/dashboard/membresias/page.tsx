"use client";

import { useState } from "react";
import {
    CreditCard,
    Package,
    WalletCards,
    Plus,
    Search,
    Filter,
    Download,
    AlertCircle,
    MoreVertical,
    CalendarClock
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- MOCK DATA ---
const mockMembresias = [
    {
        id: "1",
        paciente: "María González",
        paquete: "Rehabilitación Post-Operatoria",
        sesionesTotales: 10,
        sesionesUsadas: 8,
        estado: "activa",
        fechaVencimiento: new Date(2026, 3, 15),
        walletPass: true
    },
    {
        id: "2",
        paciente: "Carlos Rodríguez",
        paquete: "Mantenimiento Mensual",
        sesionesTotales: 4,
        sesionesUsadas: 4,
        estado: "vencida",
        fechaVencimiento: new Date(2026, 1, 28),
        walletPass: false
    },
    {
        id: "3",
        paciente: "Ana Silva",
        paquete: "Deportivo Intensivo",
        sesionesTotales: 5,
        sesionesUsadas: 1,
        estado: "activa",
        fechaVencimiento: new Date(2026, 5, 20),
        walletPass: true
    }
];

const mockPagos = [
    { id: "P-1001", fecha: new Date(2026, 1, 23, 10, 30), paciente: "María González", concepto: "Paquete Rehab (10 sesiones)", monto: 4500, metodo: "Tarjeta", estado: "pagado" },
    { id: "P-1002", fecha: new Date(2026, 1, 23, 14, 15), paciente: "Ana Silva", concepto: "Consulta Suelta", monto: 600, metodo: "Efectivo", estado: "pagado" },
    { id: "P-1003", fecha: new Date(2026, 1, 22, 16, 45), paciente: "Luis Torres", concepto: "Paquete Mantenimiento", monto: 2000, metodo: "Transferencia", estado: "pendiente" },
];

const mockPaquetes = [
    { id: "1", nombre: "Rehabilitación Básica", sesiones: 5, precio: 2500, vigencia: "3 meses", activo: true },
    { id: "2", nombre: "Rehabilitación Intensiva", sesiones: 10, precio: 4500, vigencia: "6 meses", activo: true },
    { id: "3", nombre: "Mantenimiento Mensual", sesiones: 4, precio: 1800, vigencia: "1 mes", activo: true },
    { id: "4", nombre: "Promo Verano", sesiones: 8, precio: 3200, vigencia: "2 meses", activo: false },
];

export default function MembresiasPagosPage() {
    const [activeTab, setActiveTab] = useState("membresias");

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Membresías y Pagos</h2>
                    <p className="text-muted-foreground">
                        Gestiona los paquetes de sesiones, registra cobros e historial financiero.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {activeTab === "membresias" && (
                        <Button><Plus className="mr-2 h-4 w-4" /> Asignar Paquete</Button>
                    )}
                    {activeTab === "pagos" && (
                        <Button><CreditCard className="mr-2 h-4 w-4" /> Cobro Rápido</Button>
                    )}
                    {activeTab === "paquetes" && (
                        <Button><Package className="mr-2 h-4 w-4" /> Nuevo Paquete</Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="membresias" className="flex gap-2">
                        <WalletCards className="h-4 w-4" />
                        <span className="hidden sm:inline">Membresías</span>
                    </TabsTrigger>
                    <TabsTrigger value="pagos" className="flex gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">Pagos</span>
                    </TabsTrigger>
                    <TabsTrigger value="paquetes" className="flex gap-2">
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">Catálogo</span>
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB: MEMBRESÍAS --- */}
                <TabsContent value="membresias" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Buscar por paciente..." className="pl-8" />
                        </div>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" /> Filtros
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {mockMembresias.map((mem) => {
                            const sesionesRestantes = mem.sesionesTotales - mem.sesionesUsadas;
                            const porcentaje = (mem.sesionesUsadas / mem.sesionesTotales) * 100;
                            const isLowSessions = sesionesRestantes <= 2 && mem.estado === "activa";

                            return (
                                <Card key={mem.id} className={`flex flex-col ${isLowSessions ? "border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20" : ""}`}>
                                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">{mem.paciente}</CardTitle>
                                            <CardDescription className="text-sm font-medium mt-1">{mem.paquete}</CardDescription>
                                        </div>
                                        {mem.estado === "activa" ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400">Activa</Badge>
                                        ) : (
                                            <Badge variant="secondary">Vencida</Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-3">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Progreso</span>
                                                <span className="font-medium">
                                                    {mem.sesionesUsadas} de {mem.sesionesTotales}
                                                </span>
                                            </div>
                                            <Progress value={porcentaje} className={`h-2 ${isLowSessions ? "[&>div]:bg-orange-500" : ""}`} />

                                            {isLowSessions && (
                                                <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                    <AlertCircle className="mr-1 h-3 w-3" />
                                                    ¡Quedan {sesionesRestantes} {sesionesRestantes === 1 ? 'sesión' : 'sesiones'}!
                                                </div>
                                            )}

                                            <div className="flex items-center text-xs text-muted-foreground pt-1">
                                                <CalendarClock className="mr-1 h-3 w-3" />
                                                Vence: {format(mem.fechaVencimiento, "d MMM yyyy", { locale: es })}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-3 border-t flex justify-between">
                                        {mem.walletPass ? (
                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700">
                                                Ver Apple Wallet
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="h-8 text-xs">
                                                Generar Pass
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* --- TAB: PAGOS --- */}
                <TabsContent value="pagos" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Historial de Transacciones</CardTitle>
                                <CardDescription>Cobros recientes y estado de cuenta mensual.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" /> Reporte
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Paciente</TableHead>
                                            <TableHead>Concepto</TableHead>
                                            <TableHead>Método</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                            <TableHead className="text-right">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockPagos.map((pago) => (
                                            <TableRow key={pago.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{format(pago.fecha, "dd/MM/yyyy")}</span>
                                                        <span className="text-xs text-muted-foreground">{format(pago.fecha, "HH:mm")}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-[10px]">{pago.paciente.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{pago.paciente}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{pago.concepto}</TableCell>
                                                <TableCell>{pago.metodo}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${pago.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={pago.estado === "pagado" ? "default" : "secondary"}
                                                        className={pago.estado === "pagado" ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600 text-white"}
                                                    >
                                                        {pago.estado === "pagado" ? "Pagado" : "Pendiente"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB: PAQUETES --- */}
                <TabsContent value="paquetes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Catálogo de Paquetes</CardTitle>
                            <CardDescription>Configura los planes de membresía disponibles para venta.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre del Paquete</TableHead>
                                            <TableHead>Sesiones</TableHead>
                                            <TableHead>Vigencia</TableHead>
                                            <TableHead className="text-right">Precio</TableHead>
                                            <TableHead className="text-right">Estado</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockPaquetes.map((paquete) => (
                                            <TableRow key={paquete.id}>
                                                <TableCell className="font-semibold">{paquete.nombre}</TableCell>
                                                <TableCell>{paquete.sesiones}</TableCell>
                                                <TableCell className="text-muted-foreground">{paquete.vigencia}</TableCell>
                                                <TableCell className="text-right font-medium">${paquete.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className={paquete.activo ? "border-green-200 text-green-700 bg-green-50" : "border-gray-200 text-gray-500"}>
                                                        {paquete.activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Editar</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
