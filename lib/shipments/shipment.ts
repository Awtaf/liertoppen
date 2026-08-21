import type { ServiceKey, ShipmentPriceResult } from "./pricing";

export type ShipmentStatus =
  | "BOOKET"
  | "TILDELT"
  | "HENTET"
  | "UNDERVEIS"
  | "LEVERT"
  | "AVVIK"
  | "KANSELLERT";

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "BOOKET",
  "TILDELT",
  "HENTET",
  "UNDERVEIS",
  "LEVERT",
  "AVVIK",
  "KANSELLERT",
];

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  BOOKET: "Booket",
  TILDELT: "Tildelt sjåfør",
  HENTET: "Hentet",
  UNDERVEIS: "Underveis",
  LEVERT: "Levert",
  AVVIK: "Avvik",
  KANSELLERT: "Kansellert",
};

export const STATUS_STYLES: Record<ShipmentStatus, string> = {
  BOOKET: "bg-navy/10 text-navy",
  TILDELT: "bg-navy/10 text-navy",
  HENTET: "bg-amber-100 text-amber-800",
  UNDERVEIS: "bg-amber-100 text-amber-800",
  LEVERT: "bg-green/15 text-green-800",
  AVVIK: "bg-red-100 text-red-700",
  KANSELLERT: "bg-slate/10 text-slate",
};

/** Rekkefølgen en normal sending går gjennom, brukt til tidslinje-visning. */
export const STATUS_STEPS: ShipmentStatus[] = [
  "BOOKET",
  "TILDELT",
  "HENTET",
  "UNDERVEIS",
  "LEVERT",
];

/** Kundevendt beskrivelse vist på den offentlige sporingssiden. */
export const STATUS_DESCRIPTIONS: Record<ShipmentStatus, string> = {
  BOOKET: "Sendingen er registrert og venter på å bli tildelt en sjåfør.",
  TILDELT: "En sjåfør er tildelt sendingen.",
  HENTET: "Sendingen er hentet og klar for transport.",
  UNDERVEIS: "Sendingen er underveis til mottaker.",
  LEVERT: "Sendingen er levert.",
  AVVIK: "Det har oppstått et avvik. Vi tar kontakt, eller du kan nå oss på telefon.",
  KANSELLERT: "Sendingen er kansellert.",
};

export type ShipmentParty = {
  name: string;
  addr: string;
  zip: string;
  city: string;
  tel?: string;
};

export type ShipmentGoodsSnapshot = {
  colli: number;
  weightKg: number;
  pallets?: number;
  hours?: number;
};

export type ShipmentEvent = {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  note: string | null;
  occurred_at: string;
};

export type Shipment = {
  id: string;
  tracking_number: string;
  customer_id: string | null;
  sender: ShipmentParty;
  receiver: ShipmentParty;
  goods: ShipmentGoodsSnapshot;
  service_key: ServiceKey;
  zone_id: string | null;
  requested_delivery: string | null;
  price_breakdown: ShipmentPriceResult;
  price_ex_mva: number;
  price_inc_mva: number;
  status: ShipmentStatus;
  reference: string | null;
  notes: string | null;
  created_at: string;
  customers: { name: string; email: string; phone: string | null } | null;
};

/** Felter trygge å vise på den offentlige sporingssiden — minst mulig PII
 * (sted, ikke full adresse), per ostfoldbud-system-spek.md §0/§2.5. */
export type PublicShipmentStatus = {
  tracking_number: string;
  sender_city: string;
  receiver_city: string;
  service_key: ServiceKey;
  status: ShipmentStatus;
  created_at: string;
};

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  EXPRESS: "Bud / ekspress",
  SAMEDAY_ROUTE: "Fast distribusjon",
  PALLET: "Pallegods",
  HOURLY: "Timepris",
};
