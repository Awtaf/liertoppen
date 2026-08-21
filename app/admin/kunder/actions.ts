"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCustomerInvite } from "@/lib/customers/invite";
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
