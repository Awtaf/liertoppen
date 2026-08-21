import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Printer, ExternalLink } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SERVICE_LABELS, STATUS_LABELS, STATUS_STYLES, type Shipment, type ShipmentEvent } from "@/lib/shipments/shipment";
import { formatTrackingNumber } from "@/lib/shipments/tracking";

export const metadata: Metadata = {
  title: "Sending",
  robots: { index: false, follow: false },
};

export default async function PortalShipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/portal/login");
  }

  const admin = createSupabaseAdminClient();
  const { data: customer } = await admin.from("customers").select("id").eq("user_id", user.id).maybeSingle();
  if (!customer) {
    redirect("/portal/login");
  }

  const { data: shipment } = await admin
    .from("shipments")
    .select(
      "id, tracking_number, customer_id, sender, receiver, goods, service_key, zone_id, requested_delivery, price_breakdown, price_ex_mva, price_inc_mva, status, reference, notes, created_at"
    )
    .eq("id", id)
    .maybeSingle()
    .returns<Shipment>();

  // Eierskap: en kunde kan kun se sine egne sendinger.
  if (!shipment || shipment.customer_id !== customer.id) {
    notFound();
  }

  const { data: events } = await admin
    .from("shipment_events")
    .select("id, shipment_id, status, note, occurred_at")
    .eq("shipment_id", id)
    .order("occurred_at", { ascending: true })
    .returns<ShipmentEvent[]>();

  return (
    <div>
      <Link href="/portal" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-navy">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Tilbake til mine sendinger
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-navy">{formatTrackingNumber(shipment.tracking_number)}</h1>
          <p className="mt-1 text-sm text-slate">Booket {new Date(shipment.created_at).toLocaleString("nb-NO")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`/sporing/${shipment.tracking_number}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-green hover:text-green"
          >
            <ExternalLink aria-hidden className="h-4 w-4" />
            Sporingsside
          </a>
          <a
            href={`/api/sendinger/${shipment.id}/label`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-green px-4 py-2.5 text-sm font-semibold text-navy hover:bg-green/90"
          >
            <Printer aria-hidden className="h-4 w-4" />
            Fraktlapp
          </a>
          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[shipment.status]}`}>
            {STATUS_LABELS[shipment.status]}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Til</h2>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="font-semibold text-navy">{shipment.receiver.name}</div>
            <div className="text-slate">{shipment.receiver.addr}</div>
            <div className="text-slate">
              {shipment.receiver.zip} {shipment.receiver.city}
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Gods</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Tjeneste</dt>
              <dd className="font-medium text-navy">{SERVICE_LABELS[shipment.service_key]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Kolli</dt>
              <dd className="font-medium text-navy">{shipment.goods.colli}</dd>
            </div>
            {shipment.requested_delivery && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate">Ønsket levering</dt>
                <dd className="font-medium text-navy">{shipment.requested_delivery}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-green/30 bg-green/5 p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Pris</h2>
          <p className="mt-2 text-2xl font-bold text-navy">{shipment.price_inc_mva.toLocaleString("nb-NO")} kr</p>
          <p className="text-xs text-slate">inkl. mva</p>
          <dl className="mt-4 space-y-1.5 border-t border-green/20 pt-4 text-sm">
            {shipment.price_breakdown.lines.map((line, i) => (
              <div key={i} className="flex justify-between gap-4">
                <dt className="text-slate">{line.label}</dt>
                <dd className="font-medium text-navy">{line.amountExMva.toLocaleString("nb-NO")} kr</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Tidslinje</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {(events ?? []).map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-4 border-b border-border-light pb-2 last:border-0">
                <span className="font-medium text-navy">{STATUS_LABELS[event.status]}</span>
                <span className="text-slate">{new Date(event.occurred_at).toLocaleString("nb-NO")}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
