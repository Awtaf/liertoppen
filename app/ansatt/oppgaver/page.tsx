import type { Metadata } from "next";
import { requireStaff } from "@/lib/staff/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActiveTasks, getCompletionsForStaff, buildChecklist } from "@/lib/staff/tasks";
import { TaskChecklist } from "@/components/ansatt/TaskChecklist";
import type { TaskType } from "@/lib/staff/types";

export const metadata: Metadata = { title: "Oppgaver" };

const SECTION_LABELS: Record<TaskType, string> = {
  daily: "I dag",
  weekly: "Denne uken",
  one_time: "Engangsoppgaver",
};

export default async function OppgaverPage() {
  const session = await requireStaff();
  const admin = createSupabaseAdminClient();
  const [tasks, completions] = await Promise.all([
    getActiveTasks(admin),
    getCompletionsForStaff(admin, session.sub),
  ]);
  const checklist = buildChecklist(tasks, completions);

  const sections: TaskType[] = ["daily", "weekly", "one_time"];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Oppgaver</h1>

      {sections.map((type) => {
        const items = checklist.filter((item) => item.task.type === type);
        if (items.length === 0) return null;
        return (
          <div key={type} className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {SECTION_LABELS[type]}
            </h2>
            <TaskChecklist items={items} />
          </div>
        );
      })}

      {checklist.length === 0 && (
        <p className="text-sm text-slate-500">Ingen oppgaver er satt opp ennå.</p>
      )}
    </div>
  );
}
