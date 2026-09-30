import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COPY } from "../copy";
import { ArabicCaption } from "../components/ArabicCaption";
import { CameraRig } from "../components/CameraRig";
import { ChapterMark } from "../components/ChapterMark";
import { NextStepScene } from "../components/NextStepScene";
import { BEATS, SCENES } from "../timing";

// ≈0:34–0:40 · EMOTIONAL PAYOFF
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

      <Sequence durationInFrames={70} name="Chapter">
        <ChapterMark number={COPY.chapters.payoff.number} title={COPY.chapters.payoff.title} tone="warm" />
      </Sequence>

      <Sequence from={b.line1} durationInFrames={b.line1Duration} name="VO: ليس مطلوبًا منك">
        <ArabicCaption phrase={COPY.payoff.line1} durationInFrames={b.line1Duration} placement="upper" fontSize={60} motion="breathe" voiceLine="payoff1" />
      </Sequence>
      <Sequence from={b.line2} durationInFrames={b.line2Duration} name="VO: المطلوب فقط… أن تعرف خطوتك التالية">
        <ArabicCaption
          phrase={COPY.payoff.line2}
          durationInFrames={b.line2Duration}
          placement="upper"
          font="serif"
          weight={700}
          fontSize={80}
          motion="breathe"
          exit={false}
          voiceLine="payoff2"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
