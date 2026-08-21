import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Kunder",
  robots: { index: false, follow: false },
};

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  user_id: string | null;
  created_at: string;
  leads: { count: number }[];
  shipments: { count: number }[];
};

export default async function CustomersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = createSupabaseAdminClient();
  const { data: customers, error } = await admin
    .from("customers")
    .select("id, name, email, phone, user_id, created_at, leads(count), shipments(count)")
    .order("created_at", { ascending: false })
    .returns<CustomerRow[]>();

  const customerIds = (customers ?? []).map((c) => c.id);
  const { data: invites } = customerIds.length
    ? await admin
        .from("customer_invites")
        .select("customer_id, expires_at, used_at")
        .in("customer_id", customerIds)
    : { data: [] as { customer_id: string; expires_at: string; used_at: string | null }[] };

  function portalStatus(customer: CustomerRow): { label: string; className: string } {
    if (customer.user_id) return { label: "Aktiv i portal", className: "bg-green/15 text-green-800" };
    const pending = (invites ?? []).some(
      (i) => i.customer_id === customer.id && !i.used_at && new Date(i.expires_at) > new Date()
    );
    if (pending) return { label: "Invitert, venter", className: "bg-amber-100 text-amber-800" };
    return { label: "Ikke invitert", className: "bg-navy/10 text-navy" };
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-navy">Kunder</h1>
        <p className="mt-1 text-sm text-slate">
          Alle kunder — fra tilbudsforespørsler og bookede sendinger. Send onboarding-lenke fra en kundes side når dere er blitt enige.
        </p>
      </div>

      {error && <p className="mt-6 text-sm text-red-600">Kunne ikke hente kunder: {error.message}</p>}

      {!error && customers && customers.length === 0 && (
        <p className="mt-6 text-sm text-slate">Ingen kunder ennå.</p>
      )}

      {!error && customers && customers.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border-light bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-light text-xs font-semibold tracking-wide text-slate uppercase">
                <th className="px-4 py-3">Navn</th>
                <th className="px-4 py-3">E-post</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Sendinger</th>
                <th className="px-4 py-3">Portal</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const status = portalStatus(customer);
                return (
                  <tr key={customer.id} className="border-b border-border-light last:border-0 hover:bg-bg-light">
                    <td className="px-4 py-3">
                      <Link href={`/admin/kunder/${customer.id}`} className="font-semibold text-navy hover:text-green">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate">{customer.email}</td>
                    <td className="px-4 py-3 text-navy">{customer.leads?.[0]?.count ?? 0}</td>
                    <td className="px-4 py-3 text-navy">{customer.shipments?.[0]?.count ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
