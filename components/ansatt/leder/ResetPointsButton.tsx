"use client";

import { useActionState, useState } from "react";
import { resetPointsPeriod } from "@/app/ansatt/leder/actions";

export function ResetPointsButton() {
  const [open, setOpen] = useState(false);
  const [error, formAction, isPending] = useActionState(resetPointsPeriod, null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-teliapurple/30 px-4 py-1.5 text-sm font-semibold text-teliapurple-dark hover:bg-teliapurple/5"
      >
        Nullstill poeng (ny periode)
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <span className="text-sm text-amber-900">
        Dette starter en ny periode for &quot;Totalt&quot;. Historikken bevares.
      </span>
      <input
        name="label"
        placeholder="Navn på ny periode (valgfritt)"
        className="rounded-md border border-amber-300 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
      >
        Bekreft nullstilling
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500">
        Avbryt
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  );
}
