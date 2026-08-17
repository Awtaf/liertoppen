// lib/pricing.ts
// =============================================================================
// KOSTNADSBASERT PRISMODELL — Østfold Bud Servis AS
// =============================================================================
// Prinsipp:  Pris = (faktiske kostnader for turen) × (1 + margin)
//            – aldri under minstepris, avrundet til nærmeste 10 kr.
//
// Fordi prisen bygges opp fra dine ekte kostnader + margin, er den LØNNSOM
// av konstruksjon. Når diesel-, strøm- eller lønnskostnad endrer seg, bytter
// du bare tallet i PRISCONFIG — selve logikken består.
//
// Kjøretøyvalg: <= 150 km => elektrisk (Maxus eDeliver 9), over => diesel.
//
// VIKTIG: Alle tall under er STARTVERDIER basert på markedspriser aug. 2026.
// Erstatt dem med DINE faktiske tall (drivstoffkort-pris, ekte sjåførkostnad,
// forsikring, avskrivning) for maksimal presisjon.
//
// SIKKERHET/PERSONVERN: breakdown-feltene under (kjørekostnad, tidskostnad,
// margin osv.) er INTERN kostnadsinformasjon — de vises kun i admin-panelet,
// aldri på den offentlige /tilbud-siden. Se components/QuoteForm.tsx og
// app/admin/leads/[id]/page.tsx.
// =============================================================================

export const PRISCONFIG = {
  // --- Kjøretøyvalg ---
  elGrenseKm: 150, // <= denne => elbil. Over => diesel.

  // --- Variabel kjørekostnad pr km (energi + dekk + vedlikehold + slitasje) ---
  // Elbil:  strøm ~0,35 kWh/km × ~2,5 kr/kWh ≈ 0,9 kr  + dekk/slitasje/vedlikehold ~1,6 kr
  kostPerKmEl: 2.5, // kr/km
  // Diesel: ~0,11 L/km × ~21 kr/L ≈ 2,3 kr + slitasje/vedlikehold ~1,7 kr + bom-avsetning ~0,5 kr
  kostPerKmDiesel: 4.5, // kr/km

  // --- Tomkjøring hjem (bilen returnerer ofte uten last) ---
  // 1.0 = ingen retur betales, 2.0 = full tur/retur. 1.3 = antar noe tom
  // retur, men regner med at en del oppdrag kjedes sammen med andre turer.
  // For dedikerte lange turer der bilen garantert kjører tom hjem: vurder 1.6-2.0.
  returFaktor: 1.3, // JUSTERT NED (var 1.6) — for høy pris meldt tilbake fra eier aug. 2026

  // --- Tidskostnad (sjåfør) ---
  timeprisSjafor: 340, // kr/time, LASTET kostnad (lønn + aga 14,1 % + feriepenger + overhead)
  snittfartKmT: 65, // km/t brukt til å estimere kjøretid
  handteringTimer: 0.5, // timer lasting/lossing pr oppdrag

  // --- Vekt-/volumtillegg ---
  // chargeableKg = max(faktisk vekt, volumvekt),  volumvekt = (L×B×H i cm) / 3000
  // JUSTERT NED (var 0/150/400/900) — det bratte hoppet til 900 kr rett over
  // 300 kg (lett å treffe på store, lette kolli) var en stor driver av "for
  // dyrt"-følelsen. Glattet ut trinnene.
  vekttrinn: [
    { maksKg: 25, tillegg: 0 },
    { maksKg: 100, tillegg: 100 },
    { maksKg: 300, tillegg: 300 },
    { maksKg: Infinity, tillegg: 600 },
  ],

  // --- Tjenestetillegg ---
  ekspressPaaslag: 0.5, // +50 % på subtotal ved ekspress

  // --- Fortjeneste ---
  // Margin dekker fortjeneste + faste kostnader modellen ikke tar per km/time
  // (forsikring, årsavgift, avskrivning, admin). Høyt overhead => øk margin.
  margin: 0.2, // JUSTERT NED (var 0.35 / 35 %)
  minstepris: 299, // kr — aldri under dette. JUSTERT NED (var 349)
  avrundTil: 10, // avrund sluttpris til nærmeste X kr
} as const;

