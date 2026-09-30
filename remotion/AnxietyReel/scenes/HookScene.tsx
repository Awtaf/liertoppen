import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY } from "../copy";
import { CameraRig } from "../components/CameraRig";
import { ChapterMark } from "../components/ChapterMark";
import { KineticText } from "../components/KineticText";
import { LensStreak } from "../components/LensStreak";
import { ThoughtCloud } from "../components/ThoughtCloud";
import { BEATS, heartbeatAt, SCENES } from "../timing";
import { CLAMP } from "../utils";

// ≈0:00–0:06 · HOOK (exact timing follows the voiceover, see timing.ts)
// A single thought, then more and more, faster (heartbeat + shake) → hard cut
// to black with a flash → "للقلق خدعةٌ واحدة." → "يطلب منك أن تحلّ الغد… اليوم."
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = BEATS.hook;
  const pulse = heartbeatAt(frame + SCENES.hook.from);

  const shake =
    frame < b.thoughtsEnd
      ? interpolate(frame, [0, b.thoughtsEnd], [0.05, 1], { ...CLAMP, easing: Easing.in(Easing.cubic) })
      : interpolate(frame - b.trick, [0, 3, 12], [0, 0.6, 0], CLAMP); // impact on the headline
  const zoom = frame < b.thoughtsEnd ? interpolate(frame, [0, b.thoughtsEnd], [1, 1.16], { ...CLAMP, easing: Easing.in(Easing.quad) }) : 1;

  // First line makes room when the second one arrives.
  const makeRoom = spring({ frame: frame - b.demand, fps, config: { damping: 200, stiffness: 90 } });
  const exit = interpolate(frame, [b.exit, b.exit + 8], [1, 0], CLAMP);

  // SFX: heartbeat accelerating until the thoughts vanish, notification pings on thoughts (see audio.ts)
  return (
    <AbsoluteFill>
      <CameraRig shake={shake} zoom={zoom} pulse={pulse} seed="hook">
        <ThoughtCloud thoughts={COPY.hook.thoughts} count={b.thoughtCount} spawnWindow={b.thoughtSpawnWindow} collapseAt={b.thoughtsEnd} />

        {/* SFX: hard cut — all sound stops at thoughtsEnd; flash + deep impact at `trick` */}
        <Sequence from={b.trick} name="للقلق خدعة واحدة">
          <AbsoluteFill style={{ opacity: exit }}>
            <LensStreak y={960 - makeRoom * 120} color="#8fa8ff" intensity={0.8} width={1100} />
          </AbsoluteFill>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                transform: `translateY(${-makeRoom * 120}px) scale(${1 - makeRoom * 0.14})`,
                opacity: 1 - makeRoom * 0.2,
              }}
            >
              <KineticText
                text={COPY.hook.trick.text}
                tone={COPY.hook.trick.tone}
                font="display"
                fontSize={82}
                weight={900}
                maxWidth={1000}
                motion="slam"
                stagger={3}
                emphasisScale={1.1}
                exitAt={b.exit - b.trick}
                exitDuration={8}
              />
            </div>
          </AbsoluteFill>
          <ChapterMark number={COPY.chapters.hook.number} title={COPY.chapters.hook.title} hold={b.exit - b.trick - 14} />
        </Sequence>

        {/* SFX: tonal hits on "الغد" and "اليوم" */}
        <Sequence from={b.demand} name="يطلب منك أن تحلّ الغد… اليوم">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 200 }}>
            <KineticText
              text={COPY.hook.demand.text}
              tone={COPY.hook.demand.tone}
              font="display"
              fontSize={70}
              weight={700}
              maxWidth={900}
              motion="rise"
              stagger={b.demandStagger}
              emphasisScale={1.35}
              exitAt={b.exit - b.demand}
              exitDuration={8}
            />
          </AbsoluteFill>
        </Sequence>
      </CameraRig>
    </AbsoluteFill>
  );
};
