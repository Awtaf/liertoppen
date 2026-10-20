import { requireStaff } from "@/lib/staff/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOpenShift, formatClock } from "@/lib/staff/shifts";
import { CheckInButton } from "@/components/ansatt/CheckInButton";

export default async function AnsattHomePage() {
  const session = await requireStaff();
  const admin = createSupabaseAdminClient();
  const openShift = await getOpenShift(admin, session.sub);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hei, {session.name.split(" ")[0]}!</h1>
        <p className="mt-1 text-sm text-slate-500">
          {openShift
            ? `Du er sjekket inn siden ${formatClock(openShift.checkin_at)}.`
            : "Du er ikke sjekket inn."}
        </p>
      </div>

      <CheckInButton isCheckedIn={Boolean(openShift)} />

      <p className="text-center text-xs text-slate-400">
        Du må være i nærheten av butikken for at innsjekk/utsjekk skal godkjennes.
      </p>
    </div>
  );
}
