import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/components/admin/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Tilbakestill passord",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const supabase = await createSupabaseServerClient();

  // Lenken fra e-posten bærer en engangskode som byttes mot en midlertidig
  // innlogget økt her — det er den økten updatePassword() i app/admin/actions.ts
  // bruker til å faktisk sette det nye passordet.
  let exchangeFailed = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) exchangeFailed = true;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const invalid = !user || exchangeFailed;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border-light bg-white p-8">
        <h1 className="text-xl font-bold text-navy">Tilbakestill passord</h1>
        {invalid ? (
          <>
            <p className="mt-2 text-sm text-slate">
              Denne lenken er ugyldig eller har utløpt. Be om en ny.
            </p>
            <Link
              href="/admin/glemt-passord"
              className="mt-6 block text-center text-sm font-semibold text-navy hover:text-green"
            >
              Be om ny lenke
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate">Skriv inn et nytt passord.</p>
            <UpdatePasswordForm />
          </>
        )}
      </div>
    </div>
  );
}
