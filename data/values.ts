import type { LucideIcon } from "lucide-react";
import { Clock, ShieldCheck, SlidersHorizontal, Headset, PackageCheck, Handshake } from "lucide-react";

export type Value = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const values: Value[] = [
  {
    title: "Punktlighet",
    description: "Vi forstår hvor viktig tid og forutsigbarhet er innen transport.",
    icon: Clock,
  },
  {
    title: "Pålitelighet",
    description: "Kundene skal kunne stole på at leveransene kommer frem som avtalt.",
    icon: ShieldCheck,
  },
  {
    title: "Fleksibilitet",
    description: "Vi tilpasser oss oppdragets størrelse, tidspunkt og behov.",
    icon: SlidersHorizontal,
  },
  {
    title: "Profesjonell kundebehandling",
    description: "Direkte og ryddig kommunikasjon gjennom hele oppdraget.",
    icon: Headset,
  },
  {
    title: "Trygg håndtering av varer",
    description: "Varene dine håndteres med respekt og aktsomhet fra henting til levering.",
    icon: PackageCheck,
  },
  {
    title: "Langsiktige samarbeid",
    description: "Vi bygger relasjoner som varer, ikke enkeltoppdrag.",
    icon: Handshake,
  },
];
