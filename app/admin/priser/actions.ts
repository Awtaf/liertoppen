"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Ikke innlogget.");
  }
}

function num(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function updatePrices(_prevState: string | null, formData: FormData) {
  await requireUser();
  const admin = createSupabaseAdminClient();

  const zoneIds = formData.getAll("zoneId").map(String);
  for (const zoneId of zoneIds) {
    const expressPrice = num(formData, `zone_express_${zoneId}`);
    const perStopRaw = formData.get(`zone_perstop_${zoneId}`);
    const perStop = perStopRaw === "" ? null : num(formData, `zone_perstop_${zoneId}`);
    if (expressPrice === null) continue;
    const { error } = await admin
      .from("zones")
      .update({ express_start_price: expressPrice, per_stop_price: perStop })
      .eq("id", zoneId);
    if (error) return "Kunne ikke lagre soner: " + error.message;
  }

  const { data: services, error: servicesError } = await admin.from("services").select("key, config");
  if (servicesError) return "Kunne ikke hente tjenester: " + servicesError.message;

  for (const service of services ?? []) {
    const config = { ...(service.config as Record<string, number>) };
    let changed = false;
    for (const field of Object.keys(config)) {
      const inputName = `service_${service.key}_${field}`;
      const value = num(formData, inputName);
      if (value !== null && value !== config[field]) {
        config[field] = value;
        changed = true;
      }
    }
    if (changed) {
      const { error } = await admin.from("services").update({ config }).eq("key", service.key);
      if (error) return "Kunne ikke lagre tjenester: " + error.message;
    }
  }

  const surchargeKeys = formData.getAll("surchargeKey").map(String);
  for (const key of surchargeKeys) {
    const value = num(formData, `surcharge_${key}`);
    if (value === null) continue;
    const { error } = await admin.from("surcharges").update({ value }).eq("key", key);
    if (error) return "Kunne ikke lagre tillegg: " + error.message;
  }

  revalidatePath("/admin/priser");
  return "Priser lagret.";
}
