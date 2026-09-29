import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY } from "../copy";
import { CameraRig } from "../components/CameraRig";
import { KineticText } from "../components/KineticText";
import { ThoughtCloud } from "../components/ThoughtCloud";
import { BEATS, heartbeatAt, SCENES } from "../timing";
import { CLAMP } from "../utils";

// 0:00–0:03.5 · HOOK
// Thoughts flood in faster and faster (heartbeat + shake) → hard cut to black
// → "القلق عنده خدعة." → ~0.5 s pause → "بيطلب منك تحل بكرا… اليوم."
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = BEATS.hook;
  const pulse = heartbeatAt(frame + SCENES.hook.from);

  const shake =
    frame < b.thoughtsEnd
      ? interpolate(frame, [0, b.thoughtsEnd], [0.12, 1], { ...CLAMP, easing: Easing.in(Easing.quad) })
      : interpolate(frame - b.trick, [0, 3, 12], [0, 0.55, 0], CLAMP); // impact on the headline
  const zoom = frame < b.thoughtsEnd ? interpolate(frame, [0, b.thoughtsEnd], [1, 1.12], CLAMP) : 1;

  // First line makes room when the second one arrives.
  const makeRoom = spring({ frame: frame - b.demand, fps, config: { damping: 200, stiffness: 90 } });

  // SFX: heartbeat accelerating 0:00–0:01.5, notification pings on thoughts (see audio.ts)
  return (
    <AbsoluteFill>
      <CameraRig shake={shake} zoom={zoom} pulse={pulse} seed="hook">
        <ThoughtCloud thoughts={COPY.hook.thoughts} count={b.thoughtCount} spawnWindow={b.thoughtSpawnWindow} collapseAt={b.thoughtsEnd} />

        {/* SFX: hard cut — all sound stops at thoughtsEnd; deep impact at `trick` */}
        <Sequence from={b.trick} name="القلق عنده خدعة">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                transform: `translateY(${-makeRoom * 120}px) scale(${1 - makeRoom * 0.18})`,
                opacity: 1 - makeRoom * 0.25,
              }}
            >
              <KineticText
                text={COPY.hook.trick.text}
                tone={COPY.hook.trick.tone}
                fontSize={104}
                weight={700}
                maxWidth={960}
                motion="slam"
                stagger={3}
                emphasisScale={1.12}
                exitAt={b.exit - b.trick}
                exitDuration={8}
              />
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* SFX: tonal hits on "بكرا" and "اليوم" */}
        <Sequence from={b.demand} name="بيطلب منك تحل بكرا… اليوم">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 170 }}>
            <KineticText
              text={COPY.hook.demand.text}
              tone={COPY.hook.demand.tone}
              fontSize={84}
              weight={600}
              motion="rise"
              stagger={4}
              emphasisScale={1.32}
              exitAt={b.exit - b.demand}
              exitDuration={8}
            />
          </AbsoluteFill>
        </Sequence>
      </CameraRig>
    </AbsoluteFill>
  );
};
