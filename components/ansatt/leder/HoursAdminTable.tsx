import { shiftDurationMinutes, formatDurationLabel, formatClock, formatDate } from "@/lib/staff/shifts";
import { CorrectShiftForm } from "@/components/ansatt/leder/CorrectShiftForm";

type ShiftWithStaff = {
  id: string;
  checkin_at: string;
  checkout_at: string | null;
  staff_members: { name: string; username: string } | null;
};

export function HoursAdminTable({ shifts }: { shifts: ShiftWithStaff[] }) {
  if (shifts.length === 0) {
    return <p className="text-sm text-slate-500">Ingen økter registrert i perioden.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-teliapurple/15 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-teliapurple/5 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2 text-left">Ansatt</th>
            <th className="px-3 py-2 text-left">Dato</th>
            <th className="px-3 py-2 text-left">Inn</th>
            <th className="px-3 py-2 text-left">Ut</th>
            <th className="px-3 py-2 text-left">Timer</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-t border-teliapurple/10 align-top">
              <td className="px-3 py-2">{shift.staff_members?.name ?? "Ukjent"}</td>
              <td className="px-3 py-2">{formatDate(shift.checkin_at)}</td>
              <td className="px-3 py-2">{formatClock(shift.checkin_at)}</td>
              <td className="px-3 py-2">
                {shift.checkout_at ? (
                  formatClock(shift.checkout_at)
                ) : (
                  <div className="space-y-1">
                    <span className="font-semibold text-amber-700">Glemt utsjekk</span>
                    <CorrectShiftForm shiftId={shift.id} />
                  </div>
                )}
              </td>
              <td className="px-3 py-2">
                {formatDurationLabel(
                  shiftDurationMinutes({
                    checkin_at: shift.checkin_at,
                    checkout_at: shift.checkout_at,
                  })
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
