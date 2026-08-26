import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EmployeeTable } from "@/components/ansatt/leder/EmployeeTable";
import { EmployeeForm } from "@/components/ansatt/leder/EmployeeForm";
import type { StaffMember } from "@/lib/staff/types";

export const metadata: Metadata = { title: "Ansatte" };

export default async function AnsattePage() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("staff_members")
    .select("id, name, username, email, role, active, created_at")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Ansatte</h1>
      <EmployeeForm />
      <EmployeeTable members={(data as StaffMember[]) ?? []} />
    </div>
  );
}
