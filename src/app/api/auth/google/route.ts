import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUrl } from "@/lib/google-calendar";

const TENANT_SLUG = "kaya-kalp";

export async function GET() {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: TENANT_SLUG },
    });

    if (!tenant) {
      return NextResponse.redirect(new URL("/dashboard/configuracion?gcal=error", process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"));
    }

    const authUrl = getAuthUrl(tenant.id);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("[GCal OAuth] Error generating auth URL:", error);
    return NextResponse.redirect(new URL("/dashboard/configuracion?gcal=error", process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"));
  }
}
