import { createClient } from "@supabase/supabase-js";

/**
 * Full-access Supabase client using the service_role key. This bypasses
 * Row Level Security entirely, so it must only ever be used in server-side
 * code (Server Actions, Route Handlers) — never imported into a Client
 * Component or otherwise sent to the browser.
 *
 * All reads/writes to the leads and customers tables go through this
 * client. The anon key (see lib/supabase/server.ts) is only used for the
 * admin login session, which has no direct table access under RLS.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
