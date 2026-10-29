import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS, SAFE } from "../theme";
import { CLAMP } from "../utils";

export type ChapterMarkProps = {
  number: string;
  title: string;
  // How long the mark stays before it fades (frames).
  hold?: number;
  tone?: "cold" | "warm";
};

// A small editorial chapter label at the top of the frame: "٠٢ — الدوّامة".
// The rule draws right → left (reading direction), then the text wipes in.
export const ChapterMark: React.FC<ChapterMarkProps> = ({ number, title, hold = 70, tone = "cold" }) => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [0, 16], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const text = interpolate(frame, [6, 22], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [hold, hold + 14], [1, 0], CLAMP);
  if (out <= 0) return null;
  const accent = tone === "warm" ? COLORS.calm : "rgba(243, 238, 230, 0.85)";

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: SAFE.top + 6, opacity: out }}>
      <div dir="rtl" lang="ar" style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 30, color: accent, opacity: text }}>{number}</span>
        <div
          style={{
            width: 70,
            height: 2,
            background: accent,
            opacity: 0.7,
            transform: `scaleX(${line})`,
            transformOrigin: "right center",
          }}
        />
        <span
          style={{
            fontFamily: FONTS.display,
            fontWeight: 400,
            fontSize: 30,
            color: COLORS.textDim,
            // Wipe in from the right, in reading direction.
            clipPath: `inset(0 0 0 ${(1 - text) * 100}%)`,
          }}
        >
          {title}
        </span>
      </div>
    </AbsoluteFill>
  );
};
