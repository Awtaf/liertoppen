import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logout } from "@/app/admin/actions";
import { LogoIcon } from "@/components/LogoIcon";

export default async function SjaforLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-bg-light">
      <header className="sticky top-0 z-10 border-b border-border-light bg-navy">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-4 px-4">
          <Link href="/sjafor" className="flex shrink-0 items-center gap-2">
            <LogoIcon className="h-7 w-7" />
            <span className="text-sm font-bold text-white">Sjåfør</span>
          </Link>
          {user && (
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-semibold text-white/70 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
              >
                Logg ut
              </button>
            </form>
          )}
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-lg px-4 py-6">
        {children}
      </main>
    </div>
  );
}
