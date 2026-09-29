import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY, SAFE } from "../theme";
import { CLAMP } from "../utils";

export type EchoWordsProps = {
  word: string;
  count?: number;
  // Frames between each new echo.
  interval?: number;
  fadeOutAt: number;
  fadeOutDuration?: number;
  seed?: string;
};

// One word repeating in the background, like a thought on a loop,
// until the whole echo fades away.
export const EchoWords: React.FC<EchoWordsProps> = ({
  word,
  count = 14,
  interval = 3,
  fadeOutAt,
  fadeOutDuration = 22,
  seed = "echo",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fade = interpolate(frame, [fadeOutAt, fadeOutAt + fadeOutDuration], [1, 0], CLAMP);

  return (
    <AbsoluteFill dir="rtl" lang="ar" style={{ fontFamily: FONT_FAMILY, opacity: fade }}>
      {Array.from({ length: count }, (_, i) => {
        const local = frame - i * interval;
        if (local < 0) return null;
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const size = 70 + r("size") * 170;
        const appear = interpolate(local, [0, 5], [0, 1], CLAMP);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: interpolate(r("x"), [0, 1], [SAFE.side, width - SAFE.side]),
              top: interpolate(r("y"), [0, 1], [SAFE.top, height - SAFE.bottom]),
              transform: `translate(-50%, -50%) scale(${1 + local * 0.003})`,
              fontSize: size,
              fontWeight: 700,
              color: r("tone") > 0.6 ? COLORS.tense : COLORS.text,
              opacity: appear * (0.05 + r("o") * 0.12),
              filter: `blur(${2 + r("blur") * 6}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {word}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
