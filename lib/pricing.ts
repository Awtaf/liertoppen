/**
 * Prismotor for tilbudsskjemaet. Alle beløp under er startverdier — juster
 * dem fritt, ingen annen kode må endres når prisene endres.
 */

export type ServiceType = "standard" | "ekspress";

export const PRICING_CONFIG = {
  /** Grunnpris i kr, inkludert i alle tilbud. JUSTER */
  grunnpris: 149,
  /** Kr per kilometer kjørt distanse. JUSTER */
  kmSats: 12,
  /** Prosent tillegg på subtotalen for ekspressoppdrag (0.5 = 50 %). JUSTER */
  ekspressTillegg: 0.5,
  /** Laveste pris som kan returneres, uansett utregning. JUSTER */
  minstepris: 199,
  /**
   * Vektpåslag i kr basert på belastet vekt (chargeable weight), i stigende
   * rekkefølge. `inntilKg: null` betyr "og oppover". JUSTER
   */
  vektTiers: [
    { inntilKg: 25, tillegg: 0 },
    { inntilKg: 100, tillegg: 150 },
    { inntilKg: 300, tillegg: 400 },
    { inntilKg: null as number | null, tillegg: 900 },
  ],
  /** Volumetrisk vekt-divisor (cm³ / denne verdien = kg). JUSTER */
  volumDivisor: 3000,
} as const;

export type PriceBreakdownLine = {
  label: string;
  amount: number;
};

export type PriceBreakdown = {
  chargeableWeightKg: number;
  volumetricWeightKg: number;
  lines: PriceBreakdownLine[];
  subtotal: number;
  total: number;
};

export function calculateVolumetricWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number
): number {
  return (lengthCm * widthCm * heightCm) / PRICING_CONFIG.volumDivisor;
}

function weightSurcharge(chargeableWeightKg: number): number {
  for (const tier of PRICING_CONFIG.vektTiers) {
    if (tier.inntilKg === null || chargeableWeightKg <= tier.inntilKg) {
      return tier.tillegg;
    }
  }
  return 0;
}

function roundToNearest10(value: number): number {
  return Math.round(value / 10) * 10;
}

export function calculatePrice(input: {
  actualWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  distanceKm: number;
  serviceType: ServiceType;
}): PriceBreakdown {
  const volumetricWeightKg = calculateVolumetricWeight(
    input.lengthCm,
    input.widthCm,
    input.heightCm
  );
  const chargeableWeightKg = Math.max(input.actualWeightKg, volumetricWeightKg);

  const lines: PriceBreakdownLine[] = [
    { label: "Grunnpris", amount: PRICING_CONFIG.grunnpris },
    {
      label: `Distanse (${input.distanceKm.toFixed(1)} km)`,
      amount: roundToNearest10(input.distanceKm * PRICING_CONFIG.kmSats),
    },
    {
      label: `Vekt/volum (${chargeableWeightKg.toFixed(1)} kg belastet)`,
      amount: weightSurcharge(chargeableWeightKg),
    },
  ];

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);

  if (input.serviceType === "ekspress") {
    lines.push({
      label: `Ekspress-tillegg (${Math.round(PRICING_CONFIG.ekspressTillegg * 100)} %)`,
      amount: roundToNearest10(subtotal * PRICING_CONFIG.ekspressTillegg),
    });
  }

  const rawTotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const total = Math.max(roundToNearest10(rawTotal), PRICING_CONFIG.minstepris);

  return {
    chargeableWeightKg,
    volumetricWeightKg,
    lines,
    subtotal,
    total,
  };
}
