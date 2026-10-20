"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireLeder } from "@/lib/staff/auth";
import { hashSecret } from "@/lib/staff/pin";
import { getStoreSettings, correctOpenShift as correctOpenShiftRecord } from "@/lib/staff/shifts";
import { resetPointsPeriod as resetPointsPeriodRecord } from "@/lib/staff/leaderboard";
import type { TaskType } from "@/lib/staff/types";

export async function createStaffMember(_prevState: string | null, formData: FormData) {
  await requireLeder();

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const pin = String(formData.get("pin") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "ansatt") as "ansatt" | "leder";

  if (!name || !username) {
    return "Navn og brukernavn er påkrevd.";
  }
  if (!pin && !password) {
    return "Sett minst en PIN-kode eller et passord.";
  }
  if (pin && !/^\d{4,8}$/.test(pin)) {
    return "PIN-koden må være 4–8 siffer.";
  }
  if (password && password.length < 8) {
    return "Passordet må være minst 8 tegn.";
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("staff_members").insert({
    name,
    username,
    email,
    role,
    pin_hash: pin ? hashSecret(pin) : null,
    password_hash: password ? hashSecret(password) : null,
  });

  if (error) {
    return error.code === "23505"
      ? "Brukernavnet eller e-posten er allerede i bruk."
      : "Kunne ikke opprette ansatt.";
  }

  revalidatePath("/ansatt/leder/ansatte");
  return null;
}

export async function resetStaffPin(_prevState: string | null, formData: FormData) {
  await requireLeder();

  const staffId = String(formData.get("staffId") ?? "");
  const pin = String(formData.get("pin") ?? "").trim();
  if (!staffId || !/^\d{4,8}$/.test(pin)) {
    return "PIN-koden må være 4–8 siffer.";
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("staff_members")
    .update({ pin_hash: hashSecret(pin) })
    .eq("id", staffId);

  if (error) return "Kunne ikke oppdatere PIN-koden.";

  revalidatePath("/ansatt/leder/ansatte");
  return null;
}

export async function setStaffActive(staffId: string, active: boolean) {
  await requireLeder();
  const admin = createSupabaseAdminClient();
  await admin.from("staff_members").update({ active }).eq("id", staffId);
  revalidatePath("/ansatt/leder/ansatte");
}

export async function createTask(_prevState: string | null, formData: FormData) {
  await requireLeder();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "daily") as TaskType;
  const points = Number(formData.get("points") ?? 0);

  if (!title) return "Tittel er påkrevd.";
  if (!Number.isFinite(points) || points < 0) return "Poeng må være et positivt tall.";

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("staff_tasks").insert({
    title,
    description: description || null,
    type,
    points,
  });

  if (error) {
    return error.code === "23505" ? "En oppgave med denne tittelen finnes allerede." : "Kunne ikke opprette oppgaven.";
  }

  revalidatePath("/ansatt/leder/oppgaver");
  revalidatePath("/ansatt/oppgaver");
  return null;
}

export async function setTaskActive(taskId: string, active: boolean) {
  await requireLeder();
  const admin = createSupabaseAdminClient();
  await admin.from("staff_tasks").update({ active }).eq("id", taskId);
  revalidatePath("/ansatt/leder/oppgaver");
  revalidatePath("/ansatt/oppgaver");
}

export async function updateStoreSettings(_prevState: string | null, formData: FormData) {
  await requireLeder();

  const storeLat = Number(formData.get("storeLat"));
  const storeLng = Number(formData.get("storeLng"));
  const radiusMeters = Number(formData.get("radiusMeters"));

  if (!Number.isFinite(storeLat) || storeLat < -90 || storeLat > 90) {
    return "Ugyldig breddegrad.";
  }
  if (!Number.isFinite(storeLng) || storeLng < -180 || storeLng > 180) {
    return "Ugyldig lengdegrad.";
  }
  if (!Number.isFinite(radiusMeters) || radiusMeters < 10 || radiusMeters > 5000) {
    return "Radius må være mellom 10 og 5000 meter.";
  }

  const admin = createSupabaseAdminClient();
  const current = await getStoreSettings(admin);

  const { error } = await admin
    .from("staff_settings")
    .update({
      store_lat: storeLat,
      store_lng: storeLng,
      radius_meters: Math.round(radiusMeters),
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id);

  if (error) return "Kunne ikke lagre innstillingene.";

  revalidatePath("/ansatt/leder/innstillinger");
  return null;
}

export async function resetPointsPeriod(_prevState: string | null, formData: FormData) {
  await requireLeder();
  const label = String(formData.get("label") ?? "");
  const admin = createSupabaseAdminClient();
  await resetPointsPeriodRecord(admin, label);
  revalidatePath("/ansatt/leder/rangering");
  revalidatePath("/ansatt/rangering");
  return null;
}

export async function correctOpenShift(_prevState: string | null, formData: FormData) {
  await requireLeder();

  const shiftId = String(formData.get("shiftId") ?? "");
  const checkoutLocal = String(formData.get("checkoutAt") ?? "");
  if (!shiftId || !checkoutLocal) return "Fyll ut utsjekk-tidspunkt.";

  const checkoutDate = new Date(checkoutLocal);
  if (Number.isNaN(checkoutDate.getTime())) return "Ugyldig tidspunkt.";

  const admin = createSupabaseAdminClient();
  try {
    await correctOpenShiftRecord(admin, shiftId, checkoutDate.toISOString());
  } catch {
    return "Kunne ikke rette økten.";
  }

  revalidatePath("/ansatt/leder/timer");
  return null;
}
