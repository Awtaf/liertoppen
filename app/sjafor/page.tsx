import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STATUS_STYLES, STATUS_LABELS, SERVICE_LABELS, type Shipment } from "@/lib/shipments/shipment";
import { formatTrackingNumber } from "@/lib/shipments/tracking";

export const metadata: Metadata = {
  title: "Min rute",
  robots: { index: false, follow: false },
};

export default async function SjaforHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login?redirectTo=/sjafor");
  }

  const admin = createSupabaseAdminClient();
  const { data: shipments, error } = await admin
    .from("shipments")
    .select("id, tracking_number, sender, receiver, service_key, status, requested_delivery, created_at")
    .neq("status", "LEVERT")
    .neq("status", "KANSELLERT")
    .order("created_at", { ascending: true })
    .returns<Shipment[]>();

  return (
    <div>
      <h1 className="text-xl font-bold text-navy">Min rute</h1>
      <p className="mt-1 text-sm text-slate">
        {shipments && shipments.length > 0
          ? `${shipments.length} ${shipments.length === 1 ? "sending" : "sendinger"} på ruten, eldste først.`
          : "Ingenting på ruten akkurat nå."}
      </p>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Klarte ikke å hente ruten akkurat nå. Prøv å laste siden på nytt.
        </p>
      )}

      {!error && (!shipments || shipments.length === 0) && (
        <div className="mt-8 rounded-xl border border-border-light bg-white p-6 text-center text-sm text-slate">
          Ingen aktive sendinger. Nye sendinger dukker opp her automatisk.
        </div>
      )}

      <div className="mt-6 space-y-3">
        {(shipments ?? []).map((shipment) => (
          <Link
            key={shipment.id}
            href={`/sjafor/${shipment.id}`}
            className="block rounded-2xl border border-border-light bg-white p-4 active:border-green"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-slate">{formatTrackingNumber(shipment.tracking_number)}</p>
                <p className="mt-1 text-base font-bold text-navy">
                  {shipment.sender.city} → {shipment.receiver.city}
                </p>
                <p className="mt-0.5 text-sm text-slate">{shipment.receiver.name}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[shipment.status]}`}
              >
                {STATUS_LABELS[shipment.status]}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-light pt-3 text-xs text-slate">
              <span>{SERVICE_LABELS[shipment.service_key]}</span>
              {shipment.requested_delivery && <span>{shipment.requested_delivery}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
