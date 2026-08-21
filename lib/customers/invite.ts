import { randomBytes } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const INVITE_TTL_DAYS = 7;

export type CustomerInvite = {
  id: string;
  customer_id: string;
  token: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
};

/** Genererer en ny, engangs onboarding-lenke for en kunde. Eldre, ubrukte
 * invitasjoner for samme kunde blir stående (harmløst — kun én kan brukes,
 * siden onboarding setter customers.user_id ved første vellykkede bruk). */
export async function createCustomerInvite(customerId: string): Promise<string> {
  const admin = createSupabaseAdminClient();
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await admin.from("customer_invites").insert({
    customer_id: customerId,
    token,
    expires_at: expiresAt,
  });
  if (error) {
    throw new Error("Kunne ikke opprette onboarding-lenke: " + error.message);
  }
  return token;
}

export type InviteValidation =
  | { valid: true; invite: CustomerInvite; customer: { id: string; name: string; email: string } }
  | { valid: false; reason: "not_found" | "expired" | "used" };

export async function validateInviteToken(token: string): Promise<InviteValidation> {
  const admin = createSupabaseAdminClient();
  const { data: invite } = await admin
    .from("customer_invites")
    .select("id, customer_id, token, created_at, expires_at, used_at")
    .eq("token", token)
    .maybeSingle()
    .returns<CustomerInvite>();

  if (!invite) return { valid: false, reason: "not_found" };
  if (invite.used_at) return { valid: false, reason: "used" };
  if (new Date(invite.expires_at) < new Date()) return { valid: false, reason: "expired" };

  const { data: customer } = await admin
    .from("customers")
    .select("id, name, email")
    .eq("id", invite.customer_id)
    .maybeSingle();

  if (!customer) return { valid: false, reason: "not_found" };

  return { valid: true, invite, customer };
}
