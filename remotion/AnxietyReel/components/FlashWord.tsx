import React from "react";
import { AbsoluteFill } from "remotion";
import type { Phrase } from "../copy";
import { KineticText } from "./KineticText";

export type FlashWordProps = {
  phrase: Phrase;
  durationInFrames: number;
  x: number;
  y: number;
  fontSize?: number;
};

// A single word/question slamming in and snapping out. Place inside a <Sequence>.
export const FlashWord: React.FC<FlashWordProps> = ({ phrase, durationInFrames, x, y, fontSize = 120 }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)" }}>
      <KineticText
        text={phrase.text}
        tone={phrase.tone}
        fontSize={fontSize}
        weight={700}
        motion="slam"
        stagger={2}
        emphasisScale={1.1}
        exitAt={durationInFrames - 5}
        exitDuration={4}
        maxWidth={900}
        style={{ whiteSpace: "nowrap" }}
      />
    </div>
  </AbsoluteFill>
);
