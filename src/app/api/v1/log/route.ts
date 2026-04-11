import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// POST — Receive Apple Wallet error logs from devices
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (Array.isArray(body.logs)) {
      for (const log of body.logs) {
        console.log("[apple-wallet-log]", log);
      }
    }
  } catch {
    // Ignore malformed requests
  }

  return new NextResponse(null, { status: 200 });
}
