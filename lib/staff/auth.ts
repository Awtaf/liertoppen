import { cookies } from "next/headers";
import {
  STAFF_SESSION_COOKIE,
  staffSessionSecret,
  verifyStaffToken,
  type StaffSessionPayload,
} from "@/lib/staff/session";

/**
 * Reads and verifies the ansatt session cookie. proxy.ts already redirects
 * unauthenticated requests away from /ansatt/*, but Server Actions and
 * Route Handlers re-check here too (same defense-in-depth pattern as
 * requireCustomer() in app/portal/actions.ts) since they can be invoked
 * directly.
 */
export async function getStaffSession(): Promise<StaffSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyStaffToken(token, staffSessionSecret());
}

export async function requireStaff(): Promise<StaffSessionPayload> {
  const session = await getStaffSession();
  if (!session) throw new Error("Ikke innlogget.");
  return session;
}

export async function requireLeder(): Promise<StaffSessionPayload> {
  const session = await requireStaff();
  if (session.role !== "leder") throw new Error("Krever leder-tilgang.");
  return session;
}
