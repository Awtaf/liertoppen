"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/app/admin/actions";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads";

export function LeadStatusSelect({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(event) => {
        const next = event.target.value as LeadStatus;
        startTransition(() => {
          updateLeadStatus(leadId, next);
        });
      }}
      className="rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-semibold text-navy focus:border-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green disabled:opacity-60"
    >
      {LEAD_STATUSES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
