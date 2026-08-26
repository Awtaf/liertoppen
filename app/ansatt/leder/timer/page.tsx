import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAllShiftsWithStaff } from "@/lib/staff/shifts";
import { HoursAdminTable } from "@/components/ansatt/leder/HoursAdminTable";

export const metadata: Metadata = { title: "Timer – leder" };

export default async function LederTimerPage() {
  const admin = createSupabaseAdminClient();
  const shifts = await getAllShiftsWithStaff(admin);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Timer – alle ansatte</h1>
        <div className="flex gap-3 text-sm">
          <a
            href="/api/ansatt/eksport/csv?staffId=all"
            className="rounded-full border border-teliapurple/30 px-4 py-1.5 font-semibold text-teliapurple-dark hover:bg-teliapurple/5"
          >
            Eksporter CSV
          </a>
          <a
            href="/api/ansatt/eksport/pdf?staffId=all"
            className="rounded-full border border-teliapurple/30 px-4 py-1.5 font-semibold text-teliapurple-dark hover:bg-teliapurple/5"
          >
            Eksporter PDF
          </a>
        </div>
      </div>

      <HoursAdminTable
        shifts={
          shifts as {
            id: string;
            checkin_at: string;
            checkout_at: string | null;
            staff_members: { name: string; username: string } | null;
          }[]
        }
      />
    </div>
  );
}
