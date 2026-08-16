"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./Button";
import {
  initialQuoteFormData,
  validateQuoteForm,
  hasErrors,
  type QuoteFormData,
  type QuoteFormErrors,
  type QuoteResult,
} from "@/lib/quote";
import type { ServiceType } from "@/lib/pricing";

type CalcStatus = "idle" | "calculating" | "quoted";
type LeadStatus = "idle" | "submitting" | "submitted";

const fieldClasses =
  "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate/60 transition-colors focus:border-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green";

const labelClasses = "mb-1.5 block text-sm font-semibold text-navy";
const errorClasses = "mt-1.5 text-xs font-medium text-red-600";

export function QuoteForm() {
  const [data, setData] = useState<QuoteFormData>(initialQuoteFormData);
  const [errors, setErrors] = useState<QuoteFormErrors>({});
  const [calcStatus, setCalcStatus] = useState<CalcStatus>("idle");
  const [calcError, setCalcError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [leadStatus, setLeadStatus] = useState<LeadStatus>("idle");
  const [leadId, setLeadId] = useState<string | null>(null);
  const formId = useId();

  function update<K extends keyof QuoteFormData>(key: K, value: QuoteFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    // Any change invalidates a previous estimate — force a fresh calculation.
    setQuote(null);
    setCalcStatus("idle");
    setCalcError(null);
  }

  async function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateQuoteForm(data);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      return;
    }

    setCalcStatus("calculating");
    setCalcError(null);

    try {
      const response = await fetch("/api/tilbud/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.field) {
          setErrors((prev) => ({ ...prev, [result.field]: result.message }));
        } else {
          setCalcError(result.message ?? "Noe gikk galt. Prøv igjen.");
        }
        setCalcStatus("idle");
        return;
      }

      setQuote(result as QuoteResult);
      setCalcStatus("quoted");
    } catch {
      setCalcError("Kunne ikke beregne pris akkurat nå. Prøv igjen om litt.");
      setCalcStatus("idle");
    }
  }

  async function handleRequestPickup() {
    if (!quote) return;
    setLeadStatus("submitting");

    try {
      const response = await fetch("/api/tilbud/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, quote }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setLeadStatus("idle");
        setCalcError("Kunne ikke sende forespørselen. Prøv igjen.");
        return;
      }

      setLeadId(result?.leadId ?? null);
      setLeadStatus("submitted");
    } catch {
      setLeadStatus("idle");
      setCalcError("Kunne ikke sende forespørselen. Prøv igjen.");
    }
  }

  if (leadStatus === "submitted") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-2xl border border-green/30 bg-green/5 px-8 py-14 text-center"
      >
        <CheckCircle2 aria-hidden className="h-12 w-12 text-green" />
        <p className="text-lg font-bold text-navy">Takk for forespørselen.</p>
        <p className="max-w-sm text-sm text-slate">
          Vi tar kontakt for å bekrefte henting og endelig pris.
        </p>
        {leadId && (
          <Link
            href={`/tilbud/status/${leadId}`}
            className="mt-1 text-sm font-semibold text-green hover:underline"
          >
            Sjekk status på forespørselen her →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form
        noValidate
        onSubmit={handleCalculate}
        className="rounded-2xl border border-border-light bg-white p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={`${formId}-pickup`} className={labelClasses}>
              Henteadresse <span className="text-green">*</span>
            </label>
            <input
              id={`${formId}-pickup`}
              type="text"
              placeholder="F.eks. Storgata 1, 1701 Sarpsborg"
              value={data.pickupAddress}
              onChange={(e) => update("pickupAddress", e.target.value)}
              aria-invalid={Boolean(errors.pickupAddress)}
              aria-describedby={errors.pickupAddress ? `${formId}-pickup-error` : undefined}
              className={fieldClasses}
            />
            {errors.pickupAddress && (
              <p id={`${formId}-pickup-error`} className={errorClasses}>
                {errors.pickupAddress}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={`${formId}-delivery`} className={labelClasses}>
              Leveringsadresse <span className="text-green">*</span>
            </label>
            <input
              id={`${formId}-delivery`}
              type="text"
              placeholder="F.eks. Karl Johans gate 1, 0154 Oslo"
              value={data.deliveryAddress}
              onChange={(e) => update("deliveryAddress", e.target.value)}
              aria-invalid={Boolean(errors.deliveryAddress)}
              aria-describedby={errors.deliveryAddress ? `${formId}-delivery-error` : undefined}
              className={fieldClasses}
            />
            {errors.deliveryAddress && (
              <p id={`${formId}-delivery-error`} className={errorClasses}>
                {errors.deliveryAddress}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-weight`} className={labelClasses}>
              Vekt (kg) <span className="text-green">*</span>
            </label>
            <input
              id={`${formId}-weight`}
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={data.weightKg}
              onChange={(e) => update("weightKg", e.target.value)}
              aria-invalid={Boolean(errors.weightKg)}
              aria-describedby={errors.weightKg ? `${formId}-weight-error` : undefined}
              className={fieldClasses}
            />
            {errors.weightKg && (
              <p id={`${formId}-weight-error`} className={errorClasses}>
                {errors.weightKg}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-colli`} className={labelClasses}>
              Antall kolli <span className="text-green">*</span>
            </label>
            <input
              id={`${formId}-colli`}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={data.colli}
              onChange={(e) => update("colli", e.target.value)}
              aria-invalid={Boolean(errors.colli)}
              aria-describedby={errors.colli ? `${formId}-colli-error` : undefined}
              className={fieldClasses}
            />
            {errors.colli && (
              <p id={`${formId}-colli-error`} className={errorClasses}>
                {errors.colli}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <span className={labelClasses}>
              Mål (cm) <span className="text-green">*</span>
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor={`${formId}-length`} className="sr-only">
                  Lengde
                </label>
                <input
                  id={`${formId}-length`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="Lengde"
                  value={data.lengthCm}
                  onChange={(e) => update("lengthCm", e.target.value)}
                  aria-invalid={Boolean(errors.lengthCm)}
                  className={fieldClasses}
                />
              </div>
              <div>
                <label htmlFor={`${formId}-width`} className="sr-only">
                  Bredde
                </label>
                <input
                  id={`${formId}-width`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="Bredde"
                  value={data.widthCm}
                  onChange={(e) => update("widthCm", e.target.value)}
                  aria-invalid={Boolean(errors.widthCm)}
                  className={fieldClasses}
                />
              </div>
              <div>
                <label htmlFor={`${formId}-height`} className="sr-only">
                  Høyde
                </label>
                <input
                  id={`${formId}-height`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="Høyde"
                  value={data.heightCm}
                  onChange={(e) => update("heightCm", e.target.value)}
                  aria-invalid={Boolean(errors.heightCm)}
                  className={fieldClasses}
                />
              </div>
            </div>
            {(errors.lengthCm || errors.widthCm || errors.heightCm) && (
              <p className={errorClasses}>
                {errors.lengthCm || errors.widthCm || errors.heightCm}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <span className={labelClasses}>Tjenestetype</span>
            <div role="radiogroup" aria-label="Tjenestetype" className="grid grid-cols-2 gap-3">
              {(["standard", "ekspress"] as ServiceType[]).map((type) => (
                <label
                  key={type}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    data.serviceType === type
                      ? "border-navy bg-navy text-white"
                      : "border-border-light bg-white text-navy hover:border-navy/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${formId}-serviceType`}
                    value={type}
                    checked={data.serviceType === type}
                    onChange={() => update("serviceType", type)}
                    className="sr-only"
                  />
                  {type === "standard" ? "Standard" : "Ekspress"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-name`} className={labelClasses}>
              Navn <span className="text-green">*</span>
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              autoComplete="name"
              value={data.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={errors.customerName ? `${formId}-name-error` : undefined}
              className={fieldClasses}
            />
            {errors.customerName && (
              <p id={`${formId}-name-error`} className={errorClasses}>
                {errors.customerName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-phone`} className={labelClasses}>
              Telefon <span className="text-green">*</span>
            </label>
            <input
              id={`${formId}-phone`}
              type="tel"
              autoComplete="tel"
              value={data.customerPhone}
              onChange={(e) => update("customerPhone", e.target.value)}
              aria-invalid={Boolean(errors.customerPhone)}
              aria-describedby={errors.customerPhone ? `${formId}-phone-error` : undefined}
              className={fieldClasses}
            />
            {errors.customerPhone && (
              <p id={`${formId}-phone-error`} className={errorClasses}>
                {errors.customerPhone}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={`${formId}-email`} className={labelClasses}>
              E-post <span className="text-green">*</span>
            </label>
            <input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              value={data.customerEmail}
              onChange={(e) => update("customerEmail", e.target.value)}
              aria-invalid={Boolean(errors.customerEmail)}
              aria-describedby={errors.customerEmail ? `${formId}-email-error` : undefined}
              className={fieldClasses}
            />
            {errors.customerEmail && (
              <p id={`${formId}-email-error`} className={errorClasses}>
                {errors.customerEmail}
              </p>
            )}
          </div>
        </div>

        {calcError && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
            {calcError}
          </div>
        )}

        <div className="mt-7">
          <Button
            type="submit"
            disabled={calcStatus === "calculating"}
            showArrow={calcStatus !== "calculating"}
            className="w-full sm:w-auto"
          >
            {calcStatus === "calculating" ? (
              <>
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                Beregner...
              </>
            ) : (
              "Beregn pris"
            )}
          </Button>
        </div>
      </form>

      {quote && (
        <div className="rounded-2xl border border-green/30 bg-green/5 p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-navy uppercase">
            Veiledende estimat
          </p>
          <p className="mt-1 text-3xl font-bold text-navy">
            {quote.breakdown.total.toLocaleString("nb-NO")} kr
          </p>
          <dl className="mt-4 space-y-1.5 border-t border-green/20 pt-4">
            {quote.breakdown.lines.map((line) => (
              <div key={line.label} className="flex items-center justify-between text-sm">
                <dt className="text-slate">{line.label}</dt>
                <dd className="font-medium text-navy">
                  {line.amount.toLocaleString("nb-NO")} kr
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-slate">
            Dette er et veiledende estimat, ikke en bindende pris. Endelig
            pris bekreftes når vi tar kontakt.
          </p>
          <div className="mt-5">
            <Button
              onClick={handleRequestPickup}
              disabled={leadStatus === "submitting"}
              showArrow={leadStatus !== "submitting"}
              className="w-full sm:w-auto"
            >
              {leadStatus === "submitting" ? (
                <>
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                  Sender...
                </>
              ) : (
                "Be om henting"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
