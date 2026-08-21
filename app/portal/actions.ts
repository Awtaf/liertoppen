"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateInviteToken } from "@/lib/customers/invite";
import { priceShipment, type ServiceKey } from "@/lib/shipments/pricing";
import { generateTrackingNumber } from "@/lib/shipments/tracking";

export async function portalLogin(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/portal");

  if (!email || !password) {
    return "Fyll ut e-post og passord.";
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return "Feil e-post eller passord.";
  }

  if (data.user.app_metadata?.role !== "customer") {
    await supabase.auth.signOut();
    return "Denne kontoen har ikke tilgang til kundeportalen.";
  }

  redirect(redirectTo);
}

export async function portalLogout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/portal/login");
}

export async function completeOnboarding(_prevState: string | null, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return "Ugyldig lenke.";
  }
  if (password.length < 8) {
    return "Passordet må være minst 8 tegn.";
  }
  if (password !== confirmPassword) {
    return "Passordene er ikke like.";
  }

  const validation = await validateInviteToken(token);
  if (!validation.valid) {
    return validation.reason === "expired"
      ? "Denne lenken har utløpt. Be om en ny."
      : validation.reason === "used"
        ? "Denne lenken er allerede brukt."
        : "Fant ikke denne lenken.";
  }

  const { customer, invite } = validation;
  const admin = createSupabaseAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: customer.email,
    password,
    email_confirm: true,
    app_metadata: { role: "customer" },
  });

  if (createError || !created.user) {
    console.error("Kunne ikke opprette kundebruker:", createError);
    return "Kunne ikke opprette bruker. Ta kontakt med oss.";
  }

  const { error: linkError } = await admin
    .from("customers")
    .update({ user_id: created.user.id })
    .eq("id", customer.id);
  if (linkError) {
    console.error("Kunne ikke koble kunde til bruker:", linkError);
    return "Noe gikk galt. Ta kontakt med oss.";
  }

  await admin.from("customer_invites").update({ used_at: new Date().toISOString() }).eq("id", invite.id);

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: customer.email,
    password,
  });
  if (signInError) {
    redirect("/portal/login");
  }

  redirect("/portal");
}

async function requireCustomer() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "customer") {
    throw new Error("Ikke innlogget som kunde.");
  }

  const admin = createSupabaseAdminClient();
  const { data: customer } = await admin
    .from("customers")
    .select("id, name, email, phone")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!customer) {
    throw new Error("Fant ingen kunde koblet til denne kontoen.");
  }
  return customer;
}

export async function createCustomerShipment(_prevState: string | null, formData: FormData) {
  const customer = await requireCustomer();

  const serviceKey = String(formData.get("serviceKey") ?? "") as ServiceKey;
  const receiverName = String(formData.get("receiverName") ?? "").trim();
  const receiverAddr = String(formData.get("receiverAddr") ?? "").trim();
  const receiverZip = String(formData.get("receiverZip") ?? "").trim();
  const receiverCity = String(formData.get("receiverCity") ?? "").trim();
  const receiverTel = String(formData.get("receiverTel") ?? "").trim();
  const senderAddr = String(formData.get("senderAddr") ?? "").trim();
  const senderZip = String(formData.get("senderZip") ?? "").trim();
  const senderCity = String(formData.get("senderCity") ?? "").trim();
  const colli = Number(formData.get("colli") ?? 1);
  const weightKg = Number(formData.get("weightKg") ?? 0);
  const pallets = Number(formData.get("pallets") ?? 1);
  const hours = Number(formData.get("hours") ?? 2);
  const expressGuarantee = formData.get("expressGuarantee") === "on";
  const eveningWeekend = formData.get("eveningWeekend") === "on";
  const night = formData.get("night") === "on";
  const carry = formData.get("carry") === "on";
  const reference = String(formData.get("reference") ?? "").trim();
  const requestedDelivery = String(formData.get("requestedDelivery") ?? "").trim();

  if (!serviceKey || !receiverName || !receiverAddr || !receiverZip || !receiverCity) {
    return "Fyll ut alle påkrevde felter.";
  }

  let price;
  try {
    price = await priceShipment({
      serviceKey,
      postnr: receiverZip,
      goods: { pallets, hours },
      surcharges: { expressGuarantee, eveningWeekend, night, carry },
    });
  } catch (error) {
    console.error("Kunne ikke beregne pris:", error);
    return "Kunne ikke beregne pris.";
  }

  if (serviceKey === "EXPRESS" && !price.zone) {
    return "Denne mottakeradressen er utenfor våre faste soner. Ta kontakt med oss direkte for et tilbud.";
  }

  const admin = createSupabaseAdminClient();
  const trackingNumber = await generateTrackingNumber();

  const { data: shipment, error: insertError } = await admin
    .from("shipments")
    .insert({
      tracking_number: trackingNumber,
      customer_id: customer.id,
      sender: { name: customer.name, addr: senderAddr, zip: senderZip, city: senderCity, tel: customer.phone ?? "" },
      receiver: { name: receiverName, addr: receiverAddr, zip: receiverZip, city: receiverCity, tel: receiverTel },
      goods: {
        colli,
        weightKg,
        pallets: serviceKey === "PALLET" ? pallets : undefined,
        hours: serviceKey === "HOURLY" ? hours : undefined,
      },
      service_key: serviceKey,
      zone_id: price.zone?.id ?? null,
      requested_delivery: requestedDelivery || null,
      price_breakdown: price,
      price_ex_mva: price.subtotalExMva,
      price_inc_mva: price.totalIncMva,
      status: "BOOKET",
      reference: reference || null,
    })
    .select("id")
    .single();

  if (insertError || !shipment) {
    console.error("Kunne ikke opprette sending:", insertError);
    return "Kunne ikke opprette sending.";
  }

  await admin.from("shipment_events").insert({ shipment_id: shipment.id, status: "BOOKET" });

  revalidatePath("/portal");
  redirect(`/portal/${shipment.id}`);
}
