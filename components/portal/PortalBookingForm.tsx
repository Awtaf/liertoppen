"use client";

import { useActionState, useEffect, useState } from "react";
import { createCustomerShipment } from "@/app/portal/actions";
import type { ServiceKey, ShipmentPriceResult } from "@/lib/shipments/pricing";

const inputClass =
  "w-full rounded-lg border border-border-light bg-bg-light px-3 py-2 text-sm text-navy focus:border-green focus:bg-white focus-visible:outline-none";
const labelClass = "mb-1.5 block text-xs font-semibold text-navy";

const SERVICE_OPTIONS: { key: ServiceKey; label: string }[] = [
  { key: "EXPRESS", label: "Bud / ekspress (direktekjøring A→B)" },
  { key: "SAMEDAY_ROUTE", label: "Fast distribusjon (samlast på rute)" },
  { key: "PALLET", label: "Pallegods (EUR-pall)" },
  { key: "HOURLY", label: "Timepris (dedikert bil)" },
];

export function PortalBookingForm() {
  const [error, formAction, isPending] = useActionState(createCustomerShipment, null);

  const [serviceKey, setServiceKey] = useState<ServiceKey>("SAMEDAY_ROUTE");
  const [receiverZip, setReceiverZip] = useState("");
  const [pallets, setPallets] = useState(1);
  const [hours, setHours] = useState(2);
  const [expressGuarantee, setExpressGuarantee] = useState(false);
  const [eveningWeekend, setEveningWeekend] = useState(false);
  const [night, setNight] = useState(false);
  const [carry, setCarry] = useState(false);

  const [price, setPrice] = useState<ShipmentPriceResult | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const outsideZoneExpress = serviceKey === "EXPRESS" && price !== null && !price.zone;

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      if (receiverZip.trim().length !== 4) {
        setPrice(null);
        setPriceError(null);
        return;
      }
      fetch("/api/sendinger/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          serviceKey,
          postnr: receiverZip,
          pallets,
          hours,
          expressGuarantee,
          eveningWeekend,
          night,
          carry,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.message ?? "Kunne ikke beregne pris.");
          }
          return res.json();
        })
        .then((data) => {
          setPrice(data.price);
          setPriceError(null);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          setPrice(null);
          setPriceError(err.message);
        });
    }, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [serviceKey, receiverZip, pallets, hours, expressGuarantee, eveningWeekend, night, carry]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <fieldset className="rounded-2xl border border-border-light bg-white p-6">
          <legend className="px-1 text-xs font-bold tracking-wide text-slate uppercase">Hentested</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Adresse</label>
              <input name="senderAddr" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Postnummer</label>
              <input name="senderZip" required inputMode="numeric" maxLength={4} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sted</label>
              <input name="senderCity" required className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border-light bg-white p-6">
          <legend className="px-1 text-xs font-bold tracking-wide text-slate uppercase">Mottaker</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Bedrift / navn</label>
              <input name="receiverName" required className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Adresse</label>
              <input name="receiverAddr" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Postnummer</label>
              <input
                name="receiverZip"
                required
                inputMode="numeric"
                maxLength={4}
                value={receiverZip}
                onChange={(e) => setReceiverZip(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sted</label>
              <input name="receiverCity" required className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Telefon</label>
              <input name="receiverTel" className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border-light bg-white p-6">
          <legend className="px-1 text-xs font-bold tracking-wide text-slate uppercase">Gods og tjeneste</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Tjeneste</label>
              <select
                name="serviceKey"
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value as ServiceKey)}
                className={inputClass}
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Kolli</label>
              <input name="colli" type="number" min={1} defaultValue={1} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Vekt (kg)</label>
              <input name="weightKg" type="number" min={0} defaultValue={0} className={inputClass} />
            </div>
            {serviceKey === "PALLET" && (
              <div>
                <label className={labelClass}>Antall paller</label>
                <input
                  name="pallets"
                  type="number"
                  min={1}
                  value={pallets}
                  onChange={(e) => setPallets(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            )}
            {serviceKey === "HOURLY" && (
              <div>
                <label className={labelClass}>Antall timer</label>
                <input
                  name="hours"
                  type="number"
                  min={2}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className={labelClass}>Ønsket levering</label>
              <input name="requestedDelivery" placeholder="f.eks. i morgen, fredag 14. aug" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Referanse</label>
              <input name="reference" className={inputClass} />
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-border-light pt-4">
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                name="expressGuarantee"
                checked={expressGuarantee}
                onChange={(e) => setExpressGuarantee(e.target.checked)}
              />
              Garantert innen 1–2 timer (+50 %)
            </label>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                name="eveningWeekend"
                checked={eveningWeekend}
                onChange={(e) => setEveningWeekend(e.target.checked)}
              />
              Kveld (16–22) eller helg (+40 %)
            </label>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" name="night" checked={night} onChange={(e) => setNight(e.target.checked)} />
              Natt (+60 %)
            </label>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" name="carry" checked={carry} onChange={(e) => setCarry(e.target.checked)} />
              Bæring / etasjer / to mann
            </label>
          </div>
        </fieldset>
      </div>

      <div>
        <div className="sticky top-6 rounded-2xl border border-border-light bg-white p-6">
          <h2 className="text-sm font-bold tracking-wide text-navy uppercase">Pris — beregnes live</h2>

          {!price && !priceError && <p className="mt-4 text-sm text-slate">Fyll inn mottakers postnummer for å se pris.</p>}
          {priceError && <p className="mt-4 text-sm text-red-600">{priceError}</p>}

          {outsideZoneExpress && (
            <p className="mt-4 text-sm text-red-600">
              Denne adressen er utenfor våre faste soner for ekspress. Ta kontakt med oss direkte for et tilbud.
            </p>
          )}

          {price && !outsideZoneExpress && (
            <>
              <p className="mt-2 text-sm font-medium text-navy">{price.zone ? price.zone.name : "Utenfor definerte soner"}</p>
              <div className="mt-4 space-y-1.5 rounded-xl border border-border-light bg-bg-light p-4 text-sm">
                {price.lines.map((line, i) => (
                  <div key={i} className="flex justify-between gap-4">
                    <span className="text-slate">{line.label}</span>
                    <span className="font-medium text-navy">{line.amountExMva.toLocaleString("nb-NO")} kr</span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-border-light pt-1.5">
                  <span className="text-slate">Mva (25 %)</span>
                  <span className="font-medium text-navy">{price.mva.toLocaleString("nb-NO")} kr</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-border-light pt-2 text-base">
                  <span className="font-bold text-navy">Totalt inkl. mva</span>
                  <span className="font-bold text-navy">{price.totalIncMva.toLocaleString("nb-NO")} kr</span>
                </div>
              </div>
            </>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending || !price || outsideZoneExpress}
            className="mt-6 w-full rounded-lg bg-green px-5 py-3 text-sm font-semibold text-navy hover:bg-green/90 disabled:opacity-60"
          >
            {isPending ? "Booker…" : "Bekreft booking"}
          </button>
        </div>
      </div>
    </form>
  );
}
