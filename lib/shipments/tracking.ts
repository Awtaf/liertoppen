// lib/shipments/tracking.ts
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Genererer et garantert unikt sporingsnummer (format OBS{ÅÅ}{MM}{DD}{løpenr4})
 * via en atomisk Postgres-sekvens (next_tracking_number(), se
 * supabase/migrations/0002_shipments.sql). Ingen race conditions ved
 * samtidige bookinger.
 */
export async function generateTrackingNumber(): Promise<string> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("next_tracking_number");
  if (error || !data) {
    throw new Error("Kunne ikke generere sporingsnummer: " + error?.message);
  }
  return data as string;
}

/** "OBS2508204471" -> "OBS 250820 4471" for lesbarhet på fraktlappen. */
export function formatTrackingNumber(tn: string): string {
  return tn.replace(/^(.{3})(.{6})(.{4})$/, "$1 $2 $3");
}
