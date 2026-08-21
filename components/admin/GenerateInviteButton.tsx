"use client";

import { useState, useTransition } from "react";
import { generateOnboardingLink } from "@/app/admin/kunder/actions";

export function GenerateInviteButton({ customerId }: { customerId: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const url = await generateOnboardingLink(customerId);
            setLink(url);
            setCopied(false);
          });
        }}
        className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-navy hover:bg-green/90 disabled:opacity-60"
      >
        {isPending ? "Genererer…" : "Send onboarding-lenke"}
      </button>

      {link && (
        <div className="mt-4 rounded-xl border border-border-light bg-bg-light p-4">
          <p className="text-xs font-semibold tracking-wide text-slate uppercase">
            Lenke — kopier og send selv (e-post, SMS e.l.). Gyldig i 7 dager, kan kun brukes én gang.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-2 font-mono text-xs text-navy"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopied(true);
              }}
              className="shrink-0 rounded-lg border border-border-light bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-green hover:text-green"
            >
              {copied ? "Kopiert!" : "Kopier"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
