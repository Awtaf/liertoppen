import Link from "next/link";
import { requireLeder } from "@/lib/staff/auth";

const NAV = [
  { href: "/ansatt/leder", label: "Oversikt" },
  { href: "/ansatt/leder/ansatte", label: "Ansatte" },
  { href: "/ansatt/leder/timer", label: "Timer" },
  { href: "/ansatt/leder/oppgaver", label: "Oppgaver" },
  { href: "/ansatt/leder/rangering", label: "Rangering" },
  { href: "/ansatt/leder/innstillinger", label: "Innstillinger" },
];

export default async function LederLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireLeder();

  return (
    <div className="space-y-5">
      <nav className="-mx-4 flex gap-4 overflow-x-auto border-b border-teliapurple/15 px-4 pb-2 text-sm font-medium text-slate-500">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 whitespace-nowrap hover:text-teliapurple-dark">
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
