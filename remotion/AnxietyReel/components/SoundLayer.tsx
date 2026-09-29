import React from "react";
import { Html5Audio, interpolate, Sequence, staticFile } from "remotion";
import { MASTER_FADE, SOUND_CUES, VOICE_CUES, VOICEOVER } from "../audio";
import { CLAMP } from "../utils";

// Master gain at an absolute frame: 1, then fading to 0 with the picture.
const masterGain = (absoluteFrame: number) => interpolate(absoluteFrame, [MASTER_FADE.from, MASTER_FADE.to], [1, 0], CLAMP);

// Places the voiceover and every sound cue from audio.ts.
// Cues with `src: null` are skipped.
export const SoundLayer: React.FC = () => {
  return (
    <>
      {/* ▶ VOICEOVER — one line per Sequence, starting with its caption (audio.ts) */}
      {VOICEOVER.enabled
        ? VOICE_CUES.map((cue) => (
            <Sequence key={cue.id} name={`vo: ${cue.id}`} from={cue.from} layout="none">
              <Html5Audio src={staticFile(cue.src)} volume={(f) => VOICEOVER.volume * masterGain(cue.from + f)} />
            </Sequence>
          ))
        : null}

      {SOUND_CUES.filter((cue) => cue.src).map((cue) => (
        <Sequence key={cue.id} name={`sfx: ${cue.id}`} from={cue.from} durationInFrames={cue.durationInFrames} layout="none">
          {/* Inside a Sequence the volume callback receives the cue-relative frame. */}
          <Html5Audio src={staticFile(cue.src as string)} volume={(f) => cue.volume * masterGain(cue.from + f)} />
        </Sequence>
      ))}
    </>
  );
};
