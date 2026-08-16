import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAdminNotification } from "@/lib/mailer";
import {
  validateQuoteForm,
  hasErrors,
  type QuoteFormData,
  type QuoteResult,
} from "@/lib/quote";
import type { ServiceType } from "@/lib/pricing";

type LeadRequestBody = Partial<QuoteFormData> & { quote?: QuoteResult };

export async function POST(request: Request) {
  let body: LeadRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Ugyldig forespørsel." }, { status: 400 });
  }

  const data: QuoteFormData = {
    pickupAddress: body.pickupAddress ?? "",
    deliveryAddress: body.deliveryAddress ?? "",
    weightKg: body.weightKg ?? "",
    lengthCm: body.lengthCm ?? "",
    widthCm: body.widthCm ?? "",
    heightCm: body.heightCm ?? "",
    colli: body.colli ?? "1",
    serviceType: (body.serviceType as ServiceType) ?? "standard",
    customerName: body.customerName ?? "",
    customerEmail: body.customerEmail ?? "",
    customerPhone: body.customerPhone ?? "",
  };

  const errors = validateQuoteForm(data);
  if (hasErrors(errors) || !body.quote) {
    return NextResponse.json(
      { message: "Skjemaet inneholder feil.", errors },
      { status: 400 }
    );
  }

  const { quote } = body;
  const supabase = createSupabaseAdminClient();

  const email = data.customerEmail.trim().toLowerCase();

  const { data: existingCustomer, error: lookupError } = await supabase
    .from("customers")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("Kunne ikke slå opp kunde:", lookupError);
    return NextResponse.json(
      { message: "Noe gikk galt. Prøv igjen." },
      { status: 500 }
    );
  }

  let customerId = existingCustomer?.id as string | undefined;

  if (!customerId) {
    const { data: newCustomer, error: insertCustomerError } = await supabase
      .from("customers")
      .insert({
        name: data.customerName.trim(),
        email,
        phone: data.customerPhone.trim(),
      })
      .select("id")
      .single();

    if (insertCustomerError || !newCustomer) {
      console.error("Kunne ikke opprette kunde:", insertCustomerError);
      return NextResponse.json(
        { message: "Noe gikk galt. Prøv igjen." },
        { status: 500 }
      );
    }

    customerId = newCustomer.id as string;
  }

  const { data: lead, error: insertLeadError } = await supabase
    .from("leads")
    .insert({
      customer_id: customerId,
      pickup_address: data.pickupAddress.trim(),
      pickup_lat: quote.pickup.lat,
      pickup_lng: quote.pickup.lng,
      delivery_address: data.deliveryAddress.trim(),
      delivery_lat: quote.delivery.lat,
      delivery_lng: quote.delivery.lng,
      weight_kg: Number(data.weightKg),
      length_cm: Number(data.lengthCm),
      width_cm: Number(data.widthCm),
      height_cm: Number(data.heightCm),
      colli: Number(data.colli),
      service_type: data.serviceType,
      distance_km: quote.distanceKm,
      price_estimate: quote.breakdown.total,
      price_breakdown: quote.breakdown,
      status: "Ny",
    })
    .select("id")
    .single();

  if (insertLeadError || !lead) {
    console.error("Kunne ikke opprette lead:", insertLeadError);
    return NextResponse.json(
      { message: "Noe gikk galt. Prøv igjen." },
      { status: 500 }
    );
  }

  const summaryLines = [
    `Navn: ${data.customerName}`,
    `E-post: ${email}`,
    `Telefon: ${data.customerPhone}`,
    `Fra: ${data.pickupAddress}`,
    `Til: ${data.deliveryAddress}`,
    `Avstand: ${quote.distanceKm.toFixed(1)} km`,
    `Vekt: ${data.weightKg} kg (${data.lengthCm}×${data.widthCm}×${data.heightCm} cm, ${data.colli} kolli)`,
    `Tjeneste: ${data.serviceType === "ekspress" ? "Ekspress" : "Standard"}`,
    `Estimert pris: ${quote.breakdown.total} kr`,
  ];

  await sendAdminNotification({
    subject: `Ny tilbudsforespørsel fra ${data.customerName}`,
    text: summaryLines.join("\n"),
    replyTo: email,
  });

  return NextResponse.json({ message: "Forespørsel mottatt.", leadId: lead.id });
}
