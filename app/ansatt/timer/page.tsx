import type { Metadata } from "next";
import { requireStaff } from "@/lib/staff/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { startOfOsloWeek, startOfOsloMonth } from "@/lib/staff/periods";
import {
  getShiftsForStaff,
  shiftDurationMinutes,
  formatDurationLabel,
  formatClock,
  formatDate,
} from "@/lib/staff/shifts";

export const metadata: Metadata = { title: "Timer" };

export default async function TimerPage() {
  const session = await requireStaff();
  const admin = createSupabaseAdminClient();
  const shifts = await getShiftsForStaff(admin, session.sub);

  const weekStart = startOfOsloWeek();
  const monthStart = startOfOsloMonth();
  const sumSince = (since: Date) =>
    shifts
      .filter((s) => new Date(s.checkin_at) >= since)
      .reduce((sum, s) => sum + (shiftDurationMinutes(s) ?? 0), 0);

  const weekMinutes = sumSince(weekStart);
  const monthMinutes = sumSince(monthStart);
  const hasOpenShift = shifts.some((s) => !s.checkout_at);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Mine timer</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-teliapurple/15 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-teliapurple-dark">
            {formatDurationLabel(weekMinutes)}
          </div>
          <div className="text-xs text-slate-500">Denne uken</div>
        </div>
        <div className="rounded-xl border border-teliapurple/15 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-teliapurple-dark">
            {formatDurationLabel(monthMinutes)}
          </div>
          <div className="text-xs text-slate-500">Denne måneden</div>
        </div>
      </div>

      {hasOpenShift && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Du har en åpen økt uten utsjekk.
        </p>
      )}

      <div className="flex gap-3 text-sm">
        <a
          href="/api/ansatt/eksport/csv"
          className="rounded-full border border-teliapurple/30 px-4 py-1.5 font-semibold text-teliapurple-dark hover:bg-teliapurple/5"
        >
          Eksporter CSV
        </a>
        <a
          href="/api/ansatt/eksport/pdf"
          className="rounded-full border border-teliapurple/30 px-4 py-1.5 font-semibold text-teliapurple-dark hover:bg-teliapurple/5"
        >
          Eksporter PDF
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-teliapurple/15 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-teliapurple/5 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Dato</th>
              <th className="px-3 py-2 text-left">Inn</th>
              <th className="px-3 py-2 text-left">Ut</th>
              <th className="px-3 py-2 text-left">Timer</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                  Ingen økter registrert ennå.
                </td>
              </tr>
            )}
            {shifts.map((shift) => (
              <tr key={shift.id} className="border-t border-teliapurple/10">
                <td className="px-3 py-2">{formatDate(shift.checkin_at)}</td>
                <td className="px-3 py-2">{formatClock(shift.checkin_at)}</td>
                <td className="px-3 py-2">
                  {shift.checkout_at ? formatClock(shift.checkout_at) : "Pågår"}
                </td>
                <td className="px-3 py-2">{formatDurationLabel(shiftDurationMinutes(shift))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
