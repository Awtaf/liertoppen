import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY } from "../copy";
import { KineticText } from "../components/KineticText";
import { COLORS } from "../theme";
import { BEATS } from "../timing";

// 0:26.3–0:30 · FINAL LINE
// Almost still. "اليوم إلو شغله." → "وبكرا… منستقبله بكرا." → small breath line.
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
          top: 780,
          transform: `translateY(${-settle * 90}px)`,
          opacity: 1 - settle * 0.2,
        }}
      >
        <KineticText text={COPY.final.line1.text} tone={COPY.final.line1.tone} fontSize={96} weight={600} motion="breathe" stagger={6} />
      </div>

      {/* SFX: gentle resolve chord */}
      <Sequence from={b.line2} name="VO: وبكرا… منستقبله بكرا">
        <div style={{ position: "absolute", top: 880, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <KineticText text={COPY.final.line2.text} tone={COPY.final.line2.tone} fontSize={80} weight={700} motion="breathe" stagger={6} emphasisScale={1.1} maxWidth={940} />
        </div>
      </Sequence>

      <Sequence from={b.sub} name="خذ نفس">
        <div style={{ position: "absolute", top: 1080, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <KineticText text={COPY.final.sub.text} tone={COPY.final.sub.tone} fontSize={44} weight={400} color={COLORS.textDim} motion="rise" stagger={3} />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
