import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLoyaltyPass } from "@/lib/wallet-apple";

// ---------------------------------------------------------------------------
// GET — Download the latest version of a pass
// Apple Wallet calls this to get an updated .pkpass after a push notification.
// ---------------------------------------------------------------------------

type Params = { params: Promise<{ passTypeId: string; serial: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { serial } = await params;

  // Validate auth token
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("ApplePass ") ? authHeader.slice(10) : null;
  const expected = process.env.APPLE_AUTH_TOKEN;

  if (!token || !expected || token !== expected) {
    return new NextResponse(null, { status: 401 });
  }

  // Fetch tarjeta + paciente
  const tarjeta = await prisma.tarjetaLealtad.findUnique({
    where: { id: serial },
    include: {
      paciente: {
        select: { id: true, nombre: true, apellido: true, telefono: true, tenantId: true },
      },
    },
  });

  if (!tarjeta) {
    return new NextResponse(null, { status: 404 });
  }

  // Generate fresh .pkpass with current stamp data
  const passBuffer = await generateLoyaltyPass(tarjeta, tarjeta.paciente);

  if (!passBuffer) {
    return new NextResponse(null, { status: 500 });
  }

  return new NextResponse(new Uint8Array(passBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Last-Modified": new Date().toUTCString(),
    },
  });
}
