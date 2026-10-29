import React from "react";
import { AbsoluteFill, Freeze, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COPY } from "../copy";
import { CameraRig } from "../components/CameraRig";
import { ChapterMark } from "../components/ChapterMark";
import { KineticText } from "../components/KineticText";
import { LensStreak } from "../components/LensStreak";
import { BEATS, SCENES, voStagger } from "../timing";
import { CLAMP } from "../utils";
import { ProblemScene } from "./ProblemScene";

// ≈0:15.5–0:23 · THE TURN
// Hard stop: the last frame of the previous scene freezes, drains of colour
// and dissolves. Silence. "لكن… توقّف لحظة." Everything here moves slowly.
export const TurnScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = BEATS.turn;
  const frozenOpacity = interpolate(frame, [0, b.freezeHold, b.freezeHold + b.freezeFade], [0.85, 0.7, 0], CLAMP);
  const frozenBlur = interpolate(frame, [b.freezeHold, b.freezeHold + b.freezeFade], [0, 14], CLAMP);
  const streakOut = interpolate(frame, [b.exit, b.exit + 12], [1, 0], CLAMP);

  // SFX: HARD STOP — sound cuts on frame 0 of this scene. Silence. Calm ambience fades in with "توقّف".
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={b.freezeHold + b.freezeFade} name="Freeze frame">
        <AbsoluteFill style={{ opacity: frozenOpacity, filter: `grayscale(1) brightness(0.8) blur(${frozenBlur}px)` }}>
          <Freeze frame={SCENES.problem.duration - 1}>
            <ProblemScene />
          </Freeze>
        </AbsoluteFill>
      </Sequence>

      <CameraRig zoom={interpolate(frame, [0, SCENES.turn.duration], [1, 1.05])} drift={0.15} seed="turn">
        {/* SFX: single deep, soft sub-boom under "توقّف" */}
        <Sequence from={b.stop} name="VO: لكن… توقّف لحظة">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <KineticText
              text={COPY.turn.stop.text}
              tone={COPY.turn.stop.tone}
              font="display"
              fontSize={62}
              weight={400}
              maxWidth={940}
              motion="breathe"
              stagger={voStagger("stop", 3)}
              emphasisScale={2}
              exitAt={b.question - b.stop - 12}
              exitDuration={12}
            />
          </AbsoluteFill>
          <ChapterMark number={COPY.chapters.turn.number} title={COPY.chapters.turn.title} hold={b.question - b.stop - 10} />
        </Sequence>

        <Sequence from={b.question} name="VO: واسأل نفسك">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <KineticText
              text={COPY.turn.question.text}
              tone={COPY.turn.question.tone}
              font="serif"
              fontSize={66}
              weight={400}
              motion="breathe"
              stagger={voStagger("question", 4)}
              exitAt={b.bigQuestion - b.question - 12}
              exitDuration={12}
            />
          </AbsoluteFill>
        </Sequence>

        <Sequence from={b.bigQuestion} name="VO: ما الذي بين يديّ الآن؟">
          <AbsoluteFill style={{ opacity: streakOut }}>
            <LensStreak y={930} delay={10} intensity={0.7} />
          </AbsoluteFill>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <KineticText
              text={COPY.turn.bigQuestion.text}
              tone={COPY.turn.bigQuestion.tone}
              font="serif"
              fontSize={112}
              weight={700}
              motion="breathe"
              stagger={voStagger("bigQuestion", 5)}
              emphasisScale={1.15}
              maxWidth={860}
              exitAt={b.exit - b.bigQuestion}
              exitDuration={12}
            />
          </AbsoluteFill>
        </Sequence>
      </CameraRig>
    </AbsoluteFill>
  );
};
