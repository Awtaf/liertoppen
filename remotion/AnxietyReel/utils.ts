export type Word = {
  text: string;
  emphasized: boolean;
};

// Splits a phrase into words and reads [emphasis] markers.
// "بيطلب منك تحل [بكرا]… [اليوم]."  →  "بكرا…" and "اليوم." are emphasized.
// Markers may span several words: "[خطوتك الجاية]".
// Words are never split into letters, so Arabic letter joining stays intact.
export const parseEmphasis = (text: string): Word[] => {
  let open = false;
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      if (token.includes("[")) open = true;
      const emphasized = open;
      if (token.includes("]")) open = false;
      return { text: token.replace(/[[\]]/g, ""), emphasized };
    });
};

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
