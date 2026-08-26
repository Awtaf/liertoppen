import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/staff/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildHoursCsv, resolveHoursExportRows } from "@/lib/staff/export";

export async function GET(request: NextRequest) {
  const session = await requireStaff().catch(() => null);
  if (!session) {
    return new NextResponse("Ikke innlogget.", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const admin = createSupabaseAdminClient();
  const { rows } = await resolveHoursExportRows(admin, {
    requestedStaffId: searchParams.get("staffId"),
    role: session.role,
    ownStaffId: session.sub,
    ownName: session.name,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  return new NextResponse(buildHoursCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="timer.csv"',
    },
  });
}
