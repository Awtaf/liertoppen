import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStoreSettings } from "@/lib/staff/shifts";
import { SettingsForm } from "@/components/ansatt/leder/SettingsForm";

export const metadata: Metadata = { title: "Innstillinger" };

export default async function InnstillingerPage() {
  const admin = createSupabaseAdminClient();
  const settings = await getStoreSettings(admin);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Butikkinnstillinger</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ansatte kan bare sjekke inn/ut når de er innenfor radiusen fra disse koordinatene. Finn
          butikkens nøyaktige koordinater f.eks. via Google Maps (høyreklikk på stedet → kopier
          koordinatene).
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
