"use server";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

/**
 * Retrieves and validates the current session.
 * Redirects to /login if not authenticated.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return {
    userId: session.userId as string,
    tenantId: session.tenantId as string,
    rol: session.rol as string,
  };
}
