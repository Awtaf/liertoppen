import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STATUS_STYLES, STATUS_LABELS, SERVICE_LABELS, type Shipment } from "@/lib/shipments/shipment";
import { formatTrackingNumber } from "@/lib/shipments/tracking";

export const metadata: Metadata = {
  title: "Mine sendinger",
  robots: { index: false, follow: false },
};

export default async function PortalHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/portal/login");
  }

  const admin = createSupabaseAdminClient();
  const { data: customer } = await admin.from("customers").select("id, name").eq("user_id", user.id).maybeSingle();
  if (!customer) {
    redirect("/portal/login");
  }

  const { data: shipments } = await admin
    .from("shipments")
    .select("id, tracking_number, receiver, service_key, status, price_inc_mva, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .returns<Shipment[]>();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Mine sendinger</h1>
          <p className="mt-1 text-sm text-slate">Velkommen, {customer.name}.</p>
        </div>
        <Link
          href="/portal/ny"
          className="inline-flex items-center gap-2 rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-navy hover:bg-green/90"
        >
          Ny sending
        </Link>
      </div>

      {(!shipments || shipments.length === 0) && (
        <p className="mt-8 text-sm text-slate">Ingen sendinger ennå.</p>
      )}

      {shipments && shipments.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border-light bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-light text-xs font-semibold tracking-wide text-slate uppercase">
                <th className="px-4 py-3">Sporingsnr</th>
                <th className="px-4 py-3">Til</th>
                <th className="px-4 py-3">Tjeneste</th>
                <th className="px-4 py-3">Pris</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-border-light last:border-0 hover:bg-bg-light">
                  <td className="px-4 py-3">
                    <Link href={`/portal/${shipment.id}`} className="font-mono text-sm font-semibold text-navy hover:text-green">
                      {formatTrackingNumber(shipment.tracking_number)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate">{shipment.receiver.city}</td>
                  <td className="px-4 py-3 text-navy">{SERVICE_LABELS[shipment.service_key]}</td>
                  <td className="px-4 py-3 font-medium text-navy">{shipment.price_inc_mva.toLocaleString("nb-NO")} kr</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[shipment.status]}`}>
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
