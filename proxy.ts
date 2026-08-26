import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { STAFF_SESSION_COOKIE, staffSessionSecret, verifyStaffToken } from "@/lib/staff/session";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_PORTAL_PATHS = ["/portal/login", "/portal/velkommen"];
// The manifest/icons must stay reachable without a session — the browser
// requests them (installability checks, the login page's own <head> tags)
// before any employee has logged in.
const PUBLIC_ANSATT_PATHS = [
  "/ansatt/logg-inn",
  "/ansatt/manifest.webmanifest",
  "/ansatt/icon",
  "/ansatt/apple-icon",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session (if any) so it doesn't silently expire.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  // Every Supabase Auth user is either the owner (no role claim set — the
  // account created directly in the Supabase dashboard/Admin API) or a
  // customer (role:'customer', set when their onboarding invite is
  // completed — see app/portal/actions.ts). This claim lives in the JWT, so
  // checking it here costs no extra DB round-trip.
  const isCustomer = user?.app_metadata?.role === "customer";

  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isPublicPortalPath = PUBLIC_PORTAL_PATHS.some((path) => pathname.startsWith(path));

  if (pathname.startsWith("/admin") && !isPublicAdminPath) {
    if (!user || isCustomer) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/portal") && !isPublicPortalPath) {
    if (!user || !isCustomer) {
      const loginUrl = new URL("/portal/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Ansatt-appen (innsjekk/timer/oppgaver for Telia Liertoppen) bruker en
  // egen, signert sesjonscookie i stedet for Supabase Auth (se
  // lib/staff/session.ts) — helt uavhengig av kurer-admin/portal over.
  const isPublicAnsattPath = PUBLIC_ANSATT_PATHS.some((path) => pathname.startsWith(path));
  if (pathname.startsWith("/ansatt") && !isPublicAnsattPath) {
    const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    const staffSession = token ? await verifyStaffToken(token, staffSessionSecret()) : null;

    if (!staffSession) {
      const loginUrl = new URL("/ansatt/logg-inn", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/ansatt/leder") && staffSession.role !== "leder") {
      return NextResponse.redirect(new URL("/ansatt", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/ansatt/:path*"],
};
