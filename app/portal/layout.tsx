import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { portalLogout } from "./actions";
import { LogoIcon } from "@/components/LogoIcon";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerName: string | null = null;
  if (user) {
    const admin = createSupabaseAdminClient();
    const { data: customer } = await admin.from("customers").select("name").eq("user_id", user.id).maybeSingle();
    customerName = customer?.name ?? null;
  }

  return (
    <div className="min-h-screen bg-bg-light">
      <header className="border-b border-border-light bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-5">
          <Link href="/portal" className="flex shrink-0 items-center gap-2.5">
            <LogoIcon className="h-8 w-8" />
            <span className="hidden text-sm font-bold text-navy sm:inline">Østfold Bud Service — Kundeportal</span>
          </Link>
          {user && (
            <form action={portalLogout} className="flex shrink-0 items-center gap-4">
              <span className="hidden text-sm text-slate sm:inline">{customerName ?? user.email}</span>
              <button
                type="submit"
                className="text-sm font-semibold text-navy hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
              >
                Logg ut
              </button>
            </form>
          )}
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-5xl px-5 py-10">
        {children}
      </main>
    </div>
  );
}
