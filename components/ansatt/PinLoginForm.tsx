"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { staffLogin } from "@/app/ansatt/actions";

const fieldClasses =
  "w-full rounded-lg border border-teliapurple/20 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teliapurple focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teliapurple";

const labelClasses = "mb-1.5 block text-sm font-semibold text-slate-700";

export function PinLoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, formAction, isPending] = useActionState(staffLogin, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div>
        <label htmlFor="identifier" className={labelClasses}>
          Brukernavn eller e-post
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          required
          autoComplete="username"
          className={fieldClasses}
        />
      </div>

      <div>
        <label htmlFor="secret" className={labelClasses}>
          PIN-kode eller passord
        </label>
        <input
          id="secret"
          name="secret"
          type="password"
          inputMode="text"
          required
          autoComplete="current-password"
          className={fieldClasses}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-teliapurple px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teliapurple-dark disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            Logger inn...
          </>
        ) : (
          "Logg inn"
        )}
      </button>
    </form>
  );
}
