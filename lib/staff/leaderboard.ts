import type { SupabaseClient } from "@supabase/supabase-js";
import { startOfOsloMonth, startOfOsloWeek } from "@/lib/staff/periods";

export type LeaderboardRange = "total" | "week" | "month";

export type LeaderboardRow = {
  staffId: string;
  name: string;
  points: number;
};

async function getActivePeriodStart(admin: SupabaseClient): Promise<Date> {
  const { data } = await admin
    .from("staff_point_periods")
    .select("starts_at")
    .is("ended_at", null)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? new Date(data.starts_at) : new Date(0);
}

export async function getLeaderboard(
  admin: SupabaseClient,
  range: LeaderboardRange
): Promise<LeaderboardRow[]> {
  const since =
    range === "week"
      ? startOfOsloWeek()
      : range === "month"
        ? startOfOsloMonth()
        : await getActivePeriodStart(admin);

  const { data: completions } = await admin
    .from("staff_task_completions")
    .select("staff_id, points_awarded")
    .gte("completed_at", since.toISOString());

  const { data: members } = await admin
    .from("staff_members")
    .select("id, name")
    .eq("active", true);

  const totals = new Map<string, number>();
  for (const row of completions ?? []) {
    totals.set(row.staff_id, (totals.get(row.staff_id) ?? 0) + row.points_awarded);
  }

  const rows: LeaderboardRow[] = (members ?? []).map((m) => ({
    staffId: m.id,
    name: m.name,
    points: totals.get(m.id) ?? 0,
  }));

  return rows.sort((a, b) => b.points - a.points);
}

export async function resetPointsPeriod(
  admin: SupabaseClient,
  label?: string
): Promise<void> {
  const now = new Date().toISOString();
  await admin
    .from("staff_point_periods")
    .update({ ended_at: now })
    .is("ended_at", null);

  const { error } = await admin.from("staff_point_periods").insert({
    label: label?.trim() || `Periode fra ${new Date().toLocaleDateString("no-NO")}`,
    starts_at: now,
  });
  if (error) {
    throw new Error("Kunne ikke starte ny periode: " + error.message);
  }
}
