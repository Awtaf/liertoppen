import type { Metadata, Viewport } from "next";
import { getStaffSession } from "@/lib/staff/auth";
import { staffLogout } from "@/app/ansatt/actions";
import { BottomNav } from "@/components/ansatt/BottomNav";
import { RegisterServiceWorker } from "@/components/ansatt/RegisterServiceWorker";

export const metadata: Metadata = {
  title: {
    default: "Ansatt",
    template: "%s | Telia Liertoppen",
  },
  description: "Innsjekk, timer og oppgaver for ansatte på Telia Liertoppen.",
  manifest: "/ansatt/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Liertoppen",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#990AE3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function AnsattLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();

  return (
    <div className="min-h-screen bg-teliapurple-bg pb-20">
      <RegisterServiceWorker />
      <header className="sticky top-0 z-20 border-b border-teliapurple/15 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <span className="text-sm font-bold tracking-wide text-teliapurple-dark">
            TELIA LIERTOPPEN
          </span>
          {session && (
            <form action={staffLogout} className="flex items-center gap-3">
              <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                {session.name}
              </span>
              <button
                type="submit"
                className="text-xs font-semibold text-teliapurple hover:text-teliapurple-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teliapurple"
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

      {session && <BottomNav role={session.role} />}
    </div>
  );
}
