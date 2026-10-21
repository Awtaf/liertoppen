"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateShipmentStatus } from "@/app/admin/sendinger/actions";
import { STATUS_STEPS, STATUS_LABELS, type ShipmentStatus } from "@/lib/shipments/shipment";

const NEXT_LABEL: Record<ShipmentStatus, string> = {
  BOOKET: "Merk som tildelt",
  TILDELT: "Merk som hentet",
  HENTET: "Merk som underveis",
  UNDERVEIS: "Merk som levert",
  LEVERT: "",
  AVVIK: "",
  KANSELLERT: "",
};

export function StatusButton({ shipmentId, status }: { shipmentId: string; status: ShipmentStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const stepIndex = STATUS_STEPS.indexOf(status);
  const isTerminalProblem = status === "AVVIK" || status === "KANSELLERT";
  const isDelivered = status === "LEVERT";
  const nextStatus = stepIndex >= 0 && stepIndex < STATUS_STEPS.length - 1 ? STATUS_STEPS[stepIndex + 1] : null;

  if (isDelivered) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-green/15 py-4 text-base font-bold text-green-800">
        <CheckCircle2 aria-hidden className="h-5 w-5" />
        Levert
      </div>
    );
  }

  if (isTerminalProblem || !nextStatus) {
    return (
      <div className="rounded-xl bg-bg-light py-4 text-center text-sm text-slate">
        {STATUS_LABELS[status]} — ingen videre steg her. Ta kontakt hvis noe skal endres.
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await updateShipmentStatus(shipmentId, nextStatus);
          router.refresh();
        })
      }
      className="w-full rounded-xl bg-green py-4 text-base font-bold text-navy hover:bg-green/90 disabled:opacity-60"
    >
      {isPending ? "Oppdaterer…" : NEXT_LABEL[status]}
    </button>
  );
}
