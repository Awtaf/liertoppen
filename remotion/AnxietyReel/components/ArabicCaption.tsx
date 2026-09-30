import React from "react";
import { AbsoluteFill } from "remotion";
import type { Phrase } from "../copy";
import { FontRole, SAFE } from "../theme";
import { VoiceLineId, voStagger } from "../timing";
import { KineticMotion, KineticText } from "./KineticText";

export type CaptionPlacement = "lower" | "upper" | "center";

export type ArabicCaptionProps = {
  phrase: Phrase;
  // Length of the Sequence this caption lives in. Words are revealed in the
  // pace of its voiceover line (or the first ~40% of it), and the caption
  // dissolves in the last 12 frames.
  durationInFrames: number;
  placement?: CaptionPlacement;
  fontSize?: number;
  weight?: number;
  motion?: KineticMotion;
  delay?: number;
  exit?: boolean;
  // Voiceover line this caption belongs to: words then reveal at its pace.
  voiceLine?: VoiceLineId;
  font?: FontRole;
  glitch?: number;
};

// One synced voiceover phrase, placed inside the Instagram safe zone.
// Use one caption per phrase inside its own <Sequence>, never a paragraph.
export const ArabicCaption: React.FC<ArabicCaptionProps> = ({
  phrase,
  durationInFrames,
  placement = "lower",
  fontSize = 62,
  weight = 600,
  motion = "rise",
  delay = 0,
  exit = true,
  voiceLine,
  font = "body",
  glitch = 0,
}) => {
  const wordCount = phrase.text.split(/\s+/).filter(Boolean).length;
  const stagger = voiceLine
    ? voStagger(voiceLine, wordCount)
    : Math.max(2, Math.min(5, Math.round((durationInFrames * 0.4) / wordCount)));

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent:
          placement === "lower" ? "flex-end" : placement === "upper" ? "flex-start" : "center",
        paddingTop: placement === "upper" ? SAFE.top + 130 : 0,
        paddingBottom: placement === "lower" ? SAFE.bottom + 20 : 0,
        paddingLeft: SAFE.side,
        paddingRight: SAFE.side,
      }}
    >
      <KineticText
        text={phrase.text}
        tone={phrase.tone}
        fontSize={fontSize}
        weight={weight}
        motion={motion}
        delay={delay}
        stagger={stagger}
        exitAt={exit ? durationInFrames - 12 : undefined}
        exitDuration={10}
        maxWidth={1080 - SAFE.side * 2}
        font={font}
        glitch={glitch}
      />
    </AbsoluteFill>
  );
};
