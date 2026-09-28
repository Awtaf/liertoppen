import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { priceShipment, validateCargoAgainstLimit, type ServiceKey } from "@/lib/shipments/pricing";
import { resolveCustomerContext } from "@/lib/customers/context";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Ikke innlogget." }, { status: 401 });
  }

  let body: {
    serviceKey?: ServiceKey;
    postnr?: string;
    pallets?: number;
    hours?: number;
    extraKmOutsideZone?: number;
    expressGuarantee?: boolean;
    eveningWeekend?: boolean;
    night?: boolean;
    carry?: boolean;
    weightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    customerEmail?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Ugyldig forespørsel." }, { status: 400 });
  }

  if (!body.serviceKey || !body.postnr) {
    return NextResponse.json({ message: "Mangler tjeneste eller postnummer." }, { status: 400 });
  }

  const context = await resolveCustomerContext(user, body.customerEmail);
  const maxCargo = context?.rateOverrides.maxCargo;

  const cargoError = validateCargoAgainstLimit(
    { weightKg: body.weightKg, lengthCm: body.lengthCm, widthCm: body.widthCm, heightCm: body.heightCm },
    maxCargo
  );

  try {
    const price = await priceShipment({
      serviceKey: body.serviceKey,
      postnr: body.postnr,
      goods: {
        pallets: body.pallets,
        hours: body.hours,
        extraKmOutsideZone: body.extraKmOutsideZone,
      },
      surcharges: {
        expressGuarantee: body.expressGuarantee,
        eveningWeekend: body.eveningWeekend,
        night: body.night,
        carry: body.carry,
      },
      rateOverrides: context?.rateOverrides,
    });
    return NextResponse.json({ price, maxCargo: maxCargo ?? null, cargoError });
  } catch (error) {
    console.error("Kunne ikke beregne pris:", error);
    return NextResponse.json({ message: "Kunne ikke beregne pris." }, { status: 500 });
  }
}
