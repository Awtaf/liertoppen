// lib/shipments/pricing.ts
// =============================================================================
// Sonebasert prisberegningsmotor for fraktsystemet (ikke å forveksle med
// lib/pricing.ts, som er den kostnadsbaserte modellen for /tilbud-skjemaet).
//
// Alle satser hentes fra Supabase (zones/services/surcharges) — ingenting er
// hardkodet her, i tråd med ostfoldbud-system-spek.md §2.6. Admin endrer
// satsene i /admin/priser uten ny deploy.
// =============================================================================
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ServiceKey = "EXPRESS" | "SAMEDAY_ROUTE" | "PALLET" | "HOURLY";

export type Zone = {
  id: string;
  code: number;
  name: string;
  postnr_ranges: [number, number][];
  express_start_price: number;
  per_stop_price: number | null;
};

export type ServiceConfig = {
  key: ServiceKey;
  name: string;
  description: string | null;
  config: Record<string, number>;
};

export type SurchargeRate = {
  key: string;
  label: string;
  type: "PCT" | "FIXED";
  value: number;
};

export type PriceLine = { label: string; amountExMva: number };

export type ShipmentGoods = {
  pallets?: number;
  hours?: number;
  /** Manuelt anslåtte km utover sonegrensen, kun brukt for EXPRESS utenfor sone. */
  extraKmOutsideZone?: number;
};

export type SurchargeSelection = {
  expressGuarantee?: boolean;
  eveningWeekend?: boolean;
  night?: boolean;
  carry?: boolean;
};

export type ShipmentPriceResult = {
  zone: { id: string; code: number; name: string } | null;
  lines: PriceLine[];
  subtotalExMva: number;
  mvaRate: number;
  mva: number;
  totalIncMva: number;
};

const MVA_RATE = 0.25;

export async function fetchZones(): Promise<Zone[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("zones")
    .select("id, code, name, postnr_ranges, express_start_price, per_stop_price")
    .order("code")
    .returns<Zone[]>();
  if (error) throw new Error("Kunne ikke hente soner: " + error.message);
  return data ?? [];
}

export async function fetchServices(): Promise<ServiceConfig[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("services")
    .select("key, name, description, config")
    .order("sort_order")
    .returns<ServiceConfig[]>();
  if (error) throw new Error("Kunne ikke hente tjenester: " + error.message);
  return data ?? [];
}

export async function fetchSurcharges(): Promise<SurchargeRate[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("surcharges")
    .select("key, label, type, value")
    .order("sort_order")
    .returns<SurchargeRate[]>();
  if (error) throw new Error("Kunne ikke hente tillegg: " + error.message);
  return data ?? [];
}

export function resolveZone(zones: Zone[], postnr: string): Zone | null {
  const zip = parseInt(postnr, 10);
  if (!Number.isFinite(zip)) return null;
  return (
    zones.find((zone) =>
      zone.postnr_ranges.some(([min, max]) => zip >= min && zip <= max)
    ) ?? null
  );
}

