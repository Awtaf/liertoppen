import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STATUS_STYLES, type Lead } from "@/lib/leads";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

export default async function LeadsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = createSupabaseAdminClient();
  const { data: leads, error } = await admin
    .from("leads")
    .select(
      "id, created_at, pickup_address, delivery_address, service_type, price_estimate, status, customers(name, email, phone)"
    )
    .order("created_at", { ascending: false })
    .returns<Lead[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Leads</h1>
      <p className="mt-1 text-sm text-slate">
        Innkommende tilbudsforespørsler fra /tilbud.
      </p>

      {error && (
        <p className="mt-6 text-sm text-red-600">
          Kunne ikke hente leads: {error.message}
        </p>
      )}

      {!error && leads && leads.length === 0 && (
        <p className="mt-6 text-sm text-slate">Ingen leads ennå.</p>
      )}

      {!error && leads && leads.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border-light bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-light text-xs font-semibold tracking-wide text-slate uppercase">
                <th className="px-4 py-3">Kunde</th>
                <th className="px-4 py-3">Rute</th>
                <th className="px-4 py-3">Tjeneste</th>
                <th className="px-4 py-3">Pris</th>
                <th className="px-4 py-3">Dato</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border-light last:border-0 hover:bg-bg-light">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-semibold text-navy hover:text-green"
                    >
                      {lead.customers?.name ?? "Ukjent"}
                    </Link>
                  </td>
                  <td className="max-w-[260px] px-4 py-3 text-slate">
                    <span className="line-clamp-1">
                      {lead.pickup_address} → {lead.delivery_address}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy">
                    {lead.service_type === "ekspress" ? "Ekspress" : "Standard"}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">
                    {lead.price_estimate?.toLocaleString("nb-NO")} kr
                  </td>
                  <td className="px-4 py-3 text-slate">
                    {new Date(lead.created_at).toLocaleDateString("nb-NO")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[lead.status]}`}
                    >
                      {lead.status}
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
