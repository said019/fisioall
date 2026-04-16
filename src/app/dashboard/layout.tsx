"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  LogOut,
  Settings,
  Menu,
  X,
  Bell,
  Scan,
  Wallet,
  Star,
  BarChart3,
  LayoutDashboard,
  FileText,
  Sparkles,
  Award,
  Apple,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "./actions";

const navSections = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
      { href: "/dashboard/agenda", icon: CalendarDays, label: "Agenda", exact: false },
      { href: "/dashboard/calendar-subscribe", icon: Apple, label: "Calendario Apple", exact: false },
    ],
  },
  {
    title: "Pacientes",
    items: [
      { href: "/dashboard/pacientes", icon: Users, label: "Pacientes", exact: false },
      { href: "/dashboard/expediente", icon: FileText, label: "Expediente Clínico", exact: false },
      { href: "/dashboard/body-map", icon: Scan, label: "Ficha de Evolución", exact: false },
    ],
  },
  {
    title: "Negocio",
    items: [
      { href: "/dashboard/servicios", icon: Sparkles, label: "Servicios", exact: false },
      { href: "/dashboard/pagos", icon: Wallet, label: "Pagos", exact: false },
      {
        href: "/dashboard/tarjetas",
        icon: Award,
        label: "Tarjetas de Lealtad",
        exact: false,
        badge: "3",
      },
      { href: "/dashboard/encuestas", icon: Star, label: "Encuestas NPS", exact: false },
      { href: "/dashboard/reportes", icon: BarChart3, label: "Reportes", exact: false },
    ],
  },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#1e3a4f]">
      {/* Logo */}
      <div className="flex shrink-0 items-center border-b border-white/[0.08] px-6 py-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="cursor-pointer"
        >
          <Image
            src="/images/logo-kaya-kalp.webp"
            alt="Kaya Kalp"
            width={280}
            height={100}
            className="h-20 w-auto brightness-0 invert opacity-80"
            priority
          />
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-auto py-4 px-3">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#a8cfe0]/30 px-3 mb-2">
              {section.title}
            </p>
            <nav className="grid gap-0.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-normal transition-all duration-200 cursor-pointer border-l-[3px] ${
                      isActive
                        ? "bg-[#4a7fa5]/25 border-l-[#7ab5d4] text-[#a8cfe0] font-medium"
                        : "border-l-transparent text-[#a8cfe0]/60 hover:bg-[#2a4d68] hover:text-[#a8cfe0]/90"
                    }`}
                  >
                    <item.icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-[#a8cfe0]" : "text-[#a8cfe0]/50"
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge
                        className={`h-4 px-1.5 text-[9px] rounded-full ${
                          isActive
                            ? "bg-white/15 text-white border-white/20"
                            : "bg-[#e89b3f]/20 text-[#e89b3f] border-[#e89b3f]/30"
                        }`}
                        variant="outline"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.08] px-3 py-3 space-y-1">
        <Link
          href="/dashboard/configuracion"
          onClick={onNavigate}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-normal transition-all duration-200 cursor-pointer border-l-[3px] ${
            pathname.startsWith("/dashboard/configuracion")
              ? "bg-[#4a7fa5]/25 border-l-[#7ab5d4] text-[#a8cfe0]"
              : "border-l-transparent text-[#a8cfe0]/60 hover:bg-[#2a4d68] hover:text-[#a8cfe0]/90"
          }`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Configuración
        </Link>

        {/* User card */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 mt-2">
          <Avatar className="h-8 w-8 border border-[#4a7fa5]">
            <AvatarFallback className="bg-[#4a7fa5] text-white text-xs font-bold">
              PA
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#a8cfe0] truncate">L.F.T. Paola Ríos</p>
            <p className="text-[10px] text-[#a8cfe0]/40 truncate">Administrador</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="cursor-pointer text-[#a8cfe0]/30 hover:text-[#d9534f] transition-colors duration-200"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fechaHoy, setFechaHoy] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFechaHoy(
      new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const pageLabels: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/agenda": "Agenda",
    "/dashboard/pacientes": "Pacientes",
    "/dashboard/body-map": "Ficha de Evolución",
    "/dashboard/expediente": "Expediente Clínico",
    "/dashboard/tarjetas": "Tarjetas de Lealtad",
    "/dashboard/servicios": "Servicios",
    "/dashboard/pagos": "Pagos",
    "/dashboard/encuestas": "Encuestas NPS",
    "/dashboard/notificaciones": "Notificaciones",
    "/dashboard/reportes": "Reportes y Analítica",
    "/dashboard/calendar-subscribe": "Calendario Apple",
    "/dashboard/configuracion": "Configuración",
  };

  const currentLabel = pageLabels[pathname] ?? "Dashboard";

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#f0f4f7]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[240px] flex-col shadow-lg sm:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#1e3a4f]/60 backdrop-blur-sm sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 flex-col shadow-xl transition-transform duration-300 sm:hidden flex ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer h-8 w-8 text-[#a8cfe0] hover:bg-[#2a4d68]"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col sm:pl-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-[#c8dce8] bg-white/90 backdrop-blur-sm px-4 sm:px-6 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-5 w-5 text-[#1e2d3a]" />
          </Button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-[#1e2d3a]">{currentLabel}</h1>
            <p className="text-[11px] text-[#8fa8ba] hidden sm:block capitalize">
              {fechaHoy}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-[#f0f4f7] border border-[#c8dce8] rounded-lg px-3 py-1.5">
              <span className="text-[#8fa8ba] text-xs">🔍</span>
              <input
                type="text"
                placeholder="Buscar paciente..."
                className="bg-transparent border-none outline-none text-sm text-[#1e2d3a] w-[180px] placeholder:text-[#8fa8ba]"
              />
            </div>

            <Link href="/dashboard/notificaciones">
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer relative h-9 w-9 hover:bg-[#e4ecf2]"
                aria-label="Notificaciones"
              >
                <Bell className="h-4 w-4 text-[#5a7080]" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#e89b3f]" aria-hidden="true" />
              </Button>
            </Link>

            <Avatar className="h-9 w-9 border-2 border-[#c8dce8] cursor-pointer" aria-label="Perfil de usuario">
              <AvatarFallback className="bg-[#4a7fa5] text-white text-sm font-bold">
                PA
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
