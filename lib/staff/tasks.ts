import type { SupabaseClient } from "@supabase/supabase-js";
import { dailyPeriodKey, weeklyPeriodKey, ONE_TIME_PERIOD_KEY } from "@/lib/staff/periods";
import type { StaffTask, TaskCompletion, TaskType } from "@/lib/staff/types";

export function periodKeyForType(type: TaskType, at: Date = new Date()): string {
  if (type === "daily") return dailyPeriodKey(at);
  if (type === "weekly") return weeklyPeriodKey(at);
  return ONE_TIME_PERIOD_KEY;
}

export async function getActiveTasks(admin: SupabaseClient): Promise<StaffTask[]> {
  const { data } = await admin
    .from("staff_tasks")
    .select("*")
    .eq("active", true)
    .order("type", { ascending: true })
    .order("title", { ascending: true });
  return (data as StaffTask[]) ?? [];
}

export async function getAllTasks(admin: SupabaseClient): Promise<StaffTask[]> {
  const { data } = await admin
    .from("staff_tasks")
    .select("*")
    .order("type", { ascending: true })
    .order("title", { ascending: true });
  return (data as StaffTask[]) ?? [];
}

export async function getCompletionsForStaff(
  admin: SupabaseClient,
  staffId: string
): Promise<TaskCompletion[]> {
  const { data } = await admin
    .from("staff_task_completions")
    .select("*")
    .eq("staff_id", staffId);
  return (data as TaskCompletion[]) ?? [];
}

export type ChecklistItem = {
  task: StaffTask;
  done: boolean;
  completedAt: string | null;
};

/** Today's/this week's checklist for one employee: active tasks joined with
 * whether they're already completed for their current period. */
export function buildChecklist(
  tasks: StaffTask[],
  completions: TaskCompletion[],
  at: Date = new Date()
): ChecklistItem[] {
  return tasks.map((task) => {
    const periodKey = periodKeyForType(task.type, at);
    const completion = completions.find(
      (c) => c.task_id === task.id && c.period_key === periodKey
    );
    return { task, done: Boolean(completion), completedAt: completion?.completed_at ?? null };
  });
}

export type CompleteTaskResult =
  | { ok: true; pointsAwarded: number }
  | { ok: false; error: string };

export async function completeTask(
  admin: SupabaseClient,
  staffId: string,
  taskId: string
): Promise<CompleteTaskResult> {
  const { data: task } = await admin
    .from("staff_tasks")
    .select("*")
    .eq("id", taskId)
    .eq("active", true)
    .maybeSingle();

  if (!task) {
    return { ok: false, error: "Fant ikke oppgaven." };
  }

  const periodKey = periodKeyForType((task as StaffTask).type);
  const { error } = await admin.from("staff_task_completions").insert({
    staff_id: staffId,
    task_id: taskId,
    period_key: periodKey,
    completed_at: new Date().toISOString(),
    points_awarded: (task as StaffTask).points,
  });

  if (error) {
    // Unique(staff_id, task_id, period_key) violation = already checked off.
    if (error.code === "23505") {
      return { ok: false, error: "Denne oppgaven er allerede fullført for perioden." };
    }
    return { ok: false, error: "Kunne ikke registrere oppgaven. Prøv igjen." };
  }

  return { ok: true, pointsAwarded: (task as StaffTask).points };
}
