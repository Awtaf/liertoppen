import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STATUS_STYLES, STATUS_LABELS, SERVICE_LABELS, type Shipment } from "@/lib/shipments/shipment";
import { formatTrackingNumber } from "@/lib/shipments/tracking";

export const metadata: Metadata = {
  title: "Sendinger",
  robots: { index: false, follow: false },
};

export default async function ShipmentsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = createSupabaseAdminClient();
  const { data: shipments, error } = await admin
    .from("shipments")
    .select(
      "id, tracking_number, sender, receiver, service_key, status, price_inc_mva, created_at, customers(name, email, phone)"
    )
    .order("created_at", { ascending: false })
    .returns<Shipment[]>();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Sendinger</h1>
          <p className="mt-1 text-sm text-slate">
            Bookede sendinger med sporingsnummer og fraktlapp.
          </p>
        </div>
        <Link
          href="/admin/sendinger/ny"
          className="inline-flex items-center gap-2 rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-navy hover:bg-green/90"
        >
          Ny sending
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-600">
          Kunne ikke hente sendinger: {error.message}
        </p>
      )}

      {!error && shipments && shipments.length === 0 && (
        <p className="mt-6 text-sm text-slate">Ingen sendinger ennå.</p>
      )}

      {!error && shipments && shipments.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border-light bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-light text-xs font-semibold tracking-wide text-slate uppercase">
                <th className="px-4 py-3">Sporingsnr</th>
                <th className="px-4 py-3">Rute</th>
                <th className="px-4 py-3">Tjeneste</th>
                <th className="px-4 py-3">Pris</th>
                <th className="px-4 py-3">Dato</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-border-light last:border-0 hover:bg-bg-light">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/sendinger/${shipment.id}`}
                      className="font-mono text-sm font-semibold text-navy hover:text-green"
                    >
                      {formatTrackingNumber(shipment.tracking_number)}
                    </Link>
                  </td>
                  <td className="max-w-[260px] px-4 py-3 text-slate">
                    <span className="line-clamp-1">
                      {shipment.sender.city} → {shipment.receiver.city}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy">{SERVICE_LABELS[shipment.service_key]}</td>
                  <td className="px-4 py-3 font-medium text-navy">
                    {shipment.price_inc_mva.toLocaleString("nb-NO")} kr
                  </td>
                  <td className="px-4 py-3 text-slate">
                    {new Date(shipment.created_at).toLocaleDateString("nb-NO")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[shipment.status]}`}
                    >
                      {STATUS_LABELS[shipment.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
