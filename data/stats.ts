import type { LucideIcon } from "lucide-react";
import { Truck, PackagePlus, CalendarClock, SlidersHorizontal, MapPin, Handshake } from "lucide-react";

export type Stat = {
  label: string;
  icon: LucideIcon;
};

export const stats: Stat[] = [
  { label: "2 kjøretøy i bilparken", icon: Truck },
  { label: "Flere kjøretøy kommer snart", icon: PackagePlus },
  { label: "Kapasitet for faste oppdrag", icon: CalendarClock },
  { label: "Fleksible transportløsninger", icon: SlidersHorizontal },
  { label: "Oppdrag på Østlandet", icon: MapPin },
  { label: "Åpen for nye samarbeid", icon: Handshake },
];

export const collaborationOptions: string[] = [
  "Faste kjøreruter",
  "Daglig distribusjon",
  "Ukentlig distribusjon",
  "Ekstra kapasitet i travle perioder",
  "Kveldsoppdrag",
  "Helgeoppdrag",
  "Last mile-levering",
  "Underleverandøravtaler",
  "Transport med bil og sjåfør",
  "Langsiktige rammeavtaler",
];

export const trustIndicators: string[] = [
  "Fleksibel kapasitet",
  "Moderne kjøretøy",
  "Profesjonell utførelse",
  "Fokus på punktlighet",
];
