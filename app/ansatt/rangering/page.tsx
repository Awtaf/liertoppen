import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/staff/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getLeaderboard, type LeaderboardRange } from "@/lib/staff/leaderboard";
import { LeaderboardTable } from "@/components/ansatt/LeaderboardTable";

export const metadata: Metadata = { title: "Rangering" };

const TABS: { value: LeaderboardRange; label: string }[] = [
  { value: "week", label: "Uke" },
  { value: "month", label: "Måned" },
  { value: "total", label: "Totalt" },
];

export default async function RangeringPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await requireStaff();
  const { range: rawRange } = await searchParams;
  const range: LeaderboardRange =
    rawRange === "week" || rawRange === "month" ? rawRange : "total";

  const admin = createSupabaseAdminClient();
  const rows = await getLeaderboard(admin, range);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Rangering</h1>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/ansatt/rangering?range=${tab.value}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              range === tab.value
                ? "bg-teliapurple text-white"
                : "bg-white text-slate-600 border border-teliapurple/20 hover:border-teliapurple/40"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <LeaderboardTable rows={rows} highlightStaffId={session.sub} />
    </div>
  );
}
