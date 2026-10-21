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

const MONTH_FORMAT = new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric" });

function monthKey(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(dateString: string): string {
  const label = MONTH_FORMAT.format(new Date(dateString));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

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

  const { data: shipments, error: shipmentsError } = await admin
    .from("shipments")
    .select("id, tracking_number, receiver, service_key, status, price_inc_mva, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .returns<Shipment[]>();

  // Grupper i rekkefølge etter hvilken måned sendingen ble booket i. Listen
  // er allerede sortert nyest først, så gruppene kommer naturlig i riktig
  // rekkefølge uten egen sortering her.
  const groups: { key: string; label: string; shipments: Shipment[] }[] = [];
  for (const shipment of shipments ?? []) {
    const key = monthKey(shipment.created_at);
    const current = groups[groups.length - 1];
    if (current && current.key === key) {
      current.shipments.push(shipment);
    } else {
      groups.push({ key, label: monthLabel(shipment.created_at), shipments: [shipment] });
    }
  }

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

      {groups.length === 0 && !shipmentsError && <p className="mt-8 text-sm text-slate">Ingen sendinger ennå.</p>}
      {shipmentsError && (
        <p className="mt-8 text-sm text-red-600">
          Klarte ikke å hente sendingene dine akkurat nå. Prøv å laste siden på nytt, eller ta kontakt med oss.
        </p>
      )}

      <div className="mt-8 space-y-8">
        {groups.map((group) => {
          const totalIncMva = group.shipments.reduce((sum, s) => sum + s.price_inc_mva, 0);
          return (
            <div key={group.key}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-bold tracking-wide text-navy uppercase">{group.label}</h2>
                <p className="text-xs text-slate">
                  {group.shipments.length} {group.shipments.length === 1 ? "sending" : "sendinger"} ·{" "}
                  {totalIncMva.toLocaleString("nb-NO")} kr
                </p>
              </div>
              <div className="mt-3 overflow-x-auto rounded-xl border border-border-light bg-white">
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
                    {group.shipments.map((shipment) => (
                      <tr key={shipment.id} className="border-b border-border-light last:border-0 hover:bg-bg-light">
                        <td className="px-4 py-3">
                          <Link
                            href={`/portal/${shipment.id}`}
                            className="font-mono text-sm font-semibold text-navy hover:text-green"
                          >
                            {formatTrackingNumber(shipment.tracking_number)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate">{shipment.receiver.city}</td>
                        <td className="px-4 py-3 text-navy">{SERVICE_LABELS[shipment.service_key]}</td>
                        <td className="px-4 py-3 font-medium text-navy">
                          {shipment.price_inc_mva.toLocaleString("nb-NO")} kr
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
