"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, ListChecks, Trophy, ShieldCheck } from "lucide-react";
import type { StaffRole } from "@/lib/staff/session";

const ITEMS = [
  { href: "/ansatt", label: "Hjem", icon: Home },
  { href: "/ansatt/timer", label: "Timer", icon: Clock },
  { href: "/ansatt/oppgaver", label: "Oppgaver", icon: ListChecks },
  { href: "/ansatt/rangering", label: "Rangering", icon: Trophy },
];

export function BottomNav({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const items =
    role === "leder"
      ? [...ITEMS, { href: "/ansatt/leder", label: "Leder", icon: ShieldCheck }]
      : ITEMS;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-teliapurple/15 bg-white/95 backdrop-blur"
      aria-label="Hovednavigasjon"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/ansatt" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                active ? "text-teliapurple" : "text-slate-400 hover:text-teliapurple-dark"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon aria-hidden className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
