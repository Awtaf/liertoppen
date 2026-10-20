import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOpenShiftsWithStaff, formatClock } from "@/lib/staff/shifts";

export const metadata: Metadata = { title: "Leder – oversikt" };

export default async function LederDashboardPage() {
  const admin = createSupabaseAdminClient();

  const [{ count: activeCount }, openShifts] = await Promise.all([
    admin.from("staff_members").select("id", { count: "exact", head: true }).eq("active", true),
    getOpenShiftsWithStaff(admin),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Oversikt</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-teliapurple/15 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-teliapurple-dark">{activeCount ?? 0}</div>
          <div className="text-xs text-slate-500">Aktive ansatte</div>
        </div>
        <div className="rounded-xl border border-teliapurple/15 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-teliapurple-dark">{openShifts.length}</div>
          <div className="text-xs text-slate-500">Sjekket inn nå</div>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Åpne økter
        </h2>
        {openShifts.length === 0 ? (
          <p className="text-sm text-slate-500">Ingen er sjekket inn akkurat nå.</p>
        ) : (
          <ul className="space-y-2">
            {openShifts.map((shift) => (
              <li
                key={shift.id}
                className="flex items-center justify-between rounded-xl border border-teliapurple/15 bg-white px-4 py-3 text-sm"
              >
                <span className="font-semibold text-slate-900">
                  {(shift.staff_members as { name: string } | null)?.name ?? "Ukjent"}
                </span>
                <span className="text-slate-500">Inn kl. {formatClock(shift.checkin_at)}</span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/ansatt/leder/timer"
          className="mt-3 inline-block text-sm font-semibold text-teliapurple hover:text-teliapurple-dark"
        >
          Se alle timer og rett glemte utsjekk →
        </Link>
      </div>
    </div>
  );
}
