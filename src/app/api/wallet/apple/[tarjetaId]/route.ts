import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isAppleWalletConfigured,
  generateLoyaltyPass,
} from "@/lib/wallet-apple";

// ---------------------------------------------------------------------------
// GET /api/wallet/apple/[tarjetaId]
//
// Returns a .pkpass file for Apple Wallet.
// No auth required — the tarjetaId is a UUID and acts as an unguessable token.
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tarjetaId: string }> },
) {
  const { tarjetaId } = await params;

  // --- Check configuration first to fail fast ---
  if (!isAppleWalletConfigured()) {
    return NextResponse.json(
      {
        error: "Apple Wallet no está configurado todavía.",
        message:
          "Los certificados de Apple Wallet aún no han sido proporcionados. " +
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

  // --- Generate .pkpass ---
  const passBuffer = await generateLoyaltyPass(tarjeta, tarjeta.paciente);

  if (!passBuffer) {
    return NextResponse.json(
      {
        error: "No se pudo generar el pase de Apple Wallet.",
        message:
          "Hubo un error al firmar el pase. Verifica que los certificados estén correctamente configurados.",
      },
      { status: 500 },
    );
  }

  // --- Return .pkpass with proper headers ---
  return new NextResponse(new Uint8Array(passBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="kaya-kalp-lealtad-${tarjetaId.slice(0, 8)}.pkpass"`,
      "Cache-Control": "no-store",
    },
  });
}
