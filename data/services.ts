import type { LucideIcon } from "lucide-react";
import {
  Route,
  Zap,
  PackageCheck,
  ShoppingCart,
  Truck,
  Users,
  SlidersHorizontal,
} from "lucide-react";

export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    title: "Fast distribusjon",
    description:
      "For bedrifter som trenger faste ruter, regelmessige leveranser eller daglig transportkapasitet.",
    icon: Route,
  },
  {
    title: "Bud- og ekspressoppdrag",
    description:
      "Fleksibel transport når en sending må hentes og leveres raskt og effektivt.",
    icon: Zap,
  },
  {
    title: "Last mile-levering",
    description: "Profesjonell levering av varer helt frem til sluttkunden.",
    icon: PackageCheck,
  },
  {
    title: "Transport for netthandel",
    description:
      "Leveringskapasitet for nettbutikker og andre virksomheter med løpende ordre.",
    icon: ShoppingCart,
  },
  {
    title: "Varetransport",
    description:
      "Transport av større varer, kolli, utstyr og andre sendinger som krever varebil.",
    icon: Truck,
  },
  {
    title: "Underleverandørtjenester",
    description:
      "Vi kan stille med biler og sjåfører for transportører, logistikkfirmaer og distribusjonsaktører som trenger ekstra eller fast kapasitet.",
    icon: Users,
  },
  {
    title: "Skreddersydde transportavtaler",
    description:
      "Fleksible løsninger tilpasset kundens ruter, volum, tidspunkt og behov.",
    icon: SlidersHorizontal,
  },
];
