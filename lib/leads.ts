import type { PriceBreakdown, ServiceType } from "./pricing";

export type LeadStatus = "Ny" | "Kontaktet" | "Bekreftet" | "Avvist";

export const LEAD_STATUSES: LeadStatus[] = [
  "Ny",
  "Kontaktet",
  "Bekreftet",
  "Avvist",
];

export type Lead = {
  id: string;
  customer_id: string | null;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_address: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  colli: number;
  service_type: ServiceType;
  distance_km: number | null;
  price_estimate: number | null;
  price_breakdown: PriceBreakdown | null;
  status: LeadStatus;
  created_at: string;
  customers: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
};

export const STATUS_STYLES: Record<LeadStatus, string> = {
  Ny: "bg-navy/10 text-navy",
  Kontaktet: "bg-amber-100 text-amber-800",
  Bekreftet: "bg-green/15 text-green-800",
  Avvist: "bg-red-100 text-red-700",
};

/** Customer-facing description shown on the public /tilbud/status/[id] page. */
export const STATUS_DESCRIPTIONS: Record<LeadStatus, string> = {
  Ny: "Vi har mottatt forespørselen din og gjennomgår den.",
  Kontaktet: "Vi har vært i kontakt, eller prøver å nå deg, for å avtale detaljer.",
  Bekreftet: "Henting er bekreftet. Vi kontakter deg med nærmere tidspunkt.",
  Avvist: "Vi kan dessverre ikke ta dette oppdraget. Ta gjerne kontakt for detaljer.",
};

/** The normal, non-Avvist progression shown as steps on the status page. */
export const STATUS_STEPS: LeadStatus[] = ["Ny", "Kontaktet", "Bekreftet"];

/** Fields safe to show on the public status-lookup page — no customer PII. */
export type PublicLeadStatus = {
  id: string;
  pickup_address: string;
  delivery_address: string;
  service_type: ServiceType;
  price_estimate: number | null;
  status: LeadStatus;
  created_at: string;
};
