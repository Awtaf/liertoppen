import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CustomerRateOverrides } from "@/lib/shipments/pricing";

export type CustomerContext = {
  customerId: string;
  rateOverrides: CustomerRateOverrides;
};

/**
 * Resolves which customer a booking/quote is for, and their private rate
 * overrides — from the logged-in session for a customer (portal), or from
 * an email the owner typed in (admin, only if that customer already
 * exists — a quote preview must never create a new customer record).
 */
export async function resolveCustomerContext(
  user: User,
  customerEmail?: string
): Promise<CustomerContext | null> {
  const admin = createSupabaseAdminClient();

  if (user.app_metadata?.role === "customer") {
    const { data } = await admin
      .from("customers")
      .select("id, rate_overrides")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return null;
    return { customerId: data.id, rateOverrides: (data.rate_overrides as CustomerRateOverrides) ?? {} };
  }

  if (customerEmail) {
    const { data } = await admin
      .from("customers")
      .select("id, rate_overrides")
      .eq("email", customerEmail.trim().toLowerCase())
      .maybeSingle();
    if (!data) return null;
    return { customerId: data.id, rateOverrides: (data.rate_overrides as CustomerRateOverrides) ?? {} };
  }

  return null;
}
