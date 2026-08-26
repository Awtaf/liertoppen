import type { LeaderboardRow } from "@/lib/staff/leaderboard";

export function LeaderboardTable({
  rows,
  highlightStaffId,
}: {
  rows: LeaderboardRow[];
  highlightStaffId?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">Ingen poeng registrert i perioden ennå.</p>;
  }

  return (
    <ol className="space-y-2">
      {rows.map((row, index) => (
        <li
          key={row.staffId}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            row.staffId === highlightStaffId
              ? "border-teliapurple bg-teliapurple/5"
              : "border-teliapurple/15 bg-white"
          }`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teliapurple/10 text-xs font-bold text-teliapurple-dark">
            {index + 1}
          </span>
          <span className="flex-1 text-sm font-semibold text-slate-900">{row.name}</span>
          <span className="text-sm font-bold text-teliapurple-dark">{row.points} p</span>
        </li>
      ))}
    </ol>
  );
}
