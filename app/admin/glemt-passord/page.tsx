import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Glemt passord",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border-light bg-white p-8">
        <h1 className="text-xl font-bold text-navy">Glemt passord</h1>
        <p className="mt-1 text-sm text-slate">
          Skriv inn e-posten din, så sender vi deg en lenke for å sette et nytt passord.
        </p>
        <ForgotPasswordForm />
        <Link href="/admin/login" className="mt-6 block text-center text-sm font-semibold text-slate hover:text-navy">
          Tilbake til innlogging
        </Link>
      </div>
    </div>
  );
}
