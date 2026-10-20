"use client";

import { useEffect } from "react";

/** Registers the static-shell-only service worker (public/ansatt-sw.js)
 * scoped to /ansatt/ so the app becomes installable ("Legg til på
 * hjemskjerm"). It never caches dynamic pages — see the worker file for why. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/ansatt-sw.js", { scope: "/ansatt/" })
      .catch((error) => {
        console.error("Kunne ikke registrere service worker:", error);
      });
  }, []);

  return null;
}