export async function priceShipment(input: {
  serviceKey: ServiceKey;
  postnr: string;
  goods?: ShipmentGoods;
  surcharges?: SurchargeSelection;
}): Promise<ShipmentPriceResult> {
  const [zones, services, surchargeRates] = await Promise.all([
    fetchZones(),
    fetchServices(),
    fetchSurcharges(),
  ]);

  const service = services.find((s) => s.key === input.serviceKey);
  if (!service) {
    throw new Error(`Ukjent tjeneste: ${input.serviceKey}`);
  }
  const zone = resolveZone(zones, input.postnr);
  const cfg = service.config;

  const lines: PriceLine[] = [];
  let subtotal = 0;

  if (input.serviceKey === "EXPRESS") {
    if (zone) {
      lines.push({
        label: `Startpris ${zone.name} (henting + 10 km + 15 min)`,
        amountExMva: zone.express_start_price,
      });
      subtotal += zone.express_start_price;
    } else {
      // Utenfor sone: sone 4-pris (Oslo) + km-tillegg. Krever et manuelt
      // kilometerestimat siden vi ikke geokoder i denne motoren.
      const zone4 = zones.find((z) => z.code === 4);
      const base = zone4?.express_start_price ?? 990;
      const kmRate = cfg.kmRateOutsideZone ?? 0;
      const extraKm = input.goods?.extraKmOutsideZone ?? 0;
      lines.push({ label: "Sone 4-pris (Oslo), utenfor definerte soner", amountExMva: base });
      subtotal += base;
      if (extraKm > 0) {
        const add = Math.round(extraKm * kmRate);
        lines.push({ label: `${extraKm} km utover sonegrense à ${kmRate} kr/km`, amountExMva: add });
        subtotal += add;
      }
    }
  } else if (input.serviceKey === "SAMEDAY_ROUTE") {
    const perStop = zone?.per_stop_price ?? cfg.fallbackPerStopPrice ?? 0;
    lines.push({
      label: `Pris per stopp, ${zone ? zone.name : "utenfor sone"}`,
      amountExMva: perStop,
    });
    subtotal += perStop;
    lines.push({
      label: `Inngår i fast rute — minstepris ${cfg.minRoutePricePerDay ?? 2500} kr/dag dekkes av rutens øvrige stopp`,
      amountExMva: 0,
    });
  } else if (input.serviceKey === "PALLET") {
    const pallets = Math.max(1, Math.round(input.goods?.pallets ?? 1));
    const onRoute = zone ? zone.code <= (cfg.onRouteMaxZoneCode ?? 2) : false;
    const first = onRoute ? cfg.onRoutePrice : cfg.directPrice;
    lines.push({
      label: `1. pall (${onRoute ? "på rute/samlast" : "direktekjøring"})`,
      amountExMva: first,
    });
    subtotal += first;
    if (pallets > 1) {
      const extra = (pallets - 1) * (cfg.extraPalletPrice ?? 0);
      lines.push({ label: `${pallets - 1} tilleggspall à ${cfg.extraPalletPrice} kr`, amountExMva: extra });
      subtotal += extra;
    }
  } else if (input.serviceKey === "HOURLY") {
    const hours = Math.max(cfg.minHours ?? 2, input.goods?.hours ?? cfg.minHours ?? 2);
    if (hours >= (cfg.fullDayHours ?? 8)) {
      lines.push({ label: `Dagsleie (${cfg.fullDayHours ?? 8} t)`, amountExMva: cfg.fullDayPrice });
      subtotal += cfg.fullDayPrice;
    } else {
      const cost = Math.round(hours * cfg.perHour);
      lines.push({ label: `${hours} t à ${cfg.perHour} kr (min. ${cfg.minHours} t)`, amountExMva: cost });
      subtotal += cost;
    }
  }

  const sel = input.surcharges ?? {};
  const applySurcharge = (key: string, active: boolean | undefined) => {
    if (!active) return;
    const rate = surchargeRates.find((s) => s.key === key);
    if (!rate) return;
    const amount = rate.type === "PCT" ? Math.round(subtotal * (rate.value / 100)) : Math.round(rate.value);
    lines.push({ label: `${rate.label} (${rate.type === "PCT" ? `+${rate.value} %` : `${amount} kr`})`, amountExMva: amount });
    subtotal += amount;
  };
  applySurcharge("EXPRESS_GUARANTEE", sel.expressGuarantee);
  applySurcharge("NIGHT", sel.night);
  if (!sel.night) applySurcharge("EVENING_WEEKEND", sel.eveningWeekend);
  applySurcharge("CARRY", sel.carry);

  const mva = Math.round(subtotal * MVA_RATE);
  const totalIncMva = subtotal + mva;

  return {
    zone: zone ? { id: zone.id, code: zone.code, name: zone.name } : null,
    lines,
    subtotalExMva: Math.round(subtotal),
    mvaRate: MVA_RATE,
    mva,
    totalIncMva,
  };
}
