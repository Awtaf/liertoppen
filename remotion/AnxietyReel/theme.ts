import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Three Arabic typefaces (all SIL Open Font License, bundled in
// remotion/public/fonts/ so rendering needs no network):
//   display — Noto Kufi Arabic: geometric and sharp, for the tense first half
//   serif   — Amiri: classical Naskh, for the calm, emotional second half
//   body    — IBM Plex Sans Arabic: clean captions and UI
// Remotion waits for every face to load before rendering a frame. The latin
// subset covers punctuation such as "…" and ".".
const ARABIC_RANGE =
  "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC";
const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

const FACES = [
  { family: "IBM Plex Sans Arabic", dir: "ibm-plex-sans-arabic", weights: ["300", "400", "500", "600", "700"] },
  { family: "Noto Kufi Arabic", dir: "noto-kufi-arabic", weights: ["400", "700", "800", "900"] },
  { family: "Amiri", dir: "amiri", weights: ["400", "700"] },
];

for (const face of FACES) {
  for (const weight of face.weights) {
    for (const [subset, unicodeRange] of [
      ["arabic", ARABIC_RANGE],
      ["latin", LATIN_RANGE],
    ]) {
      loadFont({
        family: face.family,
        url: staticFile(`fonts/${face.dir}/${subset}-${weight}.woff2`),
        weight,
        unicodeRange,
      });
    }
  }
}

export type FontRole = "body" | "display" | "serif";

export const FONTS: Record<FontRole, string> = {
  body: `"IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif`,
  display: `"Noto Kufi Arabic", "IBM Plex Sans Arabic", sans-serif`,
  serif: `"Amiri", "IBM Plex Sans Arabic", serif`,
};

// Default line height per face: Amiri needs more room for its tall letters.
export const LINE_HEIGHT: Record<FontRole, number> = {
  body: 1.45,
  display: 1.5,
  serif: 1.7,
};

export const FONT_FAMILY = FONTS.body;

export type Tone = "tense" | "neutral" | "calm";

export const COLORS = {
  ink: "#040509",
  text: "#f3eee6",
  textDim: "rgba(243, 238, 230, 0.58)",
  tense: "#ff6a55",
  calm: "#ffd49a",
} as const;

export const TONE_ACCENT: Record<Tone, string> = {
  tense: COLORS.tense,
  neutral: COLORS.text,
  calm: COLORS.calm,
};

// Instagram Reels safe zones for a 1080x1920 frame. The top ~300px holds the
// header, the bottom ~470px the caption/audio row and the right edge the
// like/comment/share column. Important text stays inside these margins.
export const SAFE = {
  top: 330,
  bottom: 470,
  side: 130,
} as const;

// Never use letter-spacing on Arabic: it breaks the joining between letters.
export const TEXT_SHADOW = "0 10px 36px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.45)";
