"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createCustomerInvite } from "@/lib/customers/invite";
import { fetchZones, type CustomerRateOverrides } from "@/lib/shipments/pricing";
import { companyInfo } from "@/config/company";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Ikke innlogget.");
  }
}

/** Oppretter en kunde uten at det må finnes et lead eller en sending først —
 * for kunder som skal logge inn og booke selv fra dag én. */
export async function createCustomer(_prevState: string | null, formData: FormData) {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !email) {
    return "Navn og e-post er påkrevd.";
  }

  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin.from("customers").select("id").eq("email", email).maybeSingle();
  if (existing) {
    redirect(`/admin/kunder/${existing.id}`);
  }

  const { data: created, error } = await admin
    .from("customers")
    .insert({ name, email, phone: phone || null })
    .select("id")
    .single();
  if (error || !created) {
    console.error("Kunne ikke opprette kunde:", error);
    return "Kunne ikke opprette kunde.";
  }

  revalidatePath("/admin/kunder");
  redirect(`/admin/kunder/${created.id}`);
}

export async function generateOnboardingLink(customerId: string): Promise<string> {
  await requireUser();
  const token = await createCustomerInvite(customerId);
  revalidatePath(`/admin/kunder/${customerId}`);
  return `${companyInfo.url}/portal/velkommen?token=${token}`;
}

export async function updateCustomerRateOverrides(_prevState: string | null, formData: FormData) {
  await requireUser();

  const customerId = String(formData.get("customerId") ?? "");
  if (!customerId) return "Mangler kunde.";

  const zones = await fetchZones();
  const sameDayRouteZonePerStop: Record<string, number> = {};
  for (const zone of zones) {
    const raw = formData.get(`zonePerStop_${zone.code}`);
    if (raw !== null && String(raw).trim() !== "") {
      const value = Number(raw);
      if (Number.isFinite(value)) sameDayRouteZonePerStop[String(zone.code)] = value;
    }
  }

  const maxCargo: CustomerRateOverrides["maxCargo"] = {};
  const weightKg = formData.get("maxWeightKg");
  const lengthCm = formData.get("maxLengthCm");
  const widthCm = formData.get("maxWidthCm");
  const heightCm = formData.get("maxHeightCm");
  if (weightKg && String(weightKg).trim() !== "") maxCargo.weightKg = Number(weightKg);
  if (lengthCm && String(lengthCm).trim() !== "") maxCargo.lengthCm = Number(lengthCm);
  if (widthCm && String(widthCm).trim() !== "") maxCargo.widthCm = Number(widthCm);
  if (heightCm && String(heightCm).trim() !== "") maxCargo.heightCm = Number(heightCm);

  const rateOverrides: CustomerRateOverrides = {
    ...(Object.keys(sameDayRouteZonePerStop).length > 0 ? { sameDayRouteZonePerStop } : {}),
    ...(Object.keys(maxCargo).length > 0 ? { maxCargo } : {}),
  };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("customers").update({ rate_overrides: rateOverrides }).eq("id", customerId);
  if (error) {
    console.error("Kunne ikke lagre kundeavtale:", error);
    return "Kunne ikke lagre.";
  }

  revalidatePath(`/admin/kunder/${customerId}`);
  return "Lagret.";
}
