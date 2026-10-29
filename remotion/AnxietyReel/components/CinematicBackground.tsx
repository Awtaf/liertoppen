import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { ambientTime, FLASH_FRAMES, getMood, heartbeatAt, letterboxAt } from "../timing";
import { CLAMP } from "../utils";

// ─────────────────────────────────────────────────────────────────────────────
// Background + lighting. Both components are placed once, at the top level of
// the composition, and read the global frame: the mood curve in timing.ts
// (tension / warmth / brightness) drives everything, so the whole video moves
// from cold and crowded to warm and still in one continuous grade.
// ─────────────────────────────────────────────────────────────────────────────

const COLD_TO_WARM = [0, 0.5, 1];

// Base gradient, drifting light blooms and floating dust.
export const CinematicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const mood = getMood(frame);
  const t = ambientTime(frame);

  const top = interpolateColors(mood.warmth, COLD_TO_WARM, ["#070912", "#140f13", "#2c1f17"]);
  const bottom = interpolateColors(mood.warmth, COLD_TO_WARM, ["#020203", "#060406", "#140d09"]);
  const light = interpolateColors(mood.warmth, COLD_TO_WARM, ["#40548f", "#9c6a5e", "#ffc389"]);

  const bloomX = width / 2 + noise2D("bloom-x", t * 0.004, 0) * 240;
  const bloomY = height * 0.43 + noise2D("bloom-y", 0, t * 0.004) * 280;
  const bloomRadius = 820 + mood.brightness * 520;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      {/* Main soft key light */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${bloomRadius}px at ${bloomX}px ${bloomY}px, ${light} 0%, transparent 72%)`,
          opacity: 0.08 + mood.brightness * 0.42,
        }}
      />
      {/* Tense red spill in the corner, only while anxious */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 900px at ${180 + noise2D("red", t * 0.006, 1) * 120}px 260px, #7a1c22 0%, transparent 70%)`,
          opacity: mood.tension * 0.22,
        }}
      />
      {/* Low warm horizon glow, only once calm */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1100px 700px at 50% 108%, #ffb877 0%, transparent 70%)`,
          opacity: mood.warmth * 0.28,
        }}
      />
      <Particles />
    </AbsoluteFill>
  );
};

const PARTICLE_COUNT = 46;

// Dust in the air. Runs on the ambient clock, so it freezes at the turn.
export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const mood = getMood(frame);
  const t = ambientTime(frame);
  const color = interpolateColors(mood.warmth, [0, 1], ["#b9c6ff", "#ffd9a8"]);

  return (
    <AbsoluteFill>
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const depth = random(`p-depth-${i}`);
        const size = 1.5 + depth * 4.5;
        const speed = 0.25 + depth * 0.9;
        const x = random(`p-x-${i}`) * width + noise2D(`p-n-${i}`, t * 0.01, 0) * 60;
        const y = (((random(`p-y-${i}`) * height - t * speed) % height) + height) % height;
        const twinkle = 0.6 + 0.4 * Math.sin(t * 0.05 + i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: (0.12 + mood.brightness * 0.5) * twinkle * (0.3 + depth * 0.7),
              filter: depth > 0.75 ? `blur(${(depth - 0.75) * 10}px)` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Film grain, vignette, heartbeat pulse, light leaks, UI-shade and letterbox
// bars — the "lens" layer that sits on top of every scene.
export const FilmOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const mood = getMood(frame);
  const t = ambientTime(frame);
  const bar = letterboxAt(frame);
  const pulse = heartbeatAt(frame);
  // Grain re-seeds as the ambient clock runs: it stops moving at the freeze.
  const grainSeed = Math.floor(ambientTime(frame)) % 40;
  const vignette = 0.62 + mood.tension * 0.25 + pulse * 0.12 - mood.warmth * 0.22;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Heartbeat: edges flush red on each beat */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 48%, transparent 45%, #8a1620 100%)",
          opacity: pulse * 0.28,
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 75% at 50% 46%, transparent 38%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      {/* Keep Instagram's top and bottom UI legible */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 14%, transparent 80%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      {/* Warm light leaks drifting in from the edges once the video calms down */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: mood.warmth * 0.32,
          background: `radial-gradient(circle 620px at ${width + 80 + noise2D("leak-a", t * 0.003, 0) * 160}px ${
            height * 0.3 + noise2D("leak-b", 0, t * 0.003) * 260
          }px, #ff9a4d 0%, transparent 70%), radial-gradient(circle 520px at ${-60 + noise2D("leak-c", t * 0.003, 2) * 120}px ${
            height * 0.72 + noise2D("leak-d", 2, t * 0.003) * 220
          }px, #ffcf8a 0%, transparent 70%)`,
        }}
      />
      {/* Grain */}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.05 + mood.tension * 0.05 }}>
        <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none">
          <filter id="film-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={grainSeed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="540" height="960" filter="url(#film-grain)" />
        </svg>
      </AbsoluteFill>
      {/* Cinematic letterbox: closes in with the pressure, opens when calm */}
      {bar > 0.5 ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, background: "#000" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar, background: "#000" }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// A 1–2 frame white flash that punctuates the hardest cuts (timing.FLASH_FRAMES).
export const FlashFrames: React.FC = () => {
  const frame = useCurrentFrame();
  let opacity = 0;
  for (const f of FLASH_FRAMES) {
    opacity = Math.max(opacity, interpolate(frame - f, [0, 1, 5], [0.55, 0.3, 0], CLAMP) * (frame >= f ? 1 : 0));
  }
  if (opacity <= 0) return null;
  return <AbsoluteFill style={{ background: "#fff8ee", opacity, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

// Gentle fade to black at the very end.
export const FadeToBlack: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [from, to], [0, 1], CLAMP);
  return <AbsoluteFill style={{ background: "#000", opacity, pointerEvents: "none" }} />;
};
