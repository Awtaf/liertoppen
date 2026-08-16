"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { login } from "@/app/admin/actions";
import { Button } from "@/components/Button";

const fieldClasses =
  "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate/60 transition-colors focus:border-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green";

const labelClasses = "mb-1.5 block text-sm font-semibold text-navy";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div>
        <label htmlFor="email" className={labelClasses}>
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClasses}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClasses}>
          Passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
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

      <Button type="submit" disabled={isPending} showArrow={false} className="w-full">
        {isPending ? (
          <>
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            Logger inn...
          </>
        ) : (
          "Logg inn"
        )}
      </Button>
    </form>
  );
}
