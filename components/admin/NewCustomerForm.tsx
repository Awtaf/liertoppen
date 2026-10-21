"use client";

import { useActionState } from "react";
import { createCustomer } from "@/app/admin/kunder/actions";

const inputClass =
  "w-full rounded-lg border border-border-light bg-bg-light px-3 py-2 text-sm text-navy focus:border-green focus:bg-white focus-visible:outline-none";
const labelClass = "mb-1.5 block text-xs font-semibold text-navy";

export function NewCustomerForm() {
  const [message, formAction, isPending] = useActionState(createCustomer, null);

  return (
    <form action={formAction} className="rounded-2xl border border-border-light bg-white p-6">
      <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Ny kunde</h2>
      <p className="mt-1 text-xs text-slate">
        For kunder som skal logge inn og booke selv — uten at det må finnes et lead eller en sending først.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Navn / firma</label>
          <input name="name" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-post</label>
          <input name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Telefon</label>
          <input name="phone" className={inputClass} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-navy hover:bg-green/90 disabled:opacity-60"
        >
          {isPending ? "Oppretter…" : "Opprett kunde"}
        </button>
        {message && <span className="text-sm text-red-600">{message}</span>}
      </div>
    </form>
  );
}
