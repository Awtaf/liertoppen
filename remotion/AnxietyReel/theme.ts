import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// IBM Plex Sans Arabic (SIL Open Font License, see public/fonts/.../OFL.txt),
// bundled locally so rendering needs no network. Remotion waits for every
// face to load before rendering a frame. The latin subset covers punctuation
// such as "…" and ".".
const FAMILY = "IBM Plex Sans Arabic";
const ARABIC_RANGE =
  "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC";
const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

for (const weight of ["300", "400", "500", "600", "700"]) {
  for (const [subset, unicodeRange] of [
    ["arabic", ARABIC_RANGE],
    ["latin", LATIN_RANGE],
  ]) {
    loadFont({
      family: FAMILY,
      url: staticFile(`fonts/ibm-plex-sans-arabic/${subset}-${weight}.woff2`),
      weight,
      unicodeRange,
    });
  }
}

export const FONT_FAMILY = `"${FAMILY}", "Noto Sans Arabic", sans-serif`;

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
