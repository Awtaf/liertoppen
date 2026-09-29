import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COPY } from "../copy";
import { ArabicCaption } from "../components/ArabicCaption";
import { CameraRig } from "../components/CameraRig";
import { KineticText } from "../components/KineticText";
import { KnotLines } from "../components/KnotLines";
import { StepIndicator } from "../components/StepIndicator";
import { TaskCheck } from "../components/TaskCheck";
import { BEATS, SCENES } from "../timing";

// 0:14–0:22 · SOLUTION
// Three simple actions, one by one, while the light warms up:
// 1. do what is in your hands (a task gets checked)
// 2. don't solve the rest in your head (a knot loosens and disappears)
// 3. come back to today (huge, clean "اليوم.")
export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = BEATS.solution;
  const [doIt, letGo, back] = COPY.solution.steps;

  return (
    <AbsoluteFill>
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
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <KineticText
              text={COPY.solution.today.text}
              tone={COPY.solution.today.tone}
              fontSize={250}
              weight={700}
              motion="breathe"
              emphasisScale={1}
              lineHeight={1.3}
              exitAt={SCENES.solution.duration - b.backToToday - b.today - 12}
              exitDuration={12}
            />
          </AbsoluteFill>
        </Sequence>
      </CameraRig>

      <Sequence from={b.doIt} durationInFrames={b.doItDuration} name="VO: إذا في شي بإيدك">
        <ArabicCaption phrase={doIt} durationInFrames={b.doItDuration} />
      </Sequence>
      <Sequence from={b.letGo} durationInFrames={b.letGoDuration} name="VO: وإذا مافي شي بإيدك">
        <ArabicCaption phrase={letGo} durationInFrames={b.letGoDuration} />
      </Sequence>
      <Sequence from={b.backToToday} durationInFrames={b.backToTodayDuration} name="VO: ارجع لليوم">
        <ArabicCaption phrase={back} durationInFrames={b.backToTodayDuration} />
      </Sequence>
    </AbsoluteFill>
  );
};
