import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../utils";

export type NextStepSceneProps = {
  // Frame at which the single step lights up.
  revealAt: number;
  // Vanishing point of the path.
  horizonY?: number;
  // Where the step sits on screen.
  stepY?: number;
};

// A dark path disappearing into fog. Only ONE step — the next one — is lit.
// The rest of the path is deliberately never revealed.
export const NextStepScene: React.FC<NextStepSceneProps> = ({ revealAt, horizonY = 760, stepY = 1150 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cx = width / 2;

  const enter = interpolate(frame, [0, 30], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const light = spring({ frame: frame - revealAt, fps, config: { damping: 200, stiffness: 30, mass: 1.2 } });
  const rise = spring({ frame: frame - revealAt, fps, config: { damping: 18, stiffness: 60 } });
  const lit = Math.min(light, 1);

  // Step geometry (a slab seen in perspective).
  const topW = 380;
  const bottomW = 440;
  const depth = 64;
  const front = 46;
  const lift = (1 - rise) * 18;
  const y0 = stepY - depth + lift;
  const y1 = stepY + lift;
  const y2 = y1 + front;
  const topFace = `${cx - topW / 2},${y0} ${cx + topW / 2},${y0} ${cx + bottomW / 2},${y1} ${cx - bottomW / 2},${y1}`;
  const frontFace = `${cx - bottomW / 2},${y1} ${cx + bottomW / 2},${y1} ${cx + bottomW / 2},${y2} ${cx - bottomW / 2},${y2}`;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="path-surface" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="step-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe6c2" />
            <stop offset="1" stopColor="#e0a468" />
          </linearGradient>
          <linearGradient id="step-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a5236" />
            <stop offset="1" stopColor="#24170f" />
          </linearGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd6a0" stopOpacity="0" />
            <stop offset="1" stopColor="#ffd6a0" stopOpacity="0.16" />
          </linearGradient>
          <radialGradient id="step-glow">
            <stop offset="0" stopColor="#ffc98e" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffc98e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.4" stopColor="#000" stopOpacity="0.9" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* The path, fading into darkness */}
        <polygon points={`${cx - 470},${height} ${cx + 470},${height} ${cx + 30},${horizonY} ${cx - 30},${horizonY}`} fill="url(#path-surface)" />
        <line x1={cx - 470} y1={height} x2={cx - 30} y2={horizonY} stroke="#fff" strokeOpacity={0.07} strokeWidth={2} />
        <line x1={cx + 470} y1={height} x2={cx + 30} y2={horizonY} stroke="#fff" strokeOpacity={0.07} strokeWidth={2} />

        {/* Fog swallowing everything beyond the next step */}
        <rect x={0} y={horizonY - 360} width={width} height={y0 - horizonY + 320} fill="url(#fog)" style={{ filter: "blur(30px)" }} />

        {/* Light beam from above */}
        <polygon
          points={`${cx - 60},${horizonY - 420} ${cx + 60},${horizonY - 420} ${cx + bottomW * 0.62},${y1} ${cx - bottomW * 0.62},${y1}`}
          fill="url(#beam)"
          opacity={lit}
          style={{ filter: "blur(18px)" }}
        />

        {/* Pool of light on the path */}
        <ellipse cx={cx} cy={y1 + 40} rx={520 * (0.6 + 0.4 * lit)} ry={150 * (0.6 + 0.4 * lit)} fill="url(#step-glow)" opacity={lit} />

        {/* The step: a faint silhouette before the reveal, warm light after */}
        <polygon points={frontFace} fill="url(#step-front)" opacity={0.12 + lit * 0.88} />
        <polygon points={topFace} fill="url(#step-top)" opacity={0.06 + lit * 0.94} />
        <line x1={cx - topW / 2} y1={y0} x2={cx + topW / 2} y2={y0} stroke="#fff5e6" strokeOpacity={lit * 0.9} strokeWidth={2} />
      </svg>

      {/* Dust floating in the beam */}
      {Array.from({ length: 18 }, (_, i) => {
        const r = (k: string) => random(`beam-${i}-${k}`);
        const y = y0 - 40 - ((r("y") * 520 + frame * (0.3 + r("s") * 0.5)) % 520);
        const spread = interpolate(y, [y0 - 560, y0], [60, bottomW * 0.5]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + (r("x") - 0.5) * 2 * spread,
              top: y,
              width: 3 + r("size") * 3,
              height: 3 + r("size") * 3,
              borderRadius: "50%",
              background: "#ffe3bd",
              opacity: lit * (0.2 + r("o") * 0.5),
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
