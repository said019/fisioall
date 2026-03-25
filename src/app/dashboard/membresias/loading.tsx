import { Skeleton } from "@/components/ui/skeleton";

export default function MembresiasLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando membresías">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#c8dce8] p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-80 rounded-lg" />

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-[#c8dce8] overflow-hidden">
        <div className="p-4 border-b border-[#c8dce8] flex items-center justify-between">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        <div className="divide-y divide-[#e4ecf2]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-28 flex-1" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-2 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Cargando membresías...</span>
    </div>
  );
}
