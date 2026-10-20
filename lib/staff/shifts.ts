import type { SupabaseClient } from "@supabase/supabase-js";
import { haversineMeters, isWithinRadius } from "@/lib/staff/geofence";
import type { Shift, StoreSettings } from "@/lib/staff/types";

export async function getStoreSettings(admin: SupabaseClient): Promise<StoreSettings> {
  const { data, error } = await admin
    .from("staff_settings")
    .select("id, store_lat, store_lng, radius_meters, updated_at")
    .limit(1)
    .maybeSingle();
  if (error || !data) {
    throw new Error("Fant ingen butikkinnstillinger. Kontakt en leder.");
  }
  return data as StoreSettings;
}

export async function getOpenShift(
  admin: SupabaseClient,
  staffId: string
): Promise<Shift | null> {
  const { data } = await admin
    .from("staff_shifts")
    .select("*")
    .eq("staff_id", staffId)
    .is("checkout_at", null)
    .order("checkin_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Shift | null) ?? null;
}

export type CheckResult =
  | { ok: true; shift: Shift }
  | { ok: false; error: string };

export async function performCheckIn(
  admin: SupabaseClient,
  staffId: string,
  lat: number,
  lng: number
): Promise<CheckResult> {
  const existing = await getOpenShift(admin, staffId);
  if (existing) {
    return { ok: false, error: "Du er allerede sjekket inn." };
  }

  const settings = await getStoreSettings(admin);
  const distance = haversineMeters(lat, lng, settings.store_lat, settings.store_lng);
  if (!isWithinRadius(distance, settings.radius_meters)) {
    return {
      ok: false,
      error: `Du er ${Math.round(distance)} m fra butikken. Du må være innenfor ${settings.radius_meters} m for å sjekke inn.`,
    };
  }

  const { data, error } = await admin
    .from("staff_shifts")
    .insert({
      staff_id: staffId,
      checkin_at: new Date().toISOString(),
      checkin_lat: lat,
      checkin_lng: lng,
      checkin_distance_m: Math.round(distance),
    })
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false, error: "Kunne ikke registrere innsjekk. Prøv igjen." };
  }
  return { ok: true, shift: data as Shift };
}

export async function performCheckOut(
  admin: SupabaseClient,
  staffId: string,
  lat: number,
  lng: number
): Promise<CheckResult> {
  const open = await getOpenShift(admin, staffId);
  if (!open) {
    return { ok: false, error: "Du er ikke sjekket inn." };
  }

  const settings = await getStoreSettings(admin);
  const distance = haversineMeters(lat, lng, settings.store_lat, settings.store_lng);
  if (!isWithinRadius(distance, settings.radius_meters)) {
    return {
      ok: false,
      error: `Du er ${Math.round(distance)} m fra butikken. Du må være innenfor ${settings.radius_meters} m for å sjekke ut. Økten din er fortsatt åpen.`,
    };
  }

  const { data, error } = await admin
    .from("staff_shifts")
    .update({
      checkout_at: new Date().toISOString(),
      checkout_lat: lat,
      checkout_lng: lng,
      checkout_distance_m: Math.round(distance),
    })
    .eq("id", open.id)
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false, error: "Kunne ikke registrere utsjekk. Prøv igjen." };
  }
  return { ok: true, shift: data as Shift };
}

/** Minutes worked, or null if the shift is still open. */
export function shiftDurationMinutes(
  shift: Pick<Shift, "checkin_at" | "checkout_at">
): number | null {
  if (!shift.checkout_at) return null;
  const ms = new Date(shift.checkout_at).getTime() - new Date(shift.checkin_at).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("no-NO", { timeZone: "Europe/Oslo" });
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
}

export function formatDurationLabel(minutes: number | null): string {
  if (minutes === null) return "Pågår";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}t ${String(m).padStart(2, "0")}m`;
}

export async function getShiftsForStaff(
  admin: SupabaseClient,
  staffId: string,
  from?: Date,
  to?: Date
): Promise<Shift[]> {
  let query = admin
    .from("staff_shifts")
    .select("*")
    .eq("staff_id", staffId)
    .order("checkin_at", { ascending: false });
  if (from) query = query.gte("checkin_at", from.toISOString());
  if (to) query = query.lte("checkin_at", to.toISOString());
  const { data } = await query;
  return (data as Shift[]) ?? [];
}

export async function getAllShifts(
  admin: SupabaseClient,
  from?: Date,
  to?: Date
): Promise<Shift[]> {
  let query = admin.from("staff_shifts").select("*").order("checkin_at", { ascending: false });
  if (from) query = query.gte("checkin_at", from.toISOString());
  if (to) query = query.lte("checkin_at", to.toISOString());
  const { data } = await query;
  return (data as Shift[]) ?? [];
}

export async function getAllShiftsWithStaff(admin: SupabaseClient, from?: Date, to?: Date) {
  let query = admin
    .from("staff_shifts")
    .select("*, staff_members(name, username)")
    .order("checkin_at", { ascending: false });
  if (from) query = query.gte("checkin_at", from.toISOString());
  if (to) query = query.lte("checkin_at", to.toISOString());
  const { data } = await query;
  return data ?? [];
}

export async function getOpenShiftsWithStaff(admin: SupabaseClient) {
  const { data } = await admin
    .from("staff_shifts")
    .select("*, staff_members(name, username)")
    .is("checkout_at", null)
    .order("checkin_at", { ascending: true });
  return data ?? [];
}

export async function correctOpenShift(
  admin: SupabaseClient,
  shiftId: string,
  checkoutAtIso: string
): Promise<void> {
  const { error } = await admin
    .from("staff_shifts")
    .update({ checkout_at: checkoutAtIso, checkout_corrected_by_admin: true })
    .eq("id", shiftId)
    .is("checkout_at", null);
  if (error) {
    throw new Error("Kunne ikke rette økten: " + error.message);
  }
}
