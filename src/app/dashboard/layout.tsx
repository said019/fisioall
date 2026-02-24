"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Activity, CalendarDays, Users, LogOut, Settings, CreditCard, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutAction } from "./actions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", icon: Activity, label: "Dashboard" },
        { href: "/dashboard/agenda", icon: CalendarDays, label: "Agenda" },
        { href: "/dashboard/pacientes", icon: Users, label: "Pacientes" },
        { href: "/dashboard/membresias", icon: CreditCard, label: "Membresías y Pagos" },
    ];

    return (
        <div className="flex min-h-[100dvh] w-full flex-col bg-muted/40">
            {/* Sidebar Mock (Hidden on mobile) */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-border bg-sidebar sm:flex">
                <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <Activity className="h-6 w-6 text-primary" />
                        <span className="text-xl text-foreground">FisioAll</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-4">
                    <nav className="grid items-start px-4 text-sm font-medium gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all cursor-pointer ${isActive
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "text-sidebar-foreground hover:text-primary hover:bg-muted"
                                        }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t border-border">
                    <nav className="grid items-start text-sm font-medium">
                        <Link
                            href="/dashboard/configuracion"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-primary hover:bg-muted cursor-pointer"
                        >
                            <Settings className="h-5 w-5" />
                            Configuración
                        </Link>
                    </nav>
                </div>
            </aside>

            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
                {/* Header Mock */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button variant="outline" size="icon" className="sm:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                    <div className="w-full flex-1">
                        {/* Real app would use a store or fetch session for this name */}
                        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido, Dr. Martínez</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <form action={logoutAction}>
                            <Button type="submit" variant="ghost" size="icon" className="cursor-pointer">
                                <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                                <span className="sr-only">Cerrar Sesión</span>
                            </Button>
                        </form>
                        <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                            <AvatarFallback className="bg-primary/20 text-primary font-bold">DM</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Main Content Rendered Here */}
                {children}
            </div>
        </div>
    );
}
