"use client";

import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BodyMapPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
      <div className="h-16 w-16 rounded-2xl bg-cyan-50 flex items-center justify-center">
        <MapPin className="h-8 w-8 text-[#0891B2]" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-[#164E63]">Body Map integrado</h1>
        <p className="text-sm text-[#164E63]/50 max-w-sm">
          El mapa corporal ahora está integrado directamente en el perfil del
          paciente y en las notas SOAP. Accede a él desde esas secciones.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/dashboard/pacientes">
          <Button className="cursor-pointer bg-[#0891B2] hover:bg-[#0891B2]/90 text-white gap-1.5">
            <MapPin className="h-4 w-4" />
            Ir a Pacientes
          </Button>
        </Link>
        <Link href="/dashboard/expediente">
          <Button variant="outline" className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Nota SOAP
          </Button>
        </Link>
      </div>
    </div>
  );
}
