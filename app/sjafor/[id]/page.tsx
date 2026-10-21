import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Phone, MapPin, Printer } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { StatusButton } from "@/components/sjafor/StatusButton";
import { SERVICE_LABELS, STATUS_LABELS, STATUS_STYLES, type Shipment } from "@/lib/shipments/shipment";
import { formatTrackingNumber } from "@/lib/shipments/tracking";

export const metadata: Metadata = {
  title: "Sending",
  robots: { index: false, follow: false },
};

function mapsUrl(addr: string, zip: string, city: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addr}, ${zip} ${city}`)}`;
}

function telUrl(tel: string) {
  return `tel:${tel.replace(/\s+/g, "")}`;
}

export default async function SjaforShipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/admin/login?redirectTo=/sjafor/${id}`);
  }

  const admin = createSupabaseAdminClient();
  const { data: shipment } = await admin
    .from("shipments")
    .select(
      "id, tracking_number, sender, receiver, goods, service_key, requested_delivery, status, reference, notes, created_at"
    )
    .eq("id", id)
    .maybeSingle()
    .returns<Shipment>();

  if (!shipment) {
    notFound();
  }

  return (
    <div>
      <Link href="/sjafor" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-navy">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Min rute
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-slate">{formatTrackingNumber(shipment.tracking_number)}</p>
          <h1 className="mt-1 text-xl font-bold text-navy">{SERVICE_LABELS[shipment.service_key]}</h1>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[shipment.status]}`}>
          {STATUS_LABELS[shipment.status]}
        </span>
      </div>

      <div className="mt-5">
        <StatusButton shipmentId={shipment.id} status={shipment.status} />
      </div>

      <div className="mt-6 rounded-2xl border border-border-light bg-white p-5">
        <h2 className="text-xs font-bold tracking-wide text-slate uppercase">Hent hos</h2>
        <p className="mt-2 text-base font-semibold text-navy">{shipment.sender.name}</p>
        <p className="text-sm text-slate">{shipment.sender.addr}</p>
        <p className="text-sm text-slate">
          {shipment.sender.zip} {shipment.sender.city}
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href={mapsUrl(shipment.sender.addr, shipment.sender.zip, shipment.sender.city)}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-light py-2.5 text-sm font-semibold text-navy active:border-green"
          >
            <MapPin aria-hidden className="h-4 w-4" />
            Kart
          </a>
          {shipment.sender.tel && (
            <a
              href={telUrl(shipment.sender.tel)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-light py-2.5 text-sm font-semibold text-navy active:border-green"
            >
              <Phone aria-hidden className="h-4 w-4" />
              Ring
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border-light bg-white p-5">
        <h2 className="text-xs font-bold tracking-wide text-slate uppercase">Lever hos</h2>
        <p className="mt-2 text-base font-semibold text-navy">{shipment.receiver.name}</p>
        <p className="text-sm text-slate">{shipment.receiver.addr}</p>
        <p className="text-sm text-slate">
          {shipment.receiver.zip} {shipment.receiver.city}
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href={mapsUrl(shipment.receiver.addr, shipment.receiver.zip, shipment.receiver.city)}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-light py-2.5 text-sm font-semibold text-navy active:border-green"
          >
            <MapPin aria-hidden className="h-4 w-4" />
            Kart
          </a>
          {shipment.receiver.tel && (
            <a
              href={telUrl(shipment.receiver.tel)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-light py-2.5 text-sm font-semibold text-navy active:border-green"
            >
              <Phone aria-hidden className="h-4 w-4" />
              Ring
            </a>
          )}
        </div>
      </div>

      {shipment.notes && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xs font-bold tracking-wide text-amber-800 uppercase">Leveringsinstruks</h2>
          <p className="mt-2 text-base text-amber-900">{shipment.notes}</p>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border-light bg-white p-5">
        <h2 className="text-xs font-bold tracking-wide text-slate uppercase">Gods</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate">Kolli</dt>
            <dd className="font-medium text-navy">{shipment.goods.colli}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate">Vekt</dt>
            <dd className="font-medium text-navy">{shipment.goods.weightKg} kg</dd>
          </div>
          {shipment.requested_delivery && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Ønsket levering</dt>
              <dd className="font-medium text-navy">{shipment.requested_delivery}</dd>
            </div>
          )}
          {shipment.reference && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Referanse</dt>
              <dd className="font-medium text-navy">{shipment.reference}</dd>
            </div>
          )}
        </dl>
      </div>

      <a
        href={`/api/sendinger/${shipment.id}/label`}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-border-light bg-white py-3 text-sm font-semibold text-navy active:border-green"
      >
        <Printer aria-hidden className="h-4 w-4" />
        Vis fraktlapp
      </a>
    </div>
  );
}
