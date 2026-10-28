"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/app/admin/actions";
import { Button } from "@/components/Button";

const fieldClasses =
  "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate/60 transition-colors focus:border-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green";

const labelClasses = "mb-1.5 block text-sm font-semibold text-navy";

export function ForgotPasswordForm() {
  const [message, formAction, isPending] = useActionState(requestPasswordReset, null);

  if (message) {
    return (
      <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-green/30 bg-green/5 px-4 py-3 text-sm text-navy">
        <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-green" />
        {message}
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className={labelClasses}>
          E-post
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={fieldClasses} />
      </div>

      <Button type="submit" disabled={isPending} showArrow={false} className="w-full">
        {isPending ? (
          <>
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            Sender...
          </>
        ) : (
          "Send tilbakestillingslenke"
        )}
      </Button>
    </form>
  );
}
