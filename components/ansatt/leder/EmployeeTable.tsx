"use client";

import { useActionState } from "react";
import { setStaffActive, resetStaffPin } from "@/app/ansatt/leder/actions";
import type { StaffMember } from "@/lib/staff/types";

function ResetPinForm({ staffId }: { staffId: string }) {
  const [error, formAction, isPending] = useActionState(resetStaffPin, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="staffId" value={staffId} />
      <input
        name="pin"
        inputMode="numeric"
        pattern="\d{4,8}"
        placeholder="Ny PIN"
        className="w-20 rounded-md border border-teliapurple/20 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-teliapurple/30 px-2 py-1 text-xs font-semibold text-teliapurple-dark hover:bg-teliapurple/5 disabled:opacity-60"
      >
        Sett PIN
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}

export function EmployeeTable({ members }: { members: StaffMember[] }) {
  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className={`rounded-xl border p-4 ${
            member.active ? "border-teliapurple/15 bg-white" : "border-slate-200 bg-slate-50 opacity-70"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-900">
                {member.name}{" "}
                <span className="text-xs font-normal text-slate-400">@{member.username}</span>
              </div>
              <div className="text-xs text-slate-500">
                {member.role === "leder" ? "Leder" : "Ansatt"}
                {member.email ? ` · ${member.email}` : ""}
                {!member.active ? " · Deaktivert" : ""}
              </div>
            </div>
            <form action={setStaffActive.bind(null, member.id, !member.active)}>
              <button
                type="submit"
                className="rounded-full border border-teliapurple/30 px-3 py-1 text-xs font-semibold text-teliapurple-dark hover:bg-teliapurple/5"
              >
                {member.active ? "Deaktiver" : "Aktiver"}
              </button>
            </form>
          </div>
          <div className="mt-3">
            <ResetPinForm staffId={member.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
