import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { validateInviteToken } from "@/lib/customers/invite";
import { OnboardingForm } from "@/components/portal/OnboardingForm";

export const metadata: Metadata = {
  title: "Velkommen",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  not_found: "Denne lenken er ugyldig. Sjekk at hele lenken ble kopiert riktig, eller be om en ny.",
  expired: "Denne lenken har utløpt. Ta kontakt for å få en ny.",
  used: "Denne lenken er allerede brukt. Logg inn i stedet.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const validation = token ? await validateInviteToken(token) : ({ valid: false, reason: "not_found" } as const);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border-light bg-white p-8">
        {validation.valid ? (
          <>
            <h1 className="text-xl font-bold text-navy">Velkommen, {validation.customer.name}</h1>
            <p className="mt-1 text-sm text-slate">Sett et passord for å få tilgang til kundeportalen.</p>
            <OnboardingForm token={token!} />
          </>
        ) : (
          <div className="flex items-start gap-3">
            <XCircle aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
            <div>
              <h1 className="text-lg font-bold text-navy">Kan ikke fullføre</h1>
              <p className="mt-1 text-sm text-slate">{ERROR_MESSAGES[validation.reason]}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
