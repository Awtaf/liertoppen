"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Til toppen av siden"
      className="fixed right-5 bottom-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-green shadow-lg shadow-navy/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green sm:right-8 sm:bottom-8"
    >
      <ArrowUp aria-hidden className="h-5 w-5" />
    </button>
  );
}
