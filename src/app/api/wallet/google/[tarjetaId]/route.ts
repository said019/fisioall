import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isGoogleWalletConfigured,
  generateGoogleWalletSaveUrl,
} from "@/lib/wallet-google";

// ---------------------------------------------------------------------------
// GET /api/wallet/google/[tarjetaId]
//
// Returns a JSON object with a "Save to Google Wallet" URL.
// No auth required — the tarjetaId is a UUID and acts as an unguessable token.
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tarjetaId: string }> },
) {
  const { tarjetaId } = await params;

  // --- Check configuration first to fail fast ---
  if (!isGoogleWalletConfigured()) {
    return NextResponse.json(
      {
        error: "Google Wallet no está configurado todavía.",
        message:
          "Las credenciales de Google Wallet (Service Account) aún no han sido proporcionadas. " +
          "Contacta al administrador del sistema para habilitar esta funcionalidad.",
      },
      { status: 503 },
    );
  }

  // --- Fetch tarjeta + paciente ---
  const tarjeta = await prisma.tarjetaLealtad.findUnique({
    where: { id: tarjetaId },
    include: {
      paciente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          telefono: true,
          tenantId: true,
        },
      },
    },
  });

  if (!tarjeta) {
    return NextResponse.json(
      { error: "Tarjeta de lealtad no encontrada." },
      { status: 404 },
    );
  }

  // --- Generate save URL ---
  const saveUrl = await generateGoogleWalletSaveUrl(tarjeta, tarjeta.paciente);

  if (!saveUrl) {
    return NextResponse.json(
      {
        error: "No se pudo generar la URL de Google Wallet.",
        message:
          "Hubo un error al firmar el JWT. Verifica que las credenciales de la Service Account estén correctas.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ saveUrl }, { status: 200 });
}
