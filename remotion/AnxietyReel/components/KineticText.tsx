import React, { CSSProperties } from "react";
import { Easing, interpolate, random, spring, SpringConfig, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FontRole, FONTS, LINE_HEIGHT, TEXT_SHADOW, Tone, TONE_ACCENT } from "../theme";
import { CLAMP, parseEmphasis } from "../utils";

export type KineticMotion = "rise" | "slam" | "breathe";

export type KineticTextProps = {
  // Arabic phrase; wrap words in [brackets] to emphasize them.
  text: string;
  fontSize: number;
  tone?: Tone;
  motion?: KineticMotion;
  // Frame (relative to the parent Sequence) at which the first word starts.
  delay?: number;
  // Frames between consecutive words (right → left, in reading order).
  stagger?: number;
  weight?: number;
  // Resting size of emphasized words relative to the others.
  emphasisScale?: number;
  color?: string;
  exitAt?: number;
  exitDuration?: number;
  maxWidth?: number;
  lineHeight?: number;
  // Typeface role: "display" (Kufi), "serif" (Amiri) or "body" (Plex).
  font?: FontRole;
  // 0–1: RGB split + jitter, for moments of mental noise.
  glitch?: number;
  style?: CSSProperties;
};

type MotionPreset = {
  spring: Partial<SpringConfig>;
  rise: number; // vertical travel, as a fraction of fontSize
  blur: number; // px of blur at the start
  scaleFrom: number;
  fadeUntil: number; // spring progress at which the word is fully opaque
};

const MOTION: Record<KineticMotion, MotionPreset> = {
  // Default caption motion: words lift into focus.
  rise: { spring: { damping: 18, stiffness: 120, mass: 0.8 }, rise: 0.45, blur: 10, scaleFrom: 1, fadeUntil: 0.55 },
  // Headline impact: words fall onto the screen from slightly closer.
  slam: { spring: { damping: 15, stiffness: 240, mass: 0.7 }, rise: 0, blur: 22, scaleFrom: 1.55, fadeUntil: 0.3 },
  // Slow and weightless: used after the turn.
  breathe: { spring: { damping: 200, stiffness: 28, mass: 1.6 }, rise: 0.22, blur: 16, scaleFrom: 1.04, fadeUntil: 0.8 },
};

// Word-by-word kinetic Arabic typography.
// Words stay whole (Arabic letters must stay joined); the flex row inherits
// dir="rtl", so the first word sits on the right and wraps correctly.
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  fontSize,
  tone = "neutral",
  motion = "rise",
  delay = 0,
  stagger = 3,
  weight = 600,
  emphasisScale = 1.16,
  color = COLORS.text,
  exitAt,
  exitDuration = 10,
  maxWidth = 820,
  lineHeight,
  font = "body",
  glitch = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = parseEmphasis(text);
  const preset = MOTION[motion];
  const accent = TONE_ACCENT[tone];

  const exit =
    exitAt === undefined
      ? 0
      : interpolate(frame, [exitAt, exitAt + exitDuration], [0, 1], {
          ...CLAMP,
          easing: Easing.in(Easing.cubic),
        });

  if (exit >= 1) return null;

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        columnGap: fontSize * 0.27,
        rowGap: fontSize * 0.05,
        maxWidth,
        fontFamily: FONTS[font],
        fontSize,
        fontWeight: weight,
        lineHeight: lineHeight ?? LINE_HEIGHT[font],
        color,
        textAlign: "center",
        opacity: 1 - exit,
        filter: exit > 0 ? `blur(${exit * 14}px)` : undefined,
        transform: `translateY(${-exit * fontSize * 0.3}px)`,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const start = delay + i * stagger;
        const p = spring({ frame: frame - start, fps, config: preset.spring });
        const opacity = interpolate(p, [0, preset.fadeUntil], [0, 1], CLAMP);
        const blur = Math.max(0, 1 - p) * preset.blur;
        const y = (1 - p) * preset.rise * fontSize;
        let scale = interpolate(p, [0, 1], [preset.scaleFrom, 1]);

        if (word.emphasized) {
          // Under-damped spring: the word overshoots (briefly larger than its
          // resting size) and then settles.
          const pop = spring({
            frame: frame - start - 2,
            fps,
            config: { damping: 7, stiffness: 150, mass: 0.6 },
          });
          scale *= interpolate(pop, [0, 1], [0.7, 1]);
        }

        // Glitch: chromatic split that flickers, plus occasional horizontal tears.
        const g = glitch > 0 ? glitch * (0.4 + 0.6 * random(`glitch-${frame}-${i}`)) : 0;
        const tear = glitch > 0 && random(`tear-${frame}-${i}`) > 0.78 ? (random(`tx-${frame}-${i}`) - 0.5) * glitch * fontSize * 0.35 : 0;
        const split = g * fontSize * 0.06;
        const glitchShadow = g > 0 ? `${-split}px 0 rgba(255, 40, 80, 0.75), ${split}px 0 rgba(40, 220, 255, 0.7), ` : "";

        return (
          <span
            key={`${word.text}-${i}`}
            style={{
              display: "inline-block",
              opacity,
              transform: `translate(${tear}px, ${y}px) scale(${scale})`,
              filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
              fontSize: word.emphasized ? fontSize * emphasisScale : undefined,
              fontWeight: word.emphasized ? 700 : undefined,
              color: word.emphasized ? accent : undefined,
              textShadow:
                glitchShadow +
                (word.emphasized ? `0 0 ${fontSize * 0.45}px ${accent}66, ${TEXT_SHADOW}` : TEXT_SHADOW),
              whiteSpace: "nowrap",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
