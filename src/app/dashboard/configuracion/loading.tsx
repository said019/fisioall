import { Skeleton } from "@/components/ui/skeleton";

export default function ConfiguracionLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando configuración">
      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-96 rounded-lg" />

      {/* Settings cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-cyan-100 p-6 space-y-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Clinic card */}
        <div className="bg-white rounded-xl border border-cyan-100 p-6 space-y-5">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">Cargando configuración...</span>
    </div>
  );
}
