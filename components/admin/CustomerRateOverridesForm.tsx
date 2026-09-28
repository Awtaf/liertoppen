"use client";

import { useActionState } from "react";
import { updateCustomerRateOverrides } from "@/app/admin/kunder/actions";
import type { Zone, CustomerRateOverrides } from "@/lib/shipments/pricing";

const inputClass =
  "w-28 rounded-lg border border-border-light bg-bg-light px-2.5 py-1.5 text-sm text-navy text-right focus:border-green focus:bg-white focus-visible:outline-none";
const labelClass = "mb-1.5 block text-xs font-semibold text-navy";

export function CustomerRateOverridesForm({
  customerId,
  zones,
  rateOverrides,
}: {
  customerId: string;
  zones: Zone[];
  rateOverrides: CustomerRateOverrides;
}) {
  const [message, formAction, isPending] = useActionState(updateCustomerRateOverrides, null);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="customerId" value={customerId} />

      <div>
        <p className="text-xs font-semibold tracking-wide text-slate uppercase">
          Avtalt pris per stopp — «Fast distribusjon»
        </p>
        <p className="mt-1 text-xs text-slate">
          Blank felt = standard sonepris (settes i /admin/priser). Fyll kun ut de sonene som har en egen avtale.
        </p>
        <div className="mt-3 space-y-2">
          {zones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-navy">
                {zone.name} <span className="text-slate">(standard {zone.per_stop_price ?? "—"} kr)</span>
              </span>
              <input
                name={`zonePerStop_${zone.code}`}
                type="number"
                min={0}
                placeholder="—"
                defaultValue={rateOverrides.sameDayRouteZonePerStop?.[String(zone.code)] ?? ""}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-wide text-slate uppercase">Kjøretøybegrensning</p>
        <p className="mt-1 text-xs text-slate">
          Sett dette hvis kundens sendinger kun kjøres med ett bestemt kjøretøy. Blank = ingen begrensning.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Vekt (kg)</label>
            <input
              name="maxWeightKg"
              type="number"
              min={0}
              defaultValue={rateOverrides.maxCargo?.weightKg ?? ""}
              className="w-full rounded-lg border border-border-light bg-bg-light px-2.5 py-1.5 text-sm text-navy focus:border-green focus:bg-white focus-visible:outline-none"
            />
          </div>
          <div>
            <label className={labelClass}>Lengde (cm)</label>
            <input
              name="maxLengthCm"
              type="number"
              min={0}
              defaultValue={rateOverrides.maxCargo?.lengthCm ?? ""}
              className="w-full rounded-lg border border-border-light bg-bg-light px-2.5 py-1.5 text-sm text-navy focus:border-green focus:bg-white focus-visible:outline-none"
            />
          </div>
          <div>
            <label className={labelClass}>Bredde (cm)</label>
            <input
              name="maxWidthCm"
              type="number"
              min={0}
              defaultValue={rateOverrides.maxCargo?.widthCm ?? ""}
              className="w-full rounded-lg border border-border-light bg-bg-light px-2.5 py-1.5 text-sm text-navy focus:border-green focus:bg-white focus-visible:outline-none"
            />
          </div>
          <div>
            <label className={labelClass}>Høyde (cm)</label>
            <input
              name="maxHeightCm"
              type="number"
              min={0}
              defaultValue={rateOverrides.maxCargo?.heightCm ?? ""}
              className="w-full rounded-lg border border-border-light bg-bg-light px-2.5 py-1.5 text-sm text-navy focus:border-green focus:bg-white focus-visible:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-navy hover:bg-green/90 disabled:opacity-60"
        >
          {isPending ? "Lagrer…" : "Lagre avtale"}
        </button>
        {message && <span className="text-sm text-slate">{message}</span>}
      </div>
    </form>
  );
}
