import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Logg inn",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border-light bg-white p-8">
        <h1 className="text-xl font-bold text-navy">Logg inn</h1>
        <p className="mt-1 text-sm text-slate">
          Admin-panel for Østfold Bud Service AS.
        </p>
        <LoginForm redirectTo={redirectTo ?? "/admin/leads"} />
      </div>
    </div>
  );
}
