import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ShipmentBookingForm } from "@/components/admin/ShipmentBookingForm";

export const metadata: Metadata = {
  title: "Ny sending",
  robots: { index: false, follow: false },
};

export default async function NewShipmentPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div>
      <Link
        href="/admin/sendinger"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-navy"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Tilbake til sendinger
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-navy">Ny sending</h1>
      <p className="mt-1 text-sm text-slate">
        Pris beregnes live fra soner og satser i /admin/priser. Bekreft booking for å generere sporingsnummer og fraktlapp.
      </p>

      <div className="mt-8">
        <ShipmentBookingForm />
      </div>
    </div>
  );
}
