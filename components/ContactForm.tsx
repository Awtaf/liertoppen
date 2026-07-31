"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./Button";
import {
  initialContactFormData,
  jobTypeOptions,
  validateContactForm,
  hasErrors,
  type ContactFormData,
  type ContactFormErrors,
} from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClasses =
  "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate/60 transition-colors focus:border-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green";

const labelClasses = "mb-1.5 block text-sm font-semibold text-navy";
const errorClasses = "mt-1.5 text-xs font-medium text-red-600";

export function ContactForm() {
  const [data, setData] = useState<ContactFormData>(initialContactFormData);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const formId = useId();

  function update<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateContactForm(data);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Innsending feilet");
      }

      setStatus("success");
      setData(initialContactFormData);
      setErrors({});
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 rounded-2xl border border-green/30 bg-green/5 px-8 py-14 text-center"
      >
        <CheckCircle2 aria-hidden className="h-12 w-12 text-green" />
        <div>
          <p className="text-lg font-bold text-navy">
            Takk for henvendelsen.
          </p>
          <p className="mt-1 text-sm text-slate">
            Vi tar kontakt så snart som mulig.
          </p>
        </div>
        <Button
          variant="secondary-dark"
          showArrow={false}
          onClick={() => setStatus("idle")}
        >
          Send en ny henvendelse
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border-light bg-white p-6 sm:p-8"
    >
      {/* Honeypot field — hidden from real users, catches basic bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>La stå tomt</label>
        <input
          id={`${formId}-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={data.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-name`} className={labelClasses}>
            Navn <span className="text-green">*</span>
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            required
            autoComplete="name"
            value={data.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            className={fieldClasses}
          />
          {errors.name && (
            <p id={`${formId}-name-error`} className={errorClasses}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-company`} className={labelClasses}>
            Bedrift
          </label>
          <input
            id={`${formId}-company`}
            type="text"
            autoComplete="organization"
            value={data.company}
            onChange={(event) => update("company", event.target.value)}
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className={labelClasses}>
            Telefonnummer
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            autoComplete="tel"
            value={data.phone}
            onChange={(event) => update("phone", event.target.value)}
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className={labelClasses}>
            E-post <span className="text-green">*</span>
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            required
            autoComplete="email"
            value={data.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
            className={fieldClasses}
          />
          {errors.email && (
            <p id={`${formId}-email-error`} className={errorClasses}>
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-jobType`} className={labelClasses}>
            Type oppdrag <span className="text-green">*</span>
          </label>
          <select
            id={`${formId}-jobType`}
            required
            value={data.jobType}
            onChange={(event) => update("jobType", event.target.value)}
            aria-invalid={Boolean(errors.jobType)}
            aria-describedby={errors.jobType ? `${formId}-jobType-error` : undefined}
            className={fieldClasses}
          >
            <option value="">Velg type oppdrag</option>
            {jobTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.jobType && (
            <p id={`${formId}-jobType-error`} className={errorClasses}>
              {errors.jobType}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-area`} className={labelClasses}>
            Område
          </label>
          <input
            id={`${formId}-area`}
            type="text"
            placeholder="F.eks. Østfold, Oslo"
            value={data.area}
            onChange={(event) => update("area", event.target.value)}
            className={fieldClasses}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-desiredStart`} className={labelClasses}>
            Ønsket oppstart
          </label>
          <input
            id={`${formId}-desiredStart`}
            type="text"
            placeholder="F.eks. Så snart som mulig, eller en dato"
            value={data.desiredStart}
            onChange={(event) => update("desiredStart", event.target.value)}
            className={fieldClasses}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-message`} className={labelClasses}>
            Melding <span className="text-green">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            required
            rows={5}
            value={data.message}
            onChange={(event) => update("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${formId}-message-error` : undefined}
            className={fieldClasses}
          />
          {errors.message && (
            <p id={`${formId}-message-error`} className={errorClasses}>
              {errors.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm text-slate">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(event) => update("consent", event.target.checked)}
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-light text-green accent-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            />
            Jeg samtykker til at Østfold Bud Service AS kan kontakte meg
            angående henvendelsen.
          </label>
          {errors.consent && (
            <p id={`${formId}-consent-error`} className={errorClasses}>
              {errors.consent}
            </p>
          )}
        </div>
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="mt-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
          Noe gikk galt under innsendingen. Prøv igjen, eller ta kontakt
          direkte på telefon eller e-post.
        </div>
      )}

      <div className="mt-7">
        <Button
          type="submit"
          disabled={status === "submitting"}
          showArrow={status !== "submitting"}
          className="w-full sm:w-auto"
        >
          {status === "submitting" ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              Sender...
            </>
          ) : (
            "Send henvendelse"
          )}
        </Button>
      </div>
    </form>
  );
}