export type PrisInput = {
  distanseKm: number; // ENVEIS, fra Mapbox Matrix API
  vektKg: number;
  lengdeCm: number;
  breddeCm: number;
  hoydeCm: number;
  antallKolli: number;
  ekspress: boolean;
};

export type PrisResultat = {
  pris: number;
  kjoretoy: 'Elektrisk (Maxus)' | 'Diesel (Sprinter)';
  breakdown: {
    elektrisk: boolean;
    enveisKm: number;
    effektivKm: number; // inkl. returfaktor
    kjorekostnad: number;
    tidskostnad: number;
    chargeableKg: number;
    vekttillegg: number;
    ekspress: boolean;
    kostnadTotal: number; // før margin
    margin: number;
  };
};

export function beregnPris(input: PrisInput): PrisResultat {
  const c = PRISCONFIG;

  // 1) Velg kjøretøy + kostnad pr km
  const elektrisk = input.distanseKm <= c.elGrenseKm;
  const kostPerKm = elektrisk ? c.kostPerKmEl : c.kostPerKmDiesel;
  const kjoretoy = elektrisk ? 'Elektrisk (Maxus)' : 'Diesel (Sprinter)';

  // 2) Billbar distanse inkl. tom retur
  const effektivKm = input.distanseKm * c.returFaktor;

  // 3) Kjørekostnad
  const kjorekostnad = effektivKm * kostPerKm;

  // 4) Tidskostnad (kjøretid + håndtering)
  const kjoretimer = effektivKm / c.snittfartKmT;
  const totalTimer = kjoretimer + c.handteringTimer;
  const tidskostnad = totalTimer * c.timeprisSjafor;

  // 5) Vekt-/volumtillegg
  const volumvekt = (input.lengdeCm * input.breddeCm * input.hoydeCm) / 3000;
  const chargeableKg = Math.max(input.vektKg, volumvekt);
  const trinn = c.vekttrinn.find((t) => chargeableKg <= t.maksKg)!;
  const vekttillegg = trinn.tillegg;

  // 6) Subtotal kostnad
  let kostnad = kjorekostnad + tidskostnad + vekttillegg;

  // 7) Ekspress
  if (input.ekspress) kostnad *= 1 + c.ekspressPaaslag;

  // 8) Margin
  let pris = kostnad * (1 + c.margin);

  // 9) Minstepris + avrunding
  pris = Math.max(pris, c.minstepris);
  pris = Math.round(pris / c.avrundTil) * c.avrundTil;

  return {
    pris,
    kjoretoy,
    breakdown: {
      elektrisk,
      enveisKm: Math.round(input.distanseKm),
      effektivKm: Math.round(effektivKm),
      kjorekostnad: Math.round(kjorekostnad),
      tidskostnad: Math.round(tidskostnad),
      chargeableKg: Math.round(chargeableKg),
      vekttillegg,
      ekspress: input.ekspress,
      kostnadTotal: Math.round(kostnad),
      margin: c.margin,
    },
  };
}

// -----------------------------------------------------------------------------
// Eksempler med gjeldende PRISCONFIG (120×80×100 cm pall der ikke annet oppgitt):
//   Drammen→Oslo, 45 km, 200 kg pall, standard   => ~1470 kr (elbil)
//   Lokal 20 km, 50 kg (40×40×40 cm), standard   => ~570 kr  (elbil)
//   Lang tur 250 km, 100 kg (60×60×60 cm), std.  => ~4120 kr (diesel)
//   Sarpsborg→Oslo, 93,6 km, 200 kg pall, std.   => ~2050 kr (elbil)
// -----------------------------------------------------------------------------
