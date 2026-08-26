"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifySecret } from "@/lib/staff/pin";
import {
  STAFF_SESSION_COOKIE,
  STAFF_SESSION_MAX_AGE_SECONDS,
  createStaffToken,
  staffSessionSecret,
} from "@/lib/staff/session";
import { requireStaff } from "@/lib/staff/auth";
import { performCheckIn, performCheckOut } from "@/lib/staff/shifts";
import { completeTask as completeTaskRecord } from "@/lib/staff/tasks";
import type { StaffMember } from "@/lib/staff/types";

export async function staffLogin(_prevState: string | null, formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim().toLowerCase();
  const secret = String(formData.get("secret") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");

  if (!identifier || !secret) {
    return "Fyll ut brukernavn/e-post og PIN/passord.";
  }

  const admin = createSupabaseAdminClient();

  // Two separate, parameterized lookups instead of a single .or() filter —
  // building a raw PostgREST OR-filter string from user input would let a
  // comma/operator in the identifier field escape the intended filter.
  const { data: byUsername } = await admin
    .from("staff_members")
    .select("*")
    .eq("username", identifier)
    .eq("active", true)
    .maybeSingle();

  const member: StaffMember | null =
    (byUsername as StaffMember | null) ??
    ((
      await admin
        .from("staff_members")
        .select("*")
        .eq("email", identifier)
        .eq("active", true)
        .maybeSingle()
    ).data as StaffMember | null);

  if (!member) {
    return "Feil brukernavn/e-post eller kode.";
  }

  const memberWithSecrets = member as StaffMember & {
    pin_hash: string | null;
    password_hash: string | null;
  };

  const matches =
    (memberWithSecrets.pin_hash && verifySecret(secret, memberWithSecrets.pin_hash)) ||
    (memberWithSecrets.password_hash && verifySecret(secret, memberWithSecrets.password_hash));

  if (!matches) {
    return "Feil brukernavn/e-post eller kode.";
  }

  const now = Date.now();
  const token = await createStaffToken(
    {
      sub: member.id,
      role: member.role,
      name: member.name,
      iat: now,
      exp: now + STAFF_SESSION_MAX_AGE_SECONDS * 1000,
    },
    staffSessionSecret()
  );

  const cookieStore = await cookies();
  cookieStore.set(STAFF_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/ansatt",
    maxAge: STAFF_SESSION_MAX_AGE_SECONDS,
  });

  redirect(redirectTo || (member.role === "leder" ? "/ansatt/leder" : "/ansatt"));
}

export async function staffLogout() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: STAFF_SESSION_COOKIE, path: "/ansatt" });
  redirect("/ansatt/logg-inn");
}

export async function checkIn(lat: number, lng: number) {
  const session = await requireStaff();
  const admin = createSupabaseAdminClient();
  const result = await performCheckIn(admin, session.sub, lat, lng);
  revalidatePath("/ansatt");
  revalidatePath("/ansatt/timer");
  return result;
}

export async function checkOut(lat: number, lng: number) {
  const session = await requireStaff();
  const admin = createSupabaseAdminClient();
  const result = await performCheckOut(admin, session.sub, lat, lng);
  revalidatePath("/ansatt");
  revalidatePath("/ansatt/timer");
  return result;
}

export async function completeTask(taskId: string) {
  const session = await requireStaff();
  const admin = createSupabaseAdminClient();
  const result = await completeTaskRecord(admin, session.sub, taskId);
  revalidatePath("/ansatt/oppgaver");
  revalidatePath("/ansatt/rangering");
  return result;
}
