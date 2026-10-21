export type Vehicle = {
  slug: string;
  name: string;
  type: string;
  description: string;
  highlights: string[];
  /**
   * PLACEHOLDER IMAGE — no real photo is available in the project yet.
   * Replace `image` with a path under /public/images/fleet/ once a real
   * photo of the vehicle exists, e.g. "/images/fleet/maxus-e-deliver.jpg".
   * Until then the Fleet component renders an illustrated placeholder.
   */
  image: string | null;
};

export const vehicles: Vehicle[] = [
  {
    slug: "maxus-e-deliver",
    name: "Maxus e-Deliver",
    type: "Elektrisk varebil",
    description:
      "En moderne elektrisk varebil som er stillegående, effektiv og godt egnet for bykjøring og distribusjon.",
    highlights: [
      "Elektrisk varebil",
      "Stillegående og effektiv",
      "Egnet for bykjøring og distribusjon",
      "God lastekapasitet",
      "Reduserte lokale utslipp",
      "Passer godt til faste ruter",
      "Egnet for last mile-levering",
    ],
    image: null,
  },
  {
    slug: "vw-id-buzz-cargo",
    name: "Volkswagen ID. Buzz Cargo",
    type: "Elektrisk varebil",
    description:
      "Vår nyeste elektriske varebil — smidig og utslippsfri, med god lastekapasitet for mindre og mellomstore sendinger i og rundt Oslo.",
    highlights: [
      "Elektrisk varebil",
      "Inntil 745 kg nyttelast",
      "3,9 m³ lasterom",
      "Lasterom 221 × 173 × 128 cm",
      "Egnet for mindre og mellomstore kolli",
      "Passer godt til bykjøring og faste ruter",
    ],
    image: null,
  },
  {
    slug: "mercedes-benz-sprinter",
    name: "Mercedes-Benz Sprinter",
    type: "Stor varebil",
    description:
      "En romslig og fleksibel varebil bygget for større transportoppdrag og lengre ruter.",
    highlights: [
      "Romslig varebil",
      "God lastekapasitet",
      "Egnet for større transportoppdrag",
      "Passer for distribusjon og lengre ruter",
      "Fleksibel for ulike typer varer",
      "Egnet for større kolli og utstyr",
    ],
    image: null,
  },
];
