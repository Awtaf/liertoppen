"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { completeTask } from "@/app/ansatt/actions";
import type { ChecklistItem } from "@/lib/staff/tasks";

export function TaskChecklist({ items }: { items: ChecklistItem[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleComplete(taskId: string) {
    setError(null);
    setPendingId(taskId);
    startTransition(async () => {
      const result = await completeTask(taskId);
      if (!result.ok) setError(result.error);
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {items.map(({ task, done }) => (
        <button
          key={task.id}
          type="button"
          disabled={done || (isPending && pendingId === task.id)}
          onClick={() => handleComplete(task.id)}
          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
            done
              ? "border-emerald-200 bg-emerald-50"
              : "border-teliapurple/15 bg-white hover:border-teliapurple/40"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
              done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
            }`}
          >
            {done && <Check aria-hidden className="h-4 w-4" />}
          </span>
          <span className="flex-1">
            <span className={`block text-sm font-semibold ${done ? "text-emerald-800" : "text-slate-900"}`}>
              {task.title}
            </span>
            {task.description && (
              <span className="block text-xs text-slate-500">{task.description}</span>
            )}
          </span>
          <span className="shrink-0 text-xs font-bold text-teliapurple-dark">
            +{task.points} p
          </span>
        </button>
      ))}
    </div>
  );
}
