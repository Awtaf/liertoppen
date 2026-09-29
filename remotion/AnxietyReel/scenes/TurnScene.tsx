import React from "react";
import { AbsoluteFill, Freeze, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COPY } from "../copy";
import { CameraRig } from "../components/CameraRig";
import { KineticText } from "../components/KineticText";
import { BEATS, SCENES, voStagger } from "../timing";
import { CLAMP } from "../utils";
import { ProblemScene } from "./ProblemScene";

// ≈0:08.7–0:13.5 · THE TURN
// Hard stop: the last frame of the previous scene freezes, drains of colour
// and dissolves. Near-empty screen. Everything here moves slowly.
export const TurnScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = BEATS.turn;
  const frozenOpacity = interpolate(frame, [0, b.freezeHold, b.freezeHold + b.freezeFade], [0.85, 0.7, 0], CLAMP);
  const frozenBlur = interpolate(frame, [b.freezeHold, b.freezeHold + b.freezeFade], [0, 14], CLAMP);

  // SFX: HARD STOP — sound cuts on frame 0 of this scene. Silence. Calm ambience fades in from +30.
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={b.freezeHold + b.freezeFade} name="Freeze frame">
        <AbsoluteFill style={{ opacity: frozenOpacity, filter: `grayscale(1) brightness(0.8) blur(${frozenBlur}px)` }}>
          <Freeze frame={SCENES.problem.duration - 1}>
            <ProblemScene />
          </Freeze>
        </AbsoluteFill>
      </Sequence>

      <CameraRig zoom={interpolate(frame, [0, SCENES.turn.duration], [1, 1.04])} drift={0.15} seed="turn">
        <Sequence from={b.question} name="VO: بس اسأل حالك">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <KineticText
              text={COPY.turn.question.text}
              tone={COPY.turn.question.tone}
              fontSize={62}
              weight={400}
              motion="breathe"
              stagger={voStagger("question", 5)}
              exitAt={b.bigQuestion - b.question - 16}
              exitDuration={14}
            />
          </AbsoluteFill>
        </Sequence>

        <Sequence from={b.bigQuestion} name="VO: شو الشي يلي بإيدي هلأ؟">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <KineticText
              text={COPY.turn.bigQuestion.text}
              tone={COPY.turn.bigQuestion.tone}
              fontSize={104}
              weight={700}
              motion="breathe"
              stagger={voStagger("bigQuestion", 5)}
              emphasisScale={1.2}
              lineHeight={1.4}
              maxWidth={800}
              exitAt={b.exit - b.bigQuestion}
              exitDuration={12}
            />
          </AbsoluteFill>
        </Sequence>
      </CameraRig>
    </AbsoluteFill>
  );
};
