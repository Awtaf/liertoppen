import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchZones, fetchServices, fetchSurcharges } from "@/lib/shipments/pricing";
import { PriceAdminForm } from "@/components/admin/PriceAdminForm";

export const metadata: Metadata = {
  title: "Priser",
  robots: { index: false, follow: false },
};

export default async function PriceAdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [zones, services, surcharges] = await Promise.all([
    fetchZones(),
    fetchServices(),
    fetchSurcharges(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Priser</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate">
        Satsene under styrer prisberegningen for nye sendinger direkte — ingen priser er hardkodet i systemet.
        Endringer trer i kraft med det samme, uten ny deploy.
      </p>

      <div className="mt-8">
        <PriceAdminForm zones={zones} services={services} surcharges={surcharges} />
      </div>
    </div>
  );
}
