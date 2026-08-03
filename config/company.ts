/**
 * Central source of truth for Østfold Bud Service AS company information.
 * Every page/component should import from here instead of hardcoding values,
 * so the entire site only needs to be updated in one place.
 *
 * PLACEHOLDER VALUES — must be confirmed and replaced before launch:
 * - phone
 * - email (post@ostfoldbud.no is a suggested address and must be confirmed)
 * - organizationNumber
 * - address
 */
export const companyInfo = {
  name: "Østfold Bud Service AS",
  shortName: "Østfold Bud Service",
  domain: "ostfoldbud.no",
  url: "https://ostfoldbud.no",
  phone: "[TELEFONNUMMER]",
  phoneHref: "tel:+47XXXXXXXX",
  email: "post@ostfoldbud.no",
  organizationNumber: "[ORGANISASJONSNUMMER]",
  address: "[ADRESSE]",
  postalArea: "Østfold",
  openingHours: "Etter avtale",
  serviceAreas: ["Østfold", "Oslo", "Akershus", "Buskerud"],
} as const;

export const partners = [
  {
    name: "Porterbuddy",
    description: "Underleverandøroppdrag innen bud- og last mile-levering.",
  },
  {
    name: "Best Transport",
    description: "Underleverandøroppdrag innen distribusjon og transport.",
  },
] as const;
