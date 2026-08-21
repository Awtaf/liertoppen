"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { priceShipment, type ServiceKey } from "@/lib/shipments/pricing";
import { generateTrackingNumber } from "@/lib/shipments/tracking";
import type { ShipmentStatus } from "@/lib/shipments/shipment";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Ikke innlogget.");
  }
  return user;
}

export async function createShipment(_prevState: string | null, formData: FormData) {
  await requireUser();

  const serviceKey = String(formData.get("serviceKey") ?? "") as ServiceKey;
  const receiverName = String(formData.get("receiverName") ?? "").trim();
  const receiverAddr = String(formData.get("receiverAddr") ?? "").trim();
  const receiverZip = String(formData.get("receiverZip") ?? "").trim();
  const receiverCity = String(formData.get("receiverCity") ?? "").trim();
  const receiverTel = String(formData.get("receiverTel") ?? "").trim();
  const senderName = String(formData.get("senderName") ?? "").trim();
  const senderAddr = String(formData.get("senderAddr") ?? "").trim();
  const senderZip = String(formData.get("senderZip") ?? "").trim();
  const senderCity = String(formData.get("senderCity") ?? "").trim();
  const senderTel = String(formData.get("senderTel") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim().toLowerCase();
  const colli = Number(formData.get("colli") ?? 1);
  const weightKg = Number(formData.get("weightKg") ?? 0);
  const pallets = Number(formData.get("pallets") ?? 1);
  const hours = Number(formData.get("hours") ?? 2);
  const extraKmOutsideZone = Number(formData.get("extraKmOutsideZone") ?? 0);
  const expressGuarantee = formData.get("expressGuarantee") === "on";
  const eveningWeekend = formData.get("eveningWeekend") === "on";
  const night = formData.get("night") === "on";
  const carry = formData.get("carry") === "on";
  const reference = String(formData.get("reference") ?? "").trim();
  const requestedDelivery = String(formData.get("requestedDelivery") ?? "").trim();

  if (!serviceKey || !receiverName || !receiverAddr || !receiverZip || !receiverCity || !senderName) {
    return "Fyll ut alle påkrevde felter.";
  }

  let price;
  try {
    price = await priceShipment({
      serviceKey,
      postnr: receiverZip,
      goods: { pallets, hours, extraKmOutsideZone },
      surcharges: { expressGuarantee, eveningWeekend, night, carry },
    });
  } catch (error) {
    console.error("Kunne ikke beregne pris:", error);
    return "Kunne ikke beregne pris.";
  }

  const admin = createSupabaseAdminClient();

  let customerId: string | null = null;
  if (customerEmail) {
    const { data: existing } = await admin
      .from("customers")
      .select("id")
      .eq("email", customerEmail)
      .limit(1)
      .maybeSingle();

    if (existing) {
      customerId = existing.id as string;
    } else {
      const { data: created, error } = await admin
        .from("customers")
        .insert({ name: senderName, email: customerEmail, phone: senderTel || null })
        .select("id")
        .single();
      if (error || !created) {
        console.error("Kunne ikke opprette kunde:", error);
        return "Kunne ikke opprette kunde.";
      }
      customerId = created.id as string;
    }
  }

  const trackingNumber = await generateTrackingNumber();

  const { data: shipment, error: insertError } = await admin
    .from("shipments")
    .insert({
      tracking_number: trackingNumber,
      customer_id: customerId,
      sender: { name: senderName, addr: senderAddr, zip: senderZip, city: senderCity, tel: senderTel },
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

  revalidatePath("/admin/sendinger");
  redirect(`/admin/sendinger/${shipment.id}`);
}

export async function updateShipmentStatus(shipmentId: string, status: ShipmentStatus) {
  await requireUser();
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("shipments").update({ status }).eq("id", shipmentId);
  if (error) {
    throw new Error("Kunne ikke oppdatere status.");
  }
  await admin.from("shipment_events").insert({ shipment_id: shipmentId, status });

  revalidatePath(`/admin/sendinger/${shipmentId}`);
  revalidatePath("/admin/sendinger");
}
