"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeadStatus } from "@/lib/leads";

export async function login(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin/leads");

  if (!email || !password) {
    return "Fyll ut e-post og passord.";
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return "Feil e-post eller passord.";
  }

  redirect(redirectTo);
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Ikke innlogget.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    throw new Error("Kunne ikke oppdatere status.");
  }

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}
