"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { createStaffMember } from "@/app/ansatt/leder/actions";

const fieldClasses =
  "w-full rounded-lg border border-teliapurple/20 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teliapurple focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teliapurple";
const labelClasses = "mb-1 block text-xs font-semibold text-slate-600";

export function EmployeeForm() {
  const [error, formAction, isPending] = useActionState(createStaffMember, null);

  return (
    <form action={formAction} className="grid gap-3 rounded-xl border border-teliapurple/15 bg-white p-4 sm:grid-cols-2">
      <div>
        <label className={labelClasses} htmlFor="name">Navn</label>
        <input id="name" name="name" required className={fieldClasses} />
      </div>
      <div>
        <label className={labelClasses} htmlFor="username">Brukernavn</label>
        <input id="username" name="username" required className={fieldClasses} />
      </div>
      <div>
        <label className={labelClasses} htmlFor="email">E-post (valgfritt)</label>
        <input id="email" name="email" type="email" className={fieldClasses} />
      </div>
      <div>
        <label className={labelClasses} htmlFor="role">Rolle</label>
        <select id="role" name="role" defaultValue="ansatt" className={fieldClasses}>
          <option value="ansatt">Ansatt</option>
          <option value="leder">Leder</option>
        </select>
      </div>
      <div>
        <label className={labelClasses} htmlFor="pin">PIN-kode (4–8 siffer)</label>
        <input id="pin" name="pin" inputMode="numeric" pattern="\d{4,8}" className={fieldClasses} />
      </div>
      <div>
        <label className={labelClasses} htmlFor="password">Passord (valgfritt, min. 8 tegn)</label>
        <input id="password" name="password" type="password" className={fieldClasses} />
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
          {isPending ? "Oppretter…" : "Opprett ansatt"}
        </button>
      </div>
    </form>
  );
}
