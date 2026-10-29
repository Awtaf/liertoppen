import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY } from "../theme";
import { CLAMP } from "../utils";

export type TaskCheckProps = {
  label: string;
  appearAt?: number;
  checkAt: number;
  exitAt?: number;
  centerY?: number;
};

// One single, doable task that gets checked off.
export const TaskCheck: React.FC<TaskCheckProps> = ({ label, appearAt = 0, checkAt, exitAt, centerY = 860 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame: frame - appearAt, fps, config: { damping: 22, stiffness: 90 } });
  const check = spring({ frame: frame - checkAt, fps, config: { damping: 11, stiffness: 170, mass: 0.6 } });
  const draw = interpolate(frame - checkAt, [2, 14], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const strike = interpolate(frame - checkAt, [6, 22], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  const ring = interpolate(frame - checkAt, [0, 26], [0, 1], CLAMP);
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 12], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          top: centerY - 70,
          width: 780,
          padding: "34px 44px",
          display: "flex",
          alignItems: "center",
          gap: 34,
          borderRadius: 38,
          background: "rgba(255, 232, 205, 0.07)",
          border: "1px solid rgba(255, 232, 205, 0.16)",
          boxShadow: `0 30px 90px rgba(0,0,0,0.45), 0 0 ${80 * check}px rgba(255, 200, 140, ${0.12 * Math.min(check, 1)})`,
          fontFamily: FONT_FAMILY,
          opacity: interpolate(enter, [0, 0.6], [0, 1], CLAMP) * (1 - exit),
          transform: `translateY(${(1 - enter) * 50 - exit * 30}px)`,
          filter: exit > 0 ? `blur(${exit * 10}px)` : undefined,
        }}
      >
        {/* Checkbox (first in RTL order → on the right) */}
        <div style={{ position: "relative", width: 66, height: 66, flexShrink: 0 }}>
          <div
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: 24,
              border: `3px solid ${COLORS.calm}`,
              opacity: (1 - ring) * (frame >= checkAt ? 0.8 : 0),
              transform: `scale(${1 + ring * 1.4})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 20,
              border: `3px solid ${frame >= checkAt ? COLORS.calm : "rgba(255,255,255,0.4)"}`,
              background: COLORS.calm,
              backgroundClip: "padding-box",
              // The dark inset "drains" away as the box fills with warm light.
              boxShadow: `inset 0 0 0 ${40 * (1 - Math.min(check, 1))}px rgba(20,14,10,0.95)`,
              transform: `scale(${interpolate(check, [0, 0.4, 1], [1, 0.85, 1])})`,
            }}
          />
          <svg viewBox="0 0 66 66" width={66} height={66} style={{ position: "absolute", inset: 0 }}>
            <path
              d="M18 34 L29 45 L49 22"
              fill="none"
              stroke="#241810"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
          </svg>
        </div>

        <div style={{ position: "relative", fontSize: 46, fontWeight: 500, color: COLORS.text }}>
          <span style={{ opacity: interpolate(strike, [0, 1], [1, 0.55]) }}>{label}</span>
          {/* Strike-through draws right → left, in reading direction */}
          <div
            style={{
              position: "absolute",
              right: 0,
              left: 0,
              top: "54%",
              height: 3,
              borderRadius: 2,
              background: COLORS.calm,
              transformOrigin: "right center",
              transform: `scaleX(${strike})`,
              opacity: 0.85,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
