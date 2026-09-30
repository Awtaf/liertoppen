import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SAFE } from "../theme";
import { CLAMP } from "../utils";

export type StepIndicatorProps = {
  // Frame at which each step becomes active.
  steps: number[];
  exitAt?: number;
};

// Three quiet marks at the top: one lights up per action.
// Ordered right → left, following the Arabic reading direction.
export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(frame, [0, 20], [0, 1], CLAMP);
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 14], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: SAFE.top + 100, opacity: enter * (1 - exit) }}>
      <div dir="rtl" style={{ display: "flex", gap: 18 }}>
        {steps.map((start, i) => {
          const on = spring({ frame: frame - start, fps, config: { damping: 200, stiffness: 80 } });
          return (
            <div
              key={i}
              style={{
                width: interpolate(on, [0, 1], [34, 76]),
                height: 6,
                borderRadius: 3,
                background: COLORS.calm,
                opacity: 0.18 + on * 0.72,
                boxShadow: `0 0 ${18 * on}px ${COLORS.calm}88`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
