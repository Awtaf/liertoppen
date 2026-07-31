"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoIcon } from "./LogoIcon";
import { Button } from "./Button";
import { navigation } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function MobileMenu({ solid }: { solid: boolean }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Åpne meny"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
          solid ? "text-navy" : "text-white"
        )}
      >
        <Menu aria-hidden className="h-6 w-6" />
      </button>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobilmeny"
          ref={panelRef}
          className="fixed inset-0 z-[60] flex flex-col bg-navy"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <LogoIcon className="h-9 w-9" />
              <span className="text-base font-bold text-white">
                Østfold Bud Service
              </span>
            </div>
            <button
              type="button"
              ref={closeButtonRef}
              onClick={() => setOpen(false)}
              aria-label="Lukk meny"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
            >
              <X aria-hidden className="h-6 w-6" />
            </button>
          </div>

          <nav
            aria-label="Mobilnavigasjon"
            className="flex flex-1 flex-col justify-center gap-1 px-6"
          >
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-b border-white/10 py-4 text-xl font-semibold text-white transition-colors hover:text-green"
              >
                <span className="text-xs font-mono text-green/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="px-6 pb-10">
            <Button
              href="/#kontakt"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Bli samarbeidspartner
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
