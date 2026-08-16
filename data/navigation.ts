export type NavLink = {
  label: string;
  href: string;
};

export const navigation: NavLink[] = [
  { label: "Forside", href: "/#forside" },
  { label: "Om oss", href: "/#om-oss" },
  { label: "Tjenester", href: "/#tjenester" },
  { label: "Få tilbud", href: "/tilbud" },
  { label: "Bilparken", href: "/#bilparken" },
  { label: "Samarbeid", href: "/#samarbeid" },
  { label: "Kontakt", href: "/#kontakt" },
];
