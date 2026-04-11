import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// POST — Register device for pass updates
// DELETE — Unregister device
// ---------------------------------------------------------------------------

type Params = { params: Promise<{ deviceId: string; passTypeId: string; serial: string }> };

function getAuthToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("ApplePass ")) return null;
  return header.slice("ApplePass ".length);
}

function isAuthorized(request: NextRequest): boolean {
  const token = getAuthToken(request);
  const expected = process.env.APPLE_AUTH_TOKEN;
  if (!token || !expected) return false;
  return token === expected;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { deviceId, passTypeId, serial } = await params;

  if (!isAuthorized(request)) {
    return new NextResponse(null, { status: 401 });
  }

  let pushToken: string;
  try {
    const body = await request.json();
    pushToken = body.pushToken;
    if (!pushToken) throw new Error("Missing pushToken");
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  // Check if tarjeta exists
  const tarjeta = await prisma.tarjetaLealtad.findUnique({
    where: { id: serial },
  });
  if (!tarjeta) {
    return new NextResponse(null, { status: 404 });
  }

  // Upsert device registration
  const existing = await prisma.appleDevice.findFirst({
    where: { deviceId, passTypeId, serialNumber: serial },
  });

  if (existing) {
    await prisma.appleDevice.update({
      where: { id: existing.id },
      data: { pushToken },
    });
    return new NextResponse(null, { status: 200 }); // Already registered
  }

  await prisma.appleDevice.create({
    data: { deviceId, pushToken, passTypeId, serialNumber: serial },
  });

  console.log(`[apple-ws] Device registered: ${deviceId.slice(0, 8)}... for tarjeta ${serial.slice(0, 8)}`);
  return new NextResponse(null, { status: 201 }); // New registration
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { deviceId, passTypeId, serial } = await params;

  await prisma.appleDevice.deleteMany({
    where: { deviceId, passTypeId, serialNumber: serial },
  });

  console.log(`[apple-ws] Device unregistered: ${deviceId.slice(0, 8)}... for tarjeta ${serial.slice(0, 8)}`);
  return new NextResponse(null, { status: 200 });
}
