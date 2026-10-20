"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { createTask } from "@/app/ansatt/leder/actions";

const fieldClasses =
  "w-full rounded-lg border border-teliapurple/20 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teliapurple focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teliapurple";
const labelClasses = "mb-1 block text-xs font-semibold text-slate-600";

export function TaskForm() {
  const [error, formAction, isPending] = useActionState(createTask, null);

  return (
    <form action={formAction} className="grid gap-3 rounded-xl border border-teliapurple/15 bg-white p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={labelClasses} htmlFor="title">Tittel</label>
        <input id="title" name="title" required className={fieldClasses} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClasses} htmlFor="description">Beskrivelse (valgfritt)</label>
        <input id="description" name="description" className={fieldClasses} />
      </div>
      <div>
        <label className={labelClasses} htmlFor="type">Type</label>
        <select id="type" name="type" defaultValue="daily" className={fieldClasses}>
          <option value="daily">Daglig</option>
          <option value="weekly">Ukentlig</option>
          <option value="one_time">Engangs</option>
        </select>
      </div>
      <div>
        <label className={labelClasses} htmlFor="points">Poeng</label>
        <input id="points" name="points" type="number" min={0} defaultValue={10} className={fieldClasses} />
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
          <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-teliapurple px-5 py-2 text-sm font-semibold text-white hover:bg-teliapurple-dark disabled:opacity-60"
        >
          {isPending ? "Oppretter…" : "Opprett oppgave"}
        </button>
      </div>
    </form>
  );
}
