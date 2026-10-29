import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../utils";

export type LensStreakProps = {
  y: number;
  color?: string;
  delay?: number;
  width?: number;
  intensity?: number;
};

// Anamorphic lens streak: a thin horizontal flare behind a key word.
export const LensStreak: React.FC<LensStreakProps> = ({ y, color = "#ffcf94", delay = 0, width = 1000, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const open = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 40 } });
  const shimmer = 0.85 + 0.15 * Math.sin((frame - delay) * 0.09);
  const opacity = interpolate(open, [0, 1], [0, 1], CLAMP) * shimmer * intensity;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: y,
          width: width * open,
          height: 3,
          transform: "translate(-50%, -50%)",
          background: `linear-gradient(90deg, transparent, ${color} 30%, #fff 50%, ${color} 70%, transparent)`,
          opacity,
          filter: "blur(1px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: y,
          width: width * 0.8 * open,
          height: 70,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse at center, ${color}55 0%, transparent 70%)`,
          opacity: opacity * 0.8,
          filter: "blur(10px)",
        }}
      />
    </AbsoluteFill>
  );
};
