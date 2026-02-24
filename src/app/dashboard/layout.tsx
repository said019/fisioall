"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CalendarDays,
  Users,
  LogOut,
  Settings,
  CreditCard,
  Menu,
  X,
  Bell,
  ChevronRight,
  Scan,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "./actions";

const navItems = [
  { href: "/dashboard", icon: Activity, label: "Dashboard", exact: true },
  { href: "/dashboard/agenda", icon: CalendarDays, label: "Agenda", exact: false },
  { href: "/dashboard/pacientes", icon: Users, label: "Pacientes", exact: false },
  { href: "/dashboard/body-map", icon: Scan, label: "Body Map", exact: false },
  {
    href: "/dashboard/membresias",
    icon: CreditCard,
    label: "Membresías",
    exact: false,
    badge: "3",
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
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-cyan-100 px-6">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="h-8 w-8 rounded-lg bg-[#0891B2] flex items-center justify-center shadow-sm">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#164E63] leading-none">FisioAll</span>
            <span className="text-[10px] text-[#164E63]/50 leading-none tracking-wide">
              Plataforma Clínica
            </span>
          </div>
        </Link>
      </div>

      {/* Nav principal */}
      <div className="flex-1 overflow-auto py-5 px-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#164E63]/40 px-3 mb-2">
          Menú Principal
        </p>
        <nav className="grid gap-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? "bg-[#0891B2] text-white shadow-sm"
                    : "text-[#164E63]/70 hover:text-[#164E63] hover:bg-cyan-50"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    isActive ? "text-white" : "text-[#0891B2] group-hover:text-[#0891B2]"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge
                    className={`h-5 px-1.5 text-[10px] ${
                      isActive
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                    }`}
                    variant="outline"
                  >
                    {item.badge}
                  </Badge>
                )}
                {isActive && <ChevronRight className="h-3 w-3 text-white/70" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer del sidebar */}
      <div className="border-t border-cyan-100 px-3 py-3 space-y-1">
        <Link
          href="/dashboard/configuracion"
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer group ${
            pathname.startsWith("/dashboard/configuracion")
              ? "bg-[#0891B2] text-white"
              : "text-[#164E63]/70 hover:text-[#164E63] hover:bg-cyan-50"
          }`}
        >
          <Settings
            className={`h-4 w-4 shrink-0 ${
              pathname.startsWith("/dashboard/configuracion")
                ? "text-white"
                : "text-[#0891B2]"
            }`}
          />
          Configuración
        </Link>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-cyan-50 mt-2">
          <Avatar className="h-8 w-8 border border-cyan-200">
            <AvatarFallback className="bg-[#0891B2]/20 text-[#0891B2] text-xs font-bold">
              DM
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#164E63] truncate">Dr. Carlos Martínez</p>
            <p className="text-[10px] text-[#164E63]/50 truncate">Fisioterapeuta</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="cursor-pointer text-[#164E63]/40 hover:text-[#EF4444] transition-colors duration-200"
              title="Cerrar sesión"
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

  const pageLabels: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/agenda": "Agenda",
    "/dashboard/pacientes": "Pacientes",
    "/dashboard/body-map": "Body Map",
    "/dashboard/membresias": "Membresías y Pagos",
    "/dashboard/configuracion": "Configuración",
  };

  const currentLabel = pageLabels[pathname] ?? "Dashboard";

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#ECFEFF]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-cyan-100 bg-white shadow-sm sm:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 flex-col border-r border-cyan-100 bg-white shadow-xl transition-transform duration-300 sm:hidden flex ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer h-8 w-8"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col sm:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-cyan-100 bg-white/80 backdrop-blur-sm px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5 text-[#164E63]" />
          </Button>

          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#164E63]">{currentLabel}</h1>
            <p className="text-xs text-[#164E63]/50 hidden sm:block">
              {new Date().toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer relative h-9 w-9 hover:bg-cyan-50"
            >
              <Bell className="h-4 w-4 text-[#164E63]/60" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444]" />
            </Button>

            <Avatar className="h-9 w-9 border-2 border-cyan-200 cursor-pointer">
              <AvatarFallback className="bg-[#0891B2]/20 text-[#0891B2] text-sm font-bold">
                DM
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
