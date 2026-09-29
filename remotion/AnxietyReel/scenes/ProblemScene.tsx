import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COPY } from "../copy";
import { ArabicCaption } from "../components/ArabicCaption";
import { CameraRig } from "../components/CameraRig";
import { EchoWords } from "../components/EchoWords";
import { EndlessLoader } from "../components/EndlessLoader";
import { FlashWord } from "../components/FlashWord";
import { TimelineTunnel } from "../components/TimelineTunnel";
import { BEATS, heartbeatAt, SCENES } from "../timing";
import { CLAMP } from "../utils";

const FLASH_POSITIONS = [
  { x: 360, y: 520 },
  { x: 720, y: 470 },
  { x: 540, y: 600 },
];

// ≈0:04.6–0:08.7 · BUILD THE PROBLEM
// An endless timeline rushes away, a search that never finds an answer,
// flashes of "مضمون؟ أكيد؟ شو بعدين؟" and "أكيد" echoing in the background.
export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = BEATS.problem;
  const duration = SCENES.problem.duration;
  const shake = interpolate(frame, [0, 110, duration], [0.06, 0.18, 0.5], CLAMP);
  const loaderDim = interpolate(frame, [b.loader, b.loader + 20], [0, 1], CLAMP);

  // SFX: whoosh in, rising drone under the whole scene, soft 104 bpm heartbeat
  return (
    <AbsoluteFill>
      <CameraRig
        shake={shake}
        drift={0.4}
        zoom={interpolate(frame, [0, duration], [1, 1.08])}
        pulse={heartbeatAt(frame + SCENES.problem.from)}
        seed="problem"
      >
        <TimelineTunnel labels={COPY.problem.timeline} durationInFrames={duration} dim={loaderDim} />

        <Sequence from={b.echo} name="أكيد echo">
          <EchoWords word={COPY.problem.echoWord} count={16} interval={3} fadeOutAt={b.echoFadeOut - b.echo} />
        </Sequence>

        {/* SFX: clock ticking while the loader spins */}
        <Sequence from={b.loader} name="Endless loader">
          <EndlessLoader label={COPY.problem.loaderLabel} centerY={880} />
        </Sequence>

        {/* SFX: glitch tick on each flash */}
        {COPY.problem.flashes.map((phrase, i) => (
          <Sequence key={phrase.text} from={b.flashes[i]} durationInFrames={b.flashDuration} name={`Flash ${phrase.text}`}>
            <FlashWord phrase={phrase} durationInFrames={b.flashDuration} {...FLASH_POSITIONS[i]} />
          </Sequence>
        ))}
      </CameraRig>

      {/* Captions stay outside the camera rig so they never shake */}
      <Sequence from={b.line1} durationInFrames={b.line1Duration} name="VO: بتقعد تفكر">
        <ArabicCaption phrase={COPY.problem.line1} durationInFrames={b.line1Duration} voiceLine="problem1" />
      </Sequence>
      <Sequence from={b.line2} durationInFrames={b.line2Duration} name="VO: وبتحاول تلاقي جواب">
        <ArabicCaption phrase={COPY.problem.line2} durationInFrames={b.line2Duration} voiceLine="problem2" />
      </Sequence>
    </AbsoluteFill>
  );
};
