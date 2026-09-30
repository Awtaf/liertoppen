import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY } from "../copy";
import { KineticText } from "../components/KineticText";
import { LensStreak } from "../components/LensStreak";
import { COLORS } from "../theme";
import { BEATS, voStagger } from "../timing";

// ≈0:40–0:45 · FINAL LINE
// Almost still. "لليوم ما يكفيه." → "والغد… نستقبله غدًا." → small breath line.
// The fade to black is handled at the top level (FadeToBlack).
export const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = BEATS.final;
  const settle = spring({ frame: frame - b.line2, fps, config: { damping: 200, stiffness: 50 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 770,
          transform: `translateY(${-settle * 110}px)`,
          opacity: 1 - settle * 0.25,
        }}
      >
        <KineticText
          text={COPY.final.line1.text}
          tone={COPY.final.line1.tone}
          font="serif"
          fontSize={96}
          weight={400}
          motion="breathe"
          stagger={voStagger("final1", 3)}
        />
      </div>

      {/* SFX: gentle resolve chord */}
      <Sequence from={b.line2} name="VO: والغد… نستقبله غدًا">
        <LensStreak y={960} delay={12} intensity={0.75} />
        <div style={{ position: "absolute", top: 870, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <KineticText
            text={COPY.final.line2.text}
            tone={COPY.final.line2.tone}
            font="serif"
            fontSize={104}
            weight={700}
            motion="breathe"
            stagger={voStagger("final2", 3)}
            emphasisScale={1.08}
            maxWidth={960}
          />
        </div>
      </Sequence>

      <Sequence from={b.sub} name="خذ نفسًا عميقًا">
        <div style={{ position: "absolute", top: 1110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <KineticText text={COPY.final.sub.text} tone={COPY.final.sub.tone} fontSize={42} weight={400} color={COLORS.textDim} motion="rise" stagger={3} maxWidth={860} />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
