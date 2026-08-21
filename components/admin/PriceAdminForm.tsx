"use client";

import { useActionState } from "react";
import { updatePrices } from "@/app/admin/priser/actions";
import type { Zone, ServiceConfig, SurchargeRate } from "@/lib/shipments/pricing";

const inputClass =
  "w-28 rounded-lg border border-border-light bg-bg-light px-2.5 py-1.5 text-sm text-navy text-right focus:border-green focus:bg-white focus-visible:outline-none";

const SERVICE_FIELD_LABELS: Record<string, string> = {
  kmRateOutsideZone: "Km-tillegg utenfor sone (kr/km)",
  minRoutePricePerDay: "Minstepris per rute/dag (kr)",
  fallbackPerStopPrice: "Standard pris per stopp uten sone (kr)",
  onRoutePrice: "1. pall på rute/samlast (kr)",
  directPrice: "1. pall direktekjøring (kr)",
  extraPalletPrice: "Tilleggspall (kr)",
  onRouteMaxZoneCode: "Høyeste sonekode regnet som «på rute»",
  perHour: "Timepris (kr/t)",
  minHours: "Minimum timer",
  fullDayHours: "Timer for dagsleie",
  fullDayPrice: "Dagsleie (kr)",
};

export function PriceAdminForm({
  zones,
  services,
  surcharges,
}: {
  zones: Zone[];
  services: ServiceConfig[];
  surcharges: SurchargeRate[];
}) {
  const [message, formAction, isPending] = useActionState(updatePrices, null);

  return (
    <form action={formAction} className="space-y-8">
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Soner</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-slate uppercase">
                <th className="py-2 pr-4">Sone</th>
                <th className="py-2 pr-4">Startpris ekspress (kr)</th>
                <th className="py-2 pr-4">Pris per stopp, fast distribusjon (kr)</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id} className="border-t border-border-light">
                  <td className="py-2.5 pr-4 font-medium text-navy">
                    {zone.name}
                    <input type="hidden" name="zoneId" value={zone.id} />
                  </td>
                  <td className="py-2.5 pr-4">
                    <input
                      name={`zone_express_${zone.id}`}
                      type="number"
                      defaultValue={zone.express_start_price}
                      className={inputClass}
                    />
                  </td>
                  <td className="py-2.5 pr-4">
                    <input
                      name={`zone_perstop_${zone.id}`}
                      type="number"
                      defaultValue={zone.per_stop_price ?? ""}
                      placeholder="—"
                      className={inputClass}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Tjenestesatser</h2>
        <div className="mt-4 space-y-5">
          {services.map((service) => (
            <div key={service.key}>
              <p className="text-sm font-semibold text-navy">{service.name}</p>
              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {Object.entries(service.config).map(([field, value]) => (
                  <label key={field} className="flex items-center justify-between gap-3 text-sm text-slate">
                    {SERVICE_FIELD_LABELS[field] ?? field}
                    <input
                      name={`service_${service.key}_${field}`}
                      type="number"
                      defaultValue={value}
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Tillegg</h2>
        <div className="mt-4 space-y-2">
          {surcharges.map((surcharge) => (
            <label key={surcharge.key} className="flex items-center justify-between gap-3 text-sm text-slate">
              {surcharge.label}
              <span className="flex items-center gap-2">
                <input type="hidden" name="surchargeKey" value={surcharge.key} />
                <input
                  name={`surcharge_${surcharge.key}`}
                  type="number"
                  defaultValue={surcharge.value}
                  className={inputClass}
                />
                <span className="w-10 text-xs text-slate">{surcharge.type === "PCT" ? "%" : "kr"}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-green px-6 py-2.5 text-sm font-semibold text-navy hover:bg-green/90 disabled:opacity-60"
        >
          {isPending ? "Lagrer…" : "Lagre priser"}
        </button>
        {message && <span className="text-sm text-slate">{message}</span>}
      </div>
    </form>
  );
}
