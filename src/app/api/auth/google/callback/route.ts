import { NextRequest, NextResponse } from "next/server";
import { handleCallback } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tenantId = searchParams.get("state");
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  if (!code || !tenantId) {
    return NextResponse.redirect(new URL("/dashboard/configuracion?gcal=error", baseUrl));
  }

  try {
    await handleCallback(code, tenantId);
    return NextResponse.redirect(new URL("/dashboard/configuracion?gcal=connected", baseUrl));
  } catch (error) {
    console.error("[GCal Callback] Error:", error);
    return NextResponse.redirect(new URL("/dashboard/configuracion?gcal=error", baseUrl));
  }
}
