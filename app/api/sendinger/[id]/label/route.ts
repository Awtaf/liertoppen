import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateLabelPdf, generateLabelPdfA4 } from "@/lib/shipments/label";
import type { Shipment } from "@/lib/shipments/shipment";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Ikke innlogget." }, { status: 401 });
  }

  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") === "a4" ? "a4" : "thermal";
  const admin = createSupabaseAdminClient();
  const { data: shipment } = await admin
    .from("shipments")
    .select(
      "id, tracking_number, customer_id, sender, receiver, goods, service_key, zone_id, requested_delivery, price_breakdown, price_ex_mva, price_inc_mva, status, reference, notes, created_at"
    )
    .eq("id", id)
    .maybeSingle()
    .returns<Shipment>();

  if (!shipment) {
    return NextResponse.json({ message: "Fant ikke sendingen." }, { status: 404 });
  }

  // Eiere ser alt. Kunder kan kun hente etiketten for sine egne sendinger —
  // uten dette kunne en innlogget kunde gjettet på en annen sendings-id.
  if (user.app_metadata?.role === "customer") {
    const { data: customer } = await admin.from("customers").select("id").eq("user_id", user.id).maybeSingle();
    if (!customer || shipment.customer_id !== customer.id) {
      return NextResponse.json({ message: "Fant ikke sendingen." }, { status: 404 });
    }
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = format === "a4" ? await generateLabelPdfA4(shipment) : await generateLabelPdf(shipment);
  } catch (error) {
    console.error("Kunne ikke generere fraktlapp:", error);
    return NextResponse.json({ message: "Kunne ikke generere fraktlapp." }, { status: 500 });
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="fraktlapp-${shipment.tracking_number}${format === "a4" ? "-a4" : ""}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
