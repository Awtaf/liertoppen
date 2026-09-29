import React from "react";
import { Html5Audio, Sequence, staticFile } from "remotion";
import { SOUND_CUES, VOICEOVER } from "../audio";

// Places the voiceover and every enabled sound cue from audio.ts.
// With all `src` values set to null (the default) this renders nothing,
// so the project works without any audio files.
export const SoundLayer: React.FC = () => {
  return (
    <>
      {/* ▶ VOICEOVER — set VOICEOVER.src in audio.ts (e.g. "audio/voiceover.mp3") */}
      {VOICEOVER.src ? <Html5Audio src={staticFile(VOICEOVER.src)} volume={VOICEOVER.volume} /> : null}

      {SOUND_CUES.filter((cue) => cue.src).map((cue) => (
        <Sequence key={cue.id} name={`sfx: ${cue.id}`} from={cue.from} durationInFrames={cue.durationInFrames} layout="none">
          <Html5Audio src={staticFile(cue.src as string)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
