import { setTaskActive } from "@/app/ansatt/leder/actions";
import type { StaffTask } from "@/lib/staff/types";

const TYPE_LABELS: Record<StaffTask["type"], string> = {
  daily: "Daglig",
  weekly: "Ukentlig",
  one_time: "Engangs",
};

export function TaskAdminTable({ tasks }: { tasks: StaffTask[] }) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
            task.active ? "border-teliapurple/15 bg-white" : "border-slate-200 bg-slate-50 opacity-70"
          }`}
        >
          <div>
            <div className="font-semibold text-slate-900">{task.title}</div>
            <div className="text-xs text-slate-500">
              {TYPE_LABELS[task.type]} · {task.points} p
              {task.description ? ` · ${task.description}` : ""}
              {!task.active ? " · Deaktivert" : ""}
            </div>
          </div>
          <form action={setTaskActive.bind(null, task.id, !task.active)}>
            <button
              type="submit"
              className="rounded-full border border-teliapurple/30 px-3 py-1 text-xs font-semibold text-teliapurple-dark hover:bg-teliapurple/5"
            >
              {task.active ? "Deaktiver" : "Aktiver"}
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
