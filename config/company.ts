/**
 * Central source of truth for Østfold Bud Service AS company information.
 * Every page/component should import from here instead of hardcoding values,
 * so the entire site only needs to be updated in one place.
 *
 * PLACEHOLDER VALUES — must be confirmed and replaced before launch:
 * - email (post@ostfoldbud.no is a suggested address and must be confirmed)
 * - address (currently the operating area, not a street address — replace
 *   with a real postal address if/when the company has one, for accurate
 *   structured data)
 */
export const companyInfo = {
  name: "Østfold Bud Service AS",
  shortName: "Østfold Bud Service",
  domain: "ostfoldbud.no",
  url: "https://ostfoldbud.no",
  phone: "930 00 401",
  phoneHref: "tel:+4793000401",
  email: "post@ostfoldbud.no",
  organizationNumber: "937 005 857",
  address: "Drammen–Spydeberg",
  postalArea: "Østfold",
  openingHours: "Etter avtale",
  serviceAreas: ["Østlandet", "Sørlandet", "Vestlandet", "Trøndelag"],
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
