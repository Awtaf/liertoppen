"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";
import { navigation } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // Only the homepage has a dark hero behind the header, so only there can
  // the header start transparent with light text. Every other page has a
  // white background from the top and needs the solid header immediately.
  const hasTransparentHero = pathname === "/";

  useEffect(() => {
    if (!hasTransparentHero) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasTransparentHero]);

  const solid = !hasTransparentHero || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "bg-white/95 shadow-sm shadow-navy/5 backdrop-blur-sm"
          : "bg-transparent"
      )}
    >
      <Container>
        <div className="flex h-18 items-center justify-between py-3">
          <Link
            href="/#forside"
            className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
            aria-label="Østfold Bud Service AS, til forsiden"
          >
            <Logo variant={solid ? "dark" : "light"} />
          </Link>

          <nav
            aria-label="Hovednavigasjon"
            className="hidden items-center gap-8 lg:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-green",
                  solid ? "text-navy" : "text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button href="/#kontakt" size="md">
              Bli samarbeidspartner
            </Button>
          </div>

          <MobileMenu solid={solid} />
        </div>
      </Container>
    </header>
  );
}
