import { NextResponse } from "next/server";
import { geocodeAddress, getDrivingDistanceKm } from "@/lib/mapbox";
import { calculatePrice, type ServiceType } from "@/lib/pricing";
import { validateQuoteForm, hasErrors, type QuoteFormData } from "@/lib/quote";

export async function POST(request: Request) {
  let body: Partial<QuoteFormData>;
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
  if (hasErrors(errors)) {
    return NextResponse.json(
      { message: "Skjemaet inneholder feil.", errors },
      { status: 400 }
    );
  }

  let pickup, delivery;
  try {
    [pickup, delivery] = await Promise.all([
      geocodeAddress(data.pickupAddress),
      geocodeAddress(data.deliveryAddress),
    ]);
  } catch {
    return NextResponse.json(
      { message: "Kartsøket er ikke tilgjengelig akkurat nå. Prøv igjen om litt." },
      { status: 502 }
    );
  }

  if (!pickup) {
    return NextResponse.json(
      {
        message: "Fant ikke henteadressen. Sjekk at den er skrevet riktig og prøv igjen.",
        field: "pickupAddress",
      },
      { status: 422 }
    );
  }
  if (!delivery) {
    return NextResponse.json(
      {
        message: "Fant ikke leveringsadressen. Sjekk at den er skrevet riktig og prøv igjen.",
        field: "deliveryAddress",
      },
      { status: 422 }
    );
  }

  const distanceKm = await getDrivingDistanceKm(pickup, delivery);
  if (distanceKm === null) {
    return NextResponse.json(
      { message: "Klarte ikke å beregne avstand mellom adressene. Prøv igjen om litt." },
      { status: 502 }
    );
  }

  const breakdown = calculatePrice({
    actualWeightKg: Number(data.weightKg),
    lengthCm: Number(data.lengthCm),
    widthCm: Number(data.widthCm),
    heightCm: Number(data.heightCm),
    distanceKm,
    serviceType: data.serviceType,
  });

  return NextResponse.json({
    pickup,
    delivery,
    distanceKm,
    breakdown,
  });
}
