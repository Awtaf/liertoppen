import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import type { Lead } from "@/lib/leads";

export const metadata: Metadata = {
  title: "Lead-detaljer",
  robots: { index: false, follow: false },
};

export default async function LeadDetailPage({
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
  const { data: lead } = await admin
    .from("leads")
    .select(
      "id, created_at, pickup_address, pickup_lat, pickup_lng, delivery_address, delivery_lat, delivery_lng, weight_kg, length_cm, width_cm, height_cm, colli, service_type, distance_km, price_estimate, price_breakdown, status, customers(name, email, phone)"
    )
    .eq("id", id)
    .maybeSingle()
    .returns<Lead>();

  if (!lead) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-navy"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Tilbake til leads
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {lead.customers?.name ?? "Ukjent kunde"}
          </h1>
          <p className="mt-1 text-sm text-slate">
            Mottatt {new Date(lead.created_at).toLocaleString("nb-NO")}
          </p>
        </div>
        <LeadStatusSelect leadId={lead.id} status={lead.status} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">
            Kunde
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Navn</dt>
              <dd className="font-medium text-navy">{lead.customers?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">E-post</dt>
              <dd className="font-medium text-navy">{lead.customers?.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Telefon</dt>
              <dd className="font-medium text-navy">{lead.customers?.phone}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">
            Rute
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-slate">Henteadresse</dt>
              <dd className="font-medium text-navy">{lead.pickup_address}</dd>
            </div>
            <div>
              <dt className="text-slate">Leveringsadresse</dt>
              <dd className="font-medium text-navy">{lead.delivery_address}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Avstand</dt>
              <dd className="font-medium text-navy">
                {lead.distance_km?.toFixed(1)} km
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">
            Gods
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Vekt</dt>
              <dd className="font-medium text-navy">{lead.weight_kg} kg</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Mål</dt>
              <dd className="font-medium text-navy">
                {lead.length_cm} × {lead.width_cm} × {lead.height_cm} cm
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Antall kolli</dt>
              <dd className="font-medium text-navy">{lead.colli}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Tjeneste</dt>
              <dd className="font-medium text-navy">
                {lead.service_type === "ekspress" ? "Ekspress" : "Standard"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-green/30 bg-green/5 p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">
            Prisestimat
          </h2>
          <p className="mt-2 text-2xl font-bold text-navy">
            {lead.price_estimate?.toLocaleString("nb-NO")} kr
          </p>
          {lead.price_breakdown && (
            <dl className="mt-4 space-y-1.5 border-t border-green/20 pt-4 text-sm">
              {lead.price_breakdown.lines.map((line) => (
                <div key={line.label} className="flex justify-between gap-4">
                  <dt className="text-slate">{line.label}</dt>
                  <dd className="font-medium text-navy">
                    {line.amount.toLocaleString("nb-NO")} kr
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
