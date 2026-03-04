import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando agenda">
      {/* Week navigation skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>

      {/* Day tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-20 rounded-xl" />
        ))}
      </div>

      {/* Timeline skeleton */}
      <div className="bg-white rounded-xl border border-cyan-100 p-5 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-start">
            <Skeleton className="h-4 w-12 shrink-0" />
            <div className="flex-1 bg-cyan-50/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Cargando agenda...</span>
    </div>
  );
}
