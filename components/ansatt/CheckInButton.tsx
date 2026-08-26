"use client";

import { useState, useTransition } from "react";
import { checkIn, checkOut } from "@/app/ansatt/actions";

export function CheckInButton({ isCheckedIn }: { isCheckedIn: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("Denne enheten/nettleseren støtter ikke posisjonsdeling.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        startTransition(async () => {
          const action = isCheckedIn ? checkOut : checkIn;
          const result = await action(latitude, longitude);
          if (!result.ok) setError(result.error);
        });
      },
      (geoError) => {
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Du må gi tillatelse til posisjon i nettleseren for å sjekke inn/ut."
            : "Kunne ikke hente posisjonen din. Prøv igjen."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`w-full rounded-2xl py-9 text-xl font-bold text-white shadow-lg transition-colors disabled:opacity-60 ${
          isCheckedIn
            ? "bg-rose-500 hover:bg-rose-600"
            : "bg-teliapurple hover:bg-teliapurple-dark"
        }`}
      >
        {pending ? "Henter posisjon …" : isCheckedIn ? "Sjekk ut" : "Sjekk inn"}
      </button>
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
    </div>
  );
}
