import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET — List updatable passes for a device
// Apple Wallet calls this to find out which passes have been updated.
// ---------------------------------------------------------------------------

type Params = { params: Promise<{ deviceId: string; passTypeId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { deviceId, passTypeId } = await params;
  const since = request.nextUrl.searchParams.get("passesUpdatedSince");

  // Find all passes registered on this device
  const registrations = await prisma.appleDevice.findMany({
    where: { deviceId, passTypeId },
    select: { serialNumber: true },
  });

  if (registrations.length === 0) {
    return new NextResponse(null, { status: 204 });
  }

  const serialNumbers = registrations.map((r) => r.serialNumber);

  // If a `since` timestamp is given, only return passes updated after that time
  if (since) {
    const sinceDate = new Date(Number(since) * 1000);

    const updates = await prisma.applePassUpdate.findMany({
      where: {
        serialNumber: { in: serialNumbers },
        updatedAt: { gt: sinceDate },
      },
      select: { serialNumber: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    if (updates.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    const updatedSerials = [...new Set(updates.map((u) => u.serialNumber))];
    const lastUpdated = Math.floor(updates[0].updatedAt.getTime() / 1000);

    return NextResponse.json({
      serialNumbers: updatedSerials,
      lastUpdated: String(lastUpdated),
    });
  }

  // No `since` — return all registered passes
  const lastUpdated = Math.floor(Date.now() / 1000);
  return NextResponse.json({
    serialNumbers,
    lastUpdated: String(lastUpdated),
  });
}
