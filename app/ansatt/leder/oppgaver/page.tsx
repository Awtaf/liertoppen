import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAllTasks } from "@/lib/staff/tasks";
import { TaskForm } from "@/components/ansatt/leder/TaskForm";
import { TaskAdminTable } from "@/components/ansatt/leder/TaskAdminTable";

export const metadata: Metadata = { title: "Oppgaver – leder" };

export default async function LederOppgaverPage() {
  const admin = createSupabaseAdminClient();
  const tasks = await getAllTasks(admin);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Oppgaver og rutiner</h1>
      <TaskForm />
      <TaskAdminTable tasks={tasks} />
    </div>
  );
}
