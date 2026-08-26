"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateStoreSettings } from "@/app/ansatt/leder/actions";
import type { StoreSettings } from "@/lib/staff/types";

const fieldClasses =
  "w-full rounded-lg border border-teliapurple/20 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teliapurple focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teliapurple";
const labelClasses = "mb-1 block text-xs font-semibold text-slate-600";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, isPending] = useActionState(updateStoreSettings, null);

  return (
    <form action={formAction} className="grid gap-3 rounded-xl border border-teliapurple/15 bg-white p-4 sm:grid-cols-3">
      <div>
        <label className={labelClasses} htmlFor="storeLat">Breddegrad (lat)</label>
        <input
          id="storeLat"
          name="storeLat"
          type="number"
          step="any"
          defaultValue={settings.store_lat}
          required
          className={fieldClasses}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="storeLng">Lengdegrad (lng)</label>
        <input
          id="storeLng"
          name="storeLng"
          type="number"
          step="any"
          defaultValue={settings.store_lng}
          required
          className={fieldClasses}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="radiusMeters">Radius (meter)</label>
        <input
          id="radiusMeters"
          name="radiusMeters"
          type="number"
          min={10}
          max={5000}
          defaultValue={settings.radius_meters}
          required
          className={fieldClasses}
        />
      </div>

      {state && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-3">
          <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
          {state}
        </div>
      )}

      <div className="sm:col-span-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-full bg-teliapurple px-5 py-2 text-sm font-semibold text-white hover:bg-teliapurple-dark disabled:opacity-60"
        >
          <CheckCircle2 aria-hidden className="h-4 w-4" />
          {isPending ? "Lagrer…" : "Lagre innstillinger"}
        </button>
      </div>
    </form>
  );
}
