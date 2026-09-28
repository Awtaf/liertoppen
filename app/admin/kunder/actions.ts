"use server";

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
