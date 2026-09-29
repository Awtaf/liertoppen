import React from "react";
import { Html5Audio, interpolate, Sequence, staticFile } from "remotion";
import { MASTER_FADE, SOUND_CUES, VOICEOVER } from "../audio";
import { CLAMP } from "../utils";

// Master gain at an absolute frame: 1, then fading to 0 with the picture.
const masterGain = (absoluteFrame: number) => interpolate(absoluteFrame, [MASTER_FADE.from, MASTER_FADE.to], [1, 0], CLAMP);

// Places the voiceover and every sound cue from audio.ts.
// Cues with `src: null` are skipped.
export const SoundLayer: React.FC = () => {
  return (
    <>
      {/* ▶ VOICEOVER — set VOICEOVER.src in audio.ts (e.g. "audio/voiceover.mp3") */}
      {VOICEOVER.src ? (
        <Html5Audio src={staticFile(VOICEOVER.src)} volume={(f) => VOICEOVER.volume * masterGain(f)} />
      ) : null}

      {SOUND_CUES.filter((cue) => cue.src).map((cue) => (
        <Sequence key={cue.id} name={`sfx: ${cue.id}`} from={cue.from} durationInFrames={cue.durationInFrames} layout="none">
          {/* Inside a Sequence the volume callback receives the cue-relative frame. */}
          <Html5Audio src={staticFile(cue.src as string)} volume={(f) => cue.volume * masterGain(cue.from + f)} />
        </Sequence>
      ))}
    </>
  );
};
