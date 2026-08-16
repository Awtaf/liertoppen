import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Session-aware Supabase client for Server Components, Server Actions and
 * Route Handlers. Uses the anon key + the visitor's auth cookies, so it can
 * only do what the signed-in admin user (or Row Level Security) allows —
 * it is not the client used to read/write leads and customers, see
 * lib/supabase/admin.ts for that.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render, where cookies can't be
            // written — middleware.ts refreshes the session instead.
          }
        },
      },
    }
  );
}
