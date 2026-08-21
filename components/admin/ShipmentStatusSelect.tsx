"use client";

import { useTransition } from "react";
import { updateShipmentStatus } from "@/app/admin/sendinger/actions";
import { SHIPMENT_STATUSES, STATUS_LABELS, type ShipmentStatus } from "@/lib/shipments/shipment";

export function ShipmentStatusSelect({
  shipmentId,
  status,
}: {
  shipmentId: string;
  status: ShipmentStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(event) => {
        const next = event.target.value as ShipmentStatus;
        startTransition(() => {
          updateShipmentStatus(shipmentId, next);
        });
      }}
      className="rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-semibold text-navy focus:border-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green disabled:opacity-60"
    >
      {SHIPMENT_STATUSES.map((option) => (
        <option key={option} value={option}>
          {STATUS_LABELS[option]}
        </option>
      ))}
    </select>
  );
}
