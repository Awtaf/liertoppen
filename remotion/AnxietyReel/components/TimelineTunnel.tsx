import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../theme";
import { CLAMP } from "../utils";

export type TimelineTunnelProps = {
  labels: string[];
  durationInFrames: number;
  // 0–1: pushes the tunnel back when something sits in front of it.
  dim?: number;
};

const FOCAL = 700;
const DEPTH = 2800;
const FLOOR_Y = 540;
const TICK_SPACING = 180;

// An endless mental timeline: dates and months rush away into the distance
// along a perspective rail. Speed keeps increasing through the scene.
export const TimelineTunnel: React.FC<TimelineTunnelProps> = ({ labels, durationInFrames, dim = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.4;

  // Speed ramps from 14 to 52 world units per frame.
  const travel = 14 * frame + ((52 - 14) * frame * frame) / (2 * durationInFrames);
  const project = (z: number) => FOCAL / (FOCAL + z);
  const spacing = DEPTH / labels.length;

  const ticks = Array.from({ length: Math.ceil(DEPTH / TICK_SPACING) }, (_, k) => {
    const z = (k * TICK_SPACING + travel) % DEPTH;
    const s = project(z);
    return { z, y: cy + FLOOR_Y * s, half: 900 * s, opacity: interpolate(z, [0, 200, DEPTH], [0, 0.35, 0], CLAMP) };
  });

  const enter = interpolate(frame, [0, 12], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ opacity: enter * (1 - dim * 0.6) }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="rail" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#9fb0ff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#9fb0ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Rails converging on the vanishing point */}
        {[-900, -300, 300, 900].map((x) => (
          <line key={x} x1={cx + x} y1={cy + FLOOR_Y} x2={cx} y2={cy} stroke="url(#rail)" strokeWidth={1.5} />
        ))}
        <line x1={cx} y1={height} x2={cx} y2={cy} stroke="url(#rail)" strokeWidth={3} />
        {/* Time ticks rushing away */}
        {ticks.map((tick, k) => (
          <line
            key={k}
            x1={cx - tick.half}
            x2={cx + tick.half}
            y1={tick.y}
            y2={tick.y}
            stroke="#c9d3ff"
            strokeOpacity={tick.opacity}
            strokeWidth={Math.max(0.5, 3 * project(tick.z))}
          />
        ))}
      </svg>

      <div dir="rtl" lang="ar" style={{ position: "absolute", inset: 0, fontFamily: FONTS.display }}>
        {labels.map((label, i) => {
          const z = (i * spacing + travel) % DEPTH;
          const s = project(z);
          // Keep labels out of the centre lane, where the text lives.
          const side = random(`tl-side-${i}`) > 0.5 ? 1 : -1;
          const worldX = side * (260 + random(`tl-x-${i}`) * 520);
          const worldY = (random(`tl-y-${i}`) - 0.62) * 1100;
          const opacity = interpolate(z, [0, 280, DEPTH * 0.6, DEPTH], [0, 0.6, 0.35, 0], CLAMP);
          const blur = interpolate(z, [0, 380, 1600, DEPTH], [10, 0, 1, 3], CLAMP);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: cx + worldX * s,
                top: cy + worldY * s,
                transform: `translate(-50%, -50%) scale(${s})`,
                fontSize: 96,
                fontWeight: i % 3 === 0 ? 700 : 400,
                color: COLORS.text,
                opacity,
                filter: `blur(${blur}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
