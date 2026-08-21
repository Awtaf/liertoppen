"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { completeOnboarding } from "@/app/portal/actions";
import { Button } from "@/components/Button";

const fieldClasses =
  "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate/60 transition-colors focus:border-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green";

const labelClasses = "mb-1.5 block text-sm font-semibold text-navy";

export function OnboardingForm({ token }: { token: string }) {
  const [error, formAction, isPending] = useActionState(completeOnboarding, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className={labelClasses}>
          Velg passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClasses}
        />
        <p className="mt-1 text-xs text-slate">Minst 8 tegn.</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClasses}>
          Gjenta passord
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClasses}
        />
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" disabled={isPending} showArrow={false} className="w-full">
        {isPending ? (
          <>
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            Oppretter tilgang...
          </>
        ) : (
          "Fullfør og logg inn"
        )}
      </Button>
    </form>
  );
}
