import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PortalBookingForm } from "@/components/portal/PortalBookingForm";
import type { CustomerRateOverrides } from "@/lib/shipments/pricing";

export const metadata: Metadata = {
  title: "Ny sending",
  robots: { index: false, follow: false },
};

export default async function PortalNewShipmentPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/portal/login");
  }

  const admin = createSupabaseAdminClient();
  const { data: customer } = await admin
    .from("customers")
    .select("rate_overrides")
    .eq("user_id", user.id)
    .maybeSingle();
  const fixedSenderAddress = (customer?.rate_overrides as CustomerRateOverrides | undefined)?.fixedSenderAddress;

  return (
    <div>
      <Link href="/portal" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-navy">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Tilbake til mine sendinger
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-navy">Ny sending</h1>
      <p className="mt-1 text-sm text-slate">Pris beregnes live. Bekreft booking for å generere sporingsnummer og fraktlapp.</p>

      <div className="mt-8">
        <PortalBookingForm fixedSenderAddress={fixedSenderAddress} />
      </div>
    </div>
  );
}
