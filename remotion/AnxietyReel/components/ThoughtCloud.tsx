import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { COLORS, FONT_FAMILY, SAFE, TEXT_SHADOW } from "../theme";
import { CLAMP } from "../utils";

export type ThoughtCloudProps = {
  thoughts: string[];
  // How many thought instances spawn (the list is cycled).
  count?: number;
  // All thoughts spawn within this many frames, faster and faster.
  spawnWindow: number;
  // On this frame every thought disappears at once (hard cut).
  collapseAt: number;
  seed?: string;
};

// Intrusive thoughts popping up around the viewer. Spawn intervals shrink,
// drift and jitter grow, and some thoughts look like phone notifications.
export const ThoughtCloud: React.FC<ThoughtCloudProps> = ({
  thoughts,
  count = 20,
  spawnWindow,
  collapseAt,
  seed = "thought",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  if (frame >= collapseAt) return null;

  const urgency = interpolate(frame, [0, collapseAt], [0.5, 2.6], CLAMP);

  return (
    <AbsoluteFill dir="rtl" lang="ar" style={{ fontFamily: FONT_FAMILY }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (key: string) => random(`${seed}-${i}-${key}`);
        // Accelerating schedule: large gaps first, then almost every frame.
        const spawn = Math.round(spawnWindow * Math.pow(i / count, 0.62));
        const local = frame - spawn;
        if (local < 0) return null;

        const depth = r("depth");
        const isNotification = i % 4 === 1;
        const isTense = r("tense") > 0.72;
        const x = interpolate(r("x"), [0, 1], [SAFE.side + 150, width - SAFE.side - 150]);
        const y = interpolate(r("y"), [0, 1], [SAFE.top + 60, height - SAFE.bottom - 60]);

        // Drift outward from the centre, as if thoughts rush past the camera.
        const dx = x - width / 2;
        const dy = y - height / 2;
        const len = Math.hypot(dx, dy) || 1;
        const travel = local * (0.8 + depth * 1.6) * urgency;
        const jitter = urgency * 3.5;

        const enter = spring({ frame: local, fps, config: { damping: 14, stiffness: 260, mass: 0.5 } });
        const age = interpolate(local, [0, 26], [1, 0.5], CLAMP);
        const fontSize = 40 + depth * 42;

        const posX = x + (dx / len) * travel + noise2D(`${seed}-jx-${i}`, frame * 0.5, 0) * jitter;
        const posY = y + (dy / len) * travel + noise2D(`${seed}-jy-${i}`, 0, frame * 0.5) * jitter;
        const scale = interpolate(enter, [0, 1], [0.82, 1]) * (1 + local * 0.004 * urgency);
        const rotate = (r("rot") - 0.5) * 7;
        const blur = (1 - depth) * 4 + (1 - Math.min(enter, 1)) * 8;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: posX,
              top: posY,
              transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
              opacity: interpolate(enter, [0, 0.4], [0, 1], CLAMP) * age * (0.45 + depth * 0.55),
              filter: `blur(${blur}px)`,
              fontSize,
              fontWeight: isTense ? 700 : 500,
              color: isTense ? COLORS.tense : COLORS.text,
              textShadow: TEXT_SHADOW,
              whiteSpace: "nowrap",
              ...(isNotification
                ? {
                    padding: `${fontSize * 0.3}px ${fontSize * 0.55}px`,
                    borderRadius: fontSize * 0.7,
                    background: "rgba(255, 255, 255, 0.07)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.45)",
                    fontSize: fontSize * 0.8,
                  }
                : {}),
            }}
          >
            {thoughts[i % thoughts.length]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
