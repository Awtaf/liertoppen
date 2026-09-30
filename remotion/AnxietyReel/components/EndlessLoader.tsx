import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY } from "../theme";
import { CLAMP } from "../utils";

export type EndlessLoaderProps = {
  label: string;
  // Vertical centre of the loader, in px.
  centerY?: number;
};

const RADIUS = 64;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// A search / loading UI that never resolves: the spinner keeps turning and
// the progress bar reaches ~90%, then falls back and tries again.
export const EndlessLoader: React.FC<EndlessLoaderProps> = ({ label, centerY = 860 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 140 } });

  const rotation = frame * 9;
  const arc = CIRCUMFERENCE * (0.18 + 0.5 * (0.5 + 0.5 * Math.sin(frame * 0.14)));
  const cycle = frame % 44;
  const progress = interpolate(cycle, [0, 32, 38, 44], [0.2, 0.9, 0.92, 0.2], CLAMP);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        opacity: interpolate(enter, [0, 0.6], [0, 1], CLAMP),
        transform: `translateY(${(1 - enter) * 40}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: centerY - 170,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 44,
        }}
      >
        <svg width={RADIUS * 2 + 20} height={RADIUS * 2 + 20} style={{ overflow: "visible" }}>
          <circle cx={RADIUS + 10} cy={RADIUS + 10} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
          <circle
            cx={RADIUS + 10}
            cy={RADIUS + 10}
            r={RADIUS}
            fill="none"
            stroke={COLORS.text}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${CIRCUMFERENCE}`}
            transform={`rotate(${rotation} ${RADIUS + 10} ${RADIUS + 10})`}
            style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.35))" }}
          />
        </svg>

        {/* Glass search pill */}
        <div
          dir="rtl"
          lang="ar"
          style={{
            width: 640,
            padding: "26px 40px 30px",
            borderRadius: 40,
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.13)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            backdropFilter: "blur(18px)",
            fontFamily: FONT_FAMILY,
            color: COLORS.textDim,
            fontSize: 40,
            fontWeight: 400,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            <span>{label}</span>
            {[0, 1, 2].map((d) => (
              <span key={d} style={{ opacity: Math.floor(frame / 7) % 4 > d ? 1 : 0.15 }}>
                .
              </span>
            ))}
          </div>
          {/* Progress bar fills right → left (RTL) and never completes */}
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                marginInlineStart: 0,
                borderRadius: 3,
                background: COLORS.text,
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
