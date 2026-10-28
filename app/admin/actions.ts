"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { companyInfo } from "@/config/company";
import type { LeadStatus } from "@/lib/leads";

export async function login(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin/leads");

  if (!email || !password) {
    return "Fyll ut e-post og passord.";
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return "Feil e-post eller passord.";
  }

  if (data.user.app_metadata?.role === "customer") {
    await supabase.auth.signOut();
    return "Denne kontoen har ikke tilgang til admin-panelet.";
  }

  redirect(redirectTo);
}

/** Sender en tilbakestillingslenke hvis e-posten finnes — svarer alltid
 * likt uansett, så vi ikke lekker hvilke e-poster som har konto. */
export async function requestPasswordReset(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return "Fyll ut e-post.";
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${companyInfo.url}/admin/tilbakestill-passord`,
  });

  return "Hvis denne e-posten finnes hos oss, har vi sendt en lenke for å tilbakestille passordet. Sjekk også søppelpost.";
}

/** Krever en aktiv gjenopprettingsøkt — se app/admin/tilbakestill-passord/page.tsx,
 * som bytter koden fra lenken i e-posten mot en slik økt før dette skjemaet vises. */
export async function updatePassword(_prevState: string | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return "Passordet må være minst 8 tegn.";
  }
  if (password !== confirmPassword) {
    return "Passordene er ikke like.";
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return "Økten har utløpt. Be om en ny tilbakestillingslenke.";
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Kunne ikke oppdatere passord:", error);
    return "Kunne ikke oppdatere passord. Prøv igjen.";
  }

  redirect("/admin/leads");
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
