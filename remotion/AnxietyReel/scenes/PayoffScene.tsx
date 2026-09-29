import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COPY } from "../copy";
import { ArabicCaption } from "../components/ArabicCaption";
import { CameraRig } from "../components/CameraRig";
import { NextStepScene } from "../components/NextStepScene";
import { BEATS, SCENES } from "../timing";

// ≈0:21.1–0:25.7 · EMOTIONAL PAYOFF
// A dark path; only the next step lights up. The rest stays unseen.
export const PayoffScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = BEATS.payoff;

  return (
    <AbsoluteFill>
      {/* Slow push-in towards the step */}
      <CameraRig zoom={interpolate(frame, [0, SCENES.payoff.duration], [1, 1.07])} drift={0.12} seed="payoff">
        {/* SFX: warm shimmer / light swell when the step lights up */}
        <NextStepScene revealAt={b.stepLight} />
      </CameraRig>

      <Sequence from={b.line1} durationInFrames={b.line1Duration} name="VO: مو مطلوب منك">
        <ArabicCaption phrase={COPY.payoff.line1} durationInFrames={b.line1Duration} placement="upper" fontSize={60} motion="breathe" voiceLine="payoff1" />
      </Sequence>
      <Sequence from={b.line2} durationInFrames={b.line2Duration} name="VO: مطلوب منك تعرف شو خطوتك الجاية">
        <ArabicCaption
          phrase={COPY.payoff.line2}
          durationInFrames={b.line2Duration}
          placement="upper"
          fontSize={66}
          motion="breathe"
          exit={false}
          voiceLine="payoff2"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
