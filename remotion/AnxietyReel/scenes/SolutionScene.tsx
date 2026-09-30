import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COPY } from "../copy";
import { ArabicCaption } from "../components/ArabicCaption";
import { CameraRig } from "../components/CameraRig";
import { KineticText } from "../components/KineticText";
import { ChapterMark } from "../components/ChapterMark";
import { KnotLines } from "../components/KnotLines";
import { LensStreak } from "../components/LensStreak";
import { StepIndicator } from "../components/StepIndicator";
import { TaskCheck } from "../components/TaskCheck";
import { BEATS, SCENES } from "../timing";

// ≈0:23–0:34 · SOLUTION
// Three simple actions, one by one, while the light warms up:
// 1. do what is in your hands (a task gets checked)
// 2. don't solve the rest in your head (a knot loosens and disappears)
// 3. come back to today (huge "اليوم." in Amiri with a warm lens streak)
export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = BEATS.solution;
  const [doIt, letGo, back] = COPY.solution.steps;

  return (
    <AbsoluteFill>
      <Sequence durationInFrames={80} name="Chapter">
        <ChapterMark number={COPY.chapters.solution.number} title={COPY.chapters.solution.title} tone="warm" />
      </Sequence>
      <StepIndicator steps={[b.doIt, b.letGo, b.backToToday]} exitAt={b.backToToday + b.today - 6} />

      <CameraRig drift={0.25} zoom={interpolate(frame, [0, SCENES.solution.duration], [1, 1.05])} seed="solution">
        {/* SFX: soft warm tick when the task gets checked */}
        <Sequence from={b.doIt} durationInFrames={b.doItDuration} name="Task check">
          <TaskCheck label={COPY.solution.task} appearAt={4} checkAt={b.check} exitAt={b.doItDuration - 14} />
        </Sequence>

        {/* SFX: string tension releasing / long exhale while the knot loosens */}
        <Sequence from={b.letGo} durationInFrames={b.letGoDuration} name="Knot loosens">
          <KnotLines loosenStart={b.knotLoosen[0]} loosenEnd={b.knotLoosen[1]} fadeEnd={b.letGoDuration - 2} />
        </Sequence>

        {/* SFX: slow soft whoosh + single piano note on "اليوم." */}
        <Sequence from={b.backToToday + b.today} name="اليوم.">
          <LensStreak y={930} delay={8} width={1080} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <KineticText
              text={COPY.solution.today.text}
              tone={COPY.solution.today.tone}
              font="serif"
              fontSize={290}
              weight={700}
              motion="breathe"
              emphasisScale={1}
              lineHeight={1.4}
              exitAt={SCENES.solution.duration - b.backToToday - b.today - 12}
              exitDuration={12}
            />
          </AbsoluteFill>
        </Sequence>
      </CameraRig>

      <Sequence from={b.doIt} durationInFrames={b.doItDuration} name="VO: إن كان بيدك شيء">
        <ArabicCaption phrase={doIt} durationInFrames={b.doItDuration} voiceLine="doIt" />
      </Sequence>
      <Sequence from={b.letGo} durationInFrames={b.letGoDuration} name="VO: وإن لم يكن بيدك شيء">
        <ArabicCaption phrase={letGo} durationInFrames={b.letGoDuration} voiceLine="letGo" />
      </Sequence>
      <Sequence from={b.backToToday} durationInFrames={b.backToTodayDuration} name="VO: عُد إلى اليوم">
        <ArabicCaption phrase={back} durationInFrames={b.backToTodayDuration} voiceLine="back" />
      </Sequence>
    </AbsoluteFill>
  );
};
