import type { LucideIcon } from "lucide-react";
import { SlidersHorizontal, MessageCircle, BadgeCheck, Clock, Truck, TrendingUp } from "lucide-react";

export type Reason = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const whyChooseUs: Reason[] = [
  {
    title: "Fleksibel kapasitet",
    description: "Vi tilpasser oss oppdragets størrelse, tidspunkt og behov.",
    icon: SlidersHorizontal,
  },
  {
    title: "Personlig oppfølging",
    description: "Kundene får direkte og enkel kommunikasjon med oss.",
    icon: MessageCircle,
  },
  {
    title: "Profesjonell utførelse",
    description: "Vi møter kunder og sluttmottakere på en ryddig og respektfull måte.",
    icon: BadgeCheck,
  },
  {
    title: "Punktlige leveranser",
    description: "Vi forstår hvor viktig tid og forutsigbarhet er innen transport.",
    icon: Clock,
  },
  {
    title: "Moderne bilpark",
    description: "Vi kombinerer elektriske og tradisjonelle varebiler for å dekke ulike oppdrag.",
    icon: Truck,
  },
  {
    title: "Ambisjoner om vekst",
    description: "Vi investerer i flere kjøretøy og mer kapasitet i takt med nye samarbeid.",
    icon: TrendingUp,
  },
];
