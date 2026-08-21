import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { Container } from "@/components/Container";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  STATUS_DESCRIPTIONS,
  STATUS_LABELS,
  STATUS_STEPS,
  SERVICE_LABELS,
  type ShipmentStatus,
} from "@/lib/shipments/shipment";
import { formatTrackingNumber } from "@/lib/shipments/tracking";

export const metadata: Metadata = {
  title: "Sporing",
  robots: { index: false, follow: false },
};

type PublicShipment = {
  id: string;
  tracking_number: string;
  sender_city: string;
  receiver_city: string;
  service_key: keyof typeof SERVICE_LABELS;
  status: ShipmentStatus;
  created_at: string;
};

type PublicShipmentEvent = { status: ShipmentStatus; occurred_at: string };

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;
  const normalized = trackingNumber.replace(/\s/g, "").toUpperCase();

  const admin = createSupabaseAdminClient();
  const { data: shipment } = await admin
    .from("shipments")
    .select(
      "id, tracking_number, sender_city:sender->>city, receiver_city:receiver->>city, service_key, status, created_at"
    )
    .eq("tracking_number", normalized)
    .maybeSingle()
    .returns<PublicShipment>();

  if (!shipment) {
    notFound();
  }

  const { data: events } = await admin
    .from("shipment_events")
    .select("status, occurred_at")
    .eq("shipment_id", shipment.id)
    .order("occurred_at", { ascending: true })
    .returns<PublicShipmentEvent[]>();

  const isRejected = shipment.status === "AVVIK" || shipment.status === "KANSELLERT";
  const currentStepIndex = STATUS_STEPS.indexOf(shipment.status);

  return (
    <div className="bg-bg-light py-24 sm:py-28">
      <Container className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-navy uppercase">
          <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-green align-middle" />
          Sporing
        </p>
        <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          {shipment.sender_city} → {shipment.receiver_city}
        </h1>
        <p className="mt-2 font-mono text-sm text-slate">
          {formatTrackingNumber(shipment.tracking_number)} · {SERVICE_LABELS[shipment.service_key]}
        </p>

        <div className="mt-8 rounded-2xl border border-border-light bg-white p-6 sm:p-8">
          {isRejected ? (
            <div className="flex items-start gap-3">
              <XCircle aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
              <div>
                <p className="text-base font-bold text-navy">{STATUS_LABELS[shipment.status]}</p>
                <p className="mt-1 text-sm text-slate">{STATUS_DESCRIPTIONS[shipment.status]}</p>
              </div>
            </div>
          ) : (
            <ol className="space-y-6">
              {STATUS_STEPS.map((step, index) => {
                const event = events?.find((e) => e.status === step);
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
                      <p className={`text-base font-bold ${isDone || isCurrent ? "text-navy" : "text-slate"}`}>
                        {STATUS_LABELS[step]}
                      </p>
                      {event && (
                        <p className="mt-1 text-sm text-slate">
                          {new Date(event.occurred_at).toLocaleString("nb-NO")}
                        </p>
                      )}
                      {isCurrent && !event && (
                        <p className="mt-1 text-sm text-slate">{STATUS_DESCRIPTIONS[step]}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate">
          Registrert {new Date(shipment.created_at).toLocaleDateString("nb-NO")}
        </p>
      </Container>
    </div>
  );
}
