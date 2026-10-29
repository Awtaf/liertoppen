import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COPY } from "../copy";
import { ArabicCaption } from "../components/ArabicCaption";
import { CameraRig } from "../components/CameraRig";
import { ChapterMark } from "../components/ChapterMark";
import { EchoWords } from "../components/EchoWords";
import { EndlessLoader } from "../components/EndlessLoader";
import { FlashWord } from "../components/FlashWord";
import { TimelineTunnel } from "../components/TimelineTunnel";
import { BEATS, heartbeatAt, SCENES } from "../timing";
import { CLAMP } from "../utils";

const FLASH_POSITIONS = [
  { x: 360, y: 540 },
  { x: 720, y: 480 },
  { x: 540, y: 610 },
];

// ≈0:06–0:15.5 · BUILD THE PROBLEM
// An endless timeline rushes away, a search that never finds an answer,
// flashes of "مضمون؟ أكيد؟ ثم ماذا؟", "أكيد" echoing — and with the third
// line ("وكلّما بحثتَ أكثر… ازداد الضجيج") everything peaks into the hard stop.
export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = BEATS.problem;
  const duration = SCENES.problem.duration;
  const chaos = interpolate(frame, [b.line3, duration], [0, 1], { ...CLAMP, easing: Easing.in(Easing.quad) });
  const shake = interpolate(frame, [0, b.line3], [0.05, 0.2], CLAMP) + chaos * 0.6;
  const loaderDim = interpolate(frame, [b.loader, b.loader + 20], [0, 1], CLAMP);

  // SFX: whoosh in, rising drone + riser into the hard stop, accelerating heartbeat
  return (
    <AbsoluteFill>
      <CameraRig
        shake={shake}
        drift={0.4}
        zoom={interpolate(frame, [0, duration], [1, 1.12], { ...CLAMP, easing: Easing.in(Easing.quad) })}
        pulse={heartbeatAt(frame + SCENES.problem.from)}
        seed="problem"
      >
        <TimelineTunnel labels={COPY.problem.timeline} durationInFrames={duration} dim={loaderDim} />

        <Sequence from={b.echo} name="أكيد echo">
          <EchoWords word={COPY.problem.echoWord} count={22} interval={3} fadeOutAt={b.echoFadeOut - b.echo} />
        </Sequence>

        {/* SFX: clock ticking while the loader spins */}
        <Sequence from={b.loader} name="Endless loader">
          <EndlessLoader label={COPY.problem.loaderLabel} centerY={900} />
        </Sequence>

        {/* SFX: glitch tick on each flash */}
        {COPY.problem.flashes.map((phrase, i) => (
          <Sequence key={phrase.text} from={b.flashes[i]} durationInFrames={b.flashDuration} name={`Flash ${phrase.text}`}>
            <FlashWord phrase={phrase} durationInFrames={b.flashDuration} {...FLASH_POSITIONS[i]} fontSize={112} />
          </Sequence>
        ))}
      </CameraRig>

      {/* Red pressure building at the edges as the noise peaks */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 75% 65% at 50% 48%, transparent 40%, #7d1019 100%)",
          opacity: chaos * 0.55,
        }}
      />

      <Sequence durationInFrames={80} name="Chapter">
        <ChapterMark number={COPY.chapters.problem.number} title={COPY.chapters.problem.title} />
      </Sequence>

      {/* Captions stay outside the camera rig so they never shake */}
      <Sequence from={b.line1} durationInFrames={b.line1Duration} name="VO: فتجلس تفكّر">
        <ArabicCaption phrase={COPY.problem.line1} durationInFrames={b.line1Duration} voiceLine="problem1" />
      </Sequence>
      <Sequence from={b.line2} durationInFrames={b.line2Duration} name="VO: وتبحث عن جواب">
        <ArabicCaption phrase={COPY.problem.line2} durationInFrames={b.line2Duration} voiceLine="problem2" />
      </Sequence>
      <Sequence from={b.line3} durationInFrames={b.line3Duration} name="VO: وكلّما بحثت أكثر">
        <ArabicCaption
          phrase={COPY.problem.line3}
          durationInFrames={b.line3Duration}
          voiceLine="problem3"
          font="display"
          weight={700}
          fontSize={66}
          glitch={0.35}
          exit={false}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
