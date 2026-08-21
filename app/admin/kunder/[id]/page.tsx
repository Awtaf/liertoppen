import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GenerateInviteButton } from "@/components/admin/GenerateInviteButton";
import { STATUS_STYLES as LEAD_STATUS_STYLES } from "@/lib/leads";
import { STATUS_STYLES as SHIPMENT_STATUS_STYLES, STATUS_LABELS, SERVICE_LABELS } from "@/lib/shipments/shipment";
import { formatTrackingNumber } from "@/lib/shipments/tracking";

export const metadata: Metadata = {
  title: "Kunde-detaljer",
  robots: { index: false, follow: false },
};

export default async function CustomerDetailPage({
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
    redirect("/admin/login");
  }

  const admin = createSupabaseAdminClient();
  const [{ data: customer }, { data: leads }, { data: shipments }] = await Promise.all([
    admin.from("customers").select("id, name, email, phone, user_id, created_at").eq("id", id).maybeSingle(),
    admin
      .from("leads")
      .select("id, created_at, pickup_address, delivery_address, service_type, price_estimate, status")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    admin
      .from("shipments")
      .select("id, tracking_number, service_key, status, price_inc_mva, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/kunder" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-navy">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Tilbake til kunder
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{customer.name}</h1>
          <p className="mt-1 text-sm text-slate">
            {customer.email}
            {customer.phone ? ` · ${customer.phone}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border-light bg-white p-6">
        <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Kundeportal</h2>
        {customer.user_id ? (
          <p className="mt-2 text-sm text-green-800">Aktiv — kunden har satt passord og kan logge inn på /portal.</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate">
              Kunden har ikke tilgang ennå. Send en onboarding-lenke selv (e-post, SMS e.l.) først når dere er blitt enige —
              ingen kan opprette en bruker selv.
            </p>
            <div className="mt-4">
              <GenerateInviteButton customerId={customer.id} />
            </div>
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Leads (tilbudsforespørsler)</h2>
          {!leads || leads.length === 0 ? (
            <p className="mt-3 text-sm text-slate">Ingen leads.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {leads.map((lead) => (
                <li key={lead.id}>
                  <Link href={`/admin/leads/${lead.id}`} className="block rounded-lg border border-border-light p-3 hover:border-green">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-navy line-clamp-1">
                        {lead.pickup_address} → {lead.delivery_address}
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${LEAD_STATUS_STYLES[lead.status as keyof typeof LEAD_STATUS_STYLES]}`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate">
                      {new Date(lead.created_at).toLocaleDateString("nb-NO")}
                      {lead.price_estimate ? ` · ${lead.price_estimate.toLocaleString("nb-NO")} kr` : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Sendinger</h2>
          {!shipments || shipments.length === 0 ? (
            <p className="mt-3 text-sm text-slate">Ingen sendinger.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {shipments.map((shipment) => (
                <li key={shipment.id}>
                  <Link
                    href={`/admin/sendinger/${shipment.id}`}
                    className="block rounded-lg border border-border-light p-3 hover:border-green"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-sm font-medium text-navy">
                        {formatTrackingNumber(shipment.tracking_number)}
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${SHIPMENT_STATUS_STYLES[shipment.status as keyof typeof SHIPMENT_STATUS_STYLES]}`}>
                        {STATUS_LABELS[shipment.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate">
                      {SERVICE_LABELS[shipment.service_key as keyof typeof SERVICE_LABELS]} ·{" "}
                      {new Date(shipment.created_at).toLocaleDateString("nb-NO")} ·{" "}
                      {shipment.price_inc_mva.toLocaleString("nb-NO")} kr
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
