import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CinematicBackground, FadeToBlack, FilmOverlay, FlashFrames } from "./components/CinematicBackground";
import { SoundLayer } from "./components/SoundLayer";
import { FinalScene } from "./scenes/FinalScene";
import { HookScene } from "./scenes/HookScene";
import { PayoffScene } from "./scenes/PayoffScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { TurnScene } from "./scenes/TurnScene";
import { COLORS } from "./theme";
import { BEATS, SCENES, VIDEO } from "./timing";

// "القلق يطلب منك أن تحلّ الغد… اليوم."
// 45 s · 1080x1920 · 30 fps Instagram Reel (Modern Standard Arabic).
//   Copy   → copy.ts   (all Arabic text + exact voiceover script)
//   Timing → timing.ts (scene starts, beats, mood curve, heartbeat)
//   Sound  → audio.ts  (voiceover + SFX placeholders with frame timing)
export const AnxietyReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <CinematicBackground />

      <Sequence from={SCENES.hook.from} durationInFrames={SCENES.hook.duration} name="01 Hook">
        <HookScene />
      </Sequence>
      <Sequence from={SCENES.problem.from} durationInFrames={SCENES.problem.duration} name="02 Problem">
        <ProblemScene />
      </Sequence>
      <Sequence from={SCENES.turn.from} durationInFrames={SCENES.turn.duration} name="03 Turn">
        <TurnScene />
      </Sequence>
      <Sequence from={SCENES.solution.from} durationInFrames={SCENES.solution.duration} name="04 Solution">
        <SolutionScene />
      </Sequence>
      <Sequence from={SCENES.payoff.from} durationInFrames={SCENES.payoff.duration} name="05 Payoff">
        <PayoffScene />
      </Sequence>
      <Sequence from={SCENES.final.from} durationInFrames={SCENES.final.duration} name="06 Final">
        <FinalScene />
      </Sequence>

      <FlashFrames />
      <FilmOverlay />
      <FadeToBlack from={SCENES.final.from + BEATS.final.fadeOut} to={VIDEO.durationInFrames - 1} />

      {/* Voiceover + sound effects (placeholders until files are added in audio.ts) */}
      <SoundLayer />
    </AbsoluteFill>
  );
};
