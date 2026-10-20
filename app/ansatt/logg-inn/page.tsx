import type { Metadata } from "next";
import { PinLoginForm } from "@/components/ansatt/PinLoginForm";

export const metadata: Metadata = {
  title: "Logg inn",
};

export default async function AnsattLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-teliapurple/15 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-teliapurple-dark">Logg inn</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bruk brukernavn og PIN-kode (eller e-post og passord for ledere).
        </p>
        <PinLoginForm redirectTo={redirectTo ?? ""} />
      </div>
    </div>
  );
}
