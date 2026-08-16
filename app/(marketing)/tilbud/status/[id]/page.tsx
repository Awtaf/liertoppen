import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { Container } from "@/components/Container";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  STATUS_DESCRIPTIONS,
  STATUS_STEPS,
  type PublicLeadStatus,
} from "@/lib/leads";

export const metadata: Metadata = {
  title: "Status på forespørsel",
  robots: { index: false, follow: false },
};

export default async function QuoteStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const admin = createSupabaseAdminClient();
  const { data: lead } = await admin
    .from("leads")
    .select("id, pickup_address, delivery_address, service_type, price_estimate, status, created_at")
    .eq("id", id)
    .maybeSingle()
    .returns<PublicLeadStatus>();

  if (!lead) {
    notFound();
  }

  const isRejected = lead.status === "Avvist";
  const currentStepIndex = STATUS_STEPS.indexOf(lead.status);

  return (
    <div className="bg-bg-light py-24 sm:py-28">
      <Container className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-navy uppercase">
          <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-green align-middle" />
          Status på forespørsel
        </p>
        <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          {lead.pickup_address.split(",")[0]} → {lead.delivery_address.split(",")[0]}
        </h1>
        <p className="mt-2 text-sm text-slate">
          Sendt inn {new Date(lead.created_at).toLocaleDateString("nb-NO")} ·
          Referanse {lead.id.slice(0, 8).toUpperCase()}
        </p>

        <div className="mt-8 rounded-2xl border border-border-light bg-white p-6 sm:p-8">
          {isRejected ? (
            <div className="flex items-start gap-3">
              <XCircle aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
              <div>
                <p className="text-base font-bold text-navy">Avvist</p>
                <p className="mt-1 text-sm text-slate">
                  {STATUS_DESCRIPTIONS.Avvist}
                </p>
              </div>
            </div>
          ) : (
            <ol className="space-y-6">
              {STATUS_STEPS.map((step, index) => {
                const isDone = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <li key={step} className="flex items-start gap-3">
                    {isDone || isCurrent ? (
                      <CheckCircle2
                        aria-hidden
                        className={`mt-0.5 h-6 w-6 shrink-0 ${isCurrent ? "text-green" : "text-navy"}`}
                      />
                    ) : (
                      <Circle aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-border-light" />
                    )}
                    <div>
                      <p
                        className={`text-base font-bold ${
                          isDone || isCurrent ? "text-navy" : "text-slate"
                        }`}
                      >
                        {step}
                      </p>
                      {isCurrent && (
                        <p className="mt-1 text-sm text-slate">
                          {STATUS_DESCRIPTIONS[step]}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-border-light bg-white p-6 sm:p-8">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">
            Detaljer
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Fra</dt>
              <dd className="text-right font-medium text-navy">{lead.pickup_address}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Til</dt>
              <dd className="text-right font-medium text-navy">{lead.delivery_address}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Tjeneste</dt>
              <dd className="font-medium text-navy">
                {lead.service_type === "ekspress" ? "Ekspress" : "Standard"}
              </dd>
            </div>
            {lead.price_estimate !== null && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate">Veiledende estimat</dt>
                <dd className="font-medium text-navy">
                  {lead.price_estimate.toLocaleString("nb-NO")} kr
                </dd>
              </div>
            )}
          </dl>
        </div>
      </Container>
    </div>
  );
}
