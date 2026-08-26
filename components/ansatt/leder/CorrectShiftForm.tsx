"use client";

import { useActionState } from "react";
import { correctOpenShift } from "@/app/ansatt/leder/actions";

export function CorrectShiftForm({ shiftId }: { shiftId: string }) {
  const [error, formAction, isPending] = useActionState(correctOpenShift, null);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="shiftId" value={shiftId} />
      <input
        type="datetime-local"
        name="checkoutAt"
        required
        className="rounded-md border border-teliapurple/20 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-teliapurple/30 px-2 py-1 text-xs font-semibold text-teliapurple-dark hover:bg-teliapurple/5 disabled:opacity-60"
      >
        Rett utsjekk
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
