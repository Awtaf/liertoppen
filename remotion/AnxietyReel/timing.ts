import { interpolate } from "remotion";
import { CLAMP } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// All timing lives here. Frames are at 30 fps (30 frames = 1 second).
// Scene `from` values are absolute; BEATS are relative to their scene start,
// so a scene can be moved or stretched without touching its internals.
// ─────────────────────────────────────────────────────────────────────────────

export const FPS = 30;

export const VIDEO = {
  fps: FPS,
  width: 1080,
  height: 1920,
  durationInFrames: 30 * FPS, // exactly 30 seconds
} as const;

export const SCENES = {
  hook: { from: 0, duration: 105 }, // 0:00–0:03.5
  problem: { from: 105, duration: 165 }, // 0:03.5–0:09
  turn: { from: 270, duration: 150 }, // 0:09–0:14
  solution: { from: 420, duration: 240 }, // 0:14–0:22
  payoff: { from: 660, duration: 130 }, // 0:22–0:26.3
  final: { from: 790, duration: 110 }, // 0:26.3–0:30
} as const;

export type SceneName = keyof typeof SCENES;

export const BEATS = {
  hook: {
    thoughtsEnd: 44, // thoughts vanish on this frame (hard cut)
    trick: 46, // "القلق عنده خدعة."
    demand: 68, // "بيطلب منك تحل بكرا… اليوم." (~0.5 s pause after the first line lands)
    exit: 97,
  },
  problem: {
    line1: 6,
    line1Duration: 58,
    line2: 66,
    line2Duration: 96,
    loader: 58, // search/loading UI appears
    flashes: [96, 114, 132], // "مضمون؟" "أكيد؟" "شو بعدين؟"
    flashDuration: 20,
    echo: 100, // "أكيد" repeating in the background
    echoFadeOut: 140,
  },
  turn: {
    freezeHold: 12, // frozen frame of the previous scene, then it dissolves
    freezeFade: 20,
    question: 34, // "بس اسأل حالك سؤال واحد…"
    bigQuestion: 90, // "شو الشي يلي بإيدي هلأ؟"
    exit: 138,
  },
  solution: {
    doIt: 0, // "إذا في شي بإيدك… اعمله."
    doItDuration: 70,
    check: 30, // task gets checked (relative to doIt)
    letGo: 70, // "وإذا مافي شي بإيدك… لا تحاول تحلّه براسك."
    letGoDuration: 90,
    knotLoosen: [22, 78], // relative to letGo
    backToToday: 160, // "ارجع لليوم."
    backToTodayDuration: 80,
    today: 18, // big "اليوم." (relative to backToToday)
  },
  payoff: {
    line1: 6,
    line1Duration: 62,
    line2: 70,
    line2Duration: 60,
    stepLight: 64, // the single step lights up just before line 2
  },
  final: {
    line1: 0, // "اليوم إلو شغله."
    line2: 34, // "وبكرا… منستقبله بكرا."
    sub: 48, // "خذ نفس. وارجع للي بإيدك."
    fadeOut: 92, // gentle fade to black until the last frame
  },
} as const;

export const at = (scene: SceneName, beat: number) => SCENES[scene].from + beat;

// ─── Mood ────────────────────────────────────────────────────────────────────
// One continuous curve for the whole video: tense/cold/dark → calm/warm/bright.
const MOOD_FRAMES = [0, 44, 46, 105, 265, 270, 330, 420, 540, 660, 790, 900];
const MOOD = {
  tension: [0.75, 1, 0.55, 0.8, 1, 0.25, 0.1, 0.05, 0, 0, 0, 0],
  warmth: [0, 0, 0, 0, 0, 0, 0.05, 0.25, 0.55, 0.75, 0.9, 0.9],
  brightness: [0.25, 0.4, 0.1, 0.3, 0.4, 0.06, 0.1, 0.3, 0.5, 0.55, 0.62, 0.45],
};

export type Mood = { tension: number; warmth: number; brightness: number };

export const getMood = (frame: number): Mood => ({
  tension: interpolate(frame, MOOD_FRAMES, MOOD.tension, CLAMP),
  warmth: interpolate(frame, MOOD_FRAMES, MOOD.warmth, CLAMP),
  brightness: interpolate(frame, MOOD_FRAMES, MOOD.brightness, CLAMP),
});

// ─── Ambient clock ───────────────────────────────────────────────────────────
// Background light, particles and grain run on this clock instead of the raw
// frame. It races in the first half, stops dead at the freeze (0:09) and then
// slows down until the image is almost still at the end.
const SPEED_FRAMES = [0, 44, 45, 105, 265, 269, 270, 300, 330, 420, 660, 790, 900];
const SPEED_VALUES = [1, 1.8, 0.6, 1.4, 2.2, 2.2, 0, 0, 0.35, 0.45, 0.3, 0.12, 0.08];

const AMBIENT_CLOCK: number[] = (() => {
  const clock = [0];
  for (let f = 1; f <= VIDEO.durationInFrames; f++) {
    clock[f] = clock[f - 1] + interpolate(f, SPEED_FRAMES, SPEED_VALUES, CLAMP);
  }
  return clock;
})();

export const ambientTime = (frame: number): number =>
  AMBIENT_CLOCK[Math.max(0, Math.min(Math.floor(frame), AMBIENT_CLOCK.length - 1))];

// ─── Heartbeat ───────────────────────────────────────────────────────────────
// Drives the visual pulse (camera scale + vignette) and, via audio.ts, the
// placement of heartbeat sound effects, so picture and sound stay in sync.
const HOOK_HEARTBEAT = { start: 0, end: BEATS.hook.thoughtsEnd, bpmFrom: 76, bpmTo: 156 };
const PROBLEM_HEARTBEAT = {
  start: SCENES.problem.from,
  end: SCENES.turn.from,
  bpm: 104,
  gain: 0.5,
};
const HEARTBEAT_THUMPS = [at("hook", BEATS.hook.trick), at("hook", BEATS.hook.demand)];

const hookPhase = (frame: number) => {
  const { start, end, bpmFrom, bpmTo } = HOOK_HEARTBEAT;
  const t = (frame - start) / FPS;
  const T = (end - start) / FPS;
  return (bpmFrom * t + ((bpmTo - bpmFrom) * t * t) / (2 * T)) / 60;
};

const problemPhase = (frame: number) =>
  (((frame - PROBLEM_HEARTBEAT.start) / FPS) * PROBLEM_HEARTBEAT.bpm) / 60;

// "lub-dub": a hard hit followed by a softer second beat.
const beatShape = (frac: number) =>
  Math.exp(-frac * 26) + (frac > 0.24 ? 0.55 * Math.exp(-(frac - 0.24) * 30) : 0);

export const heartbeatAt = (frame: number): number => {
  if (frame >= HOOK_HEARTBEAT.start && frame < HOOK_HEARTBEAT.end) {
    return beatShape(hookPhase(frame) % 1);
  }
  for (const thump of HEARTBEAT_THUMPS) {
    if (frame >= thump && frame < thump + 24) return Math.exp(-(frame - thump) * 0.35);
  }
  if (frame >= PROBLEM_HEARTBEAT.start && frame < PROBLEM_HEARTBEAT.end) {
    return PROBLEM_HEARTBEAT.gain * beatShape(problemPhase(frame) % 1);
  }
  return 0;
};

// Absolute frames on which a heartbeat "lub" lands.
export const heartbeatFrames = (): number[] => {
  const frames: number[] = [];
  for (let f = HOOK_HEARTBEAT.start; f < HOOK_HEARTBEAT.end; f++) {
    if (f === 0 || Math.floor(hookPhase(f)) > Math.floor(hookPhase(f - 1))) frames.push(f);
  }
  frames.push(...HEARTBEAT_THUMPS);
  for (let f = PROBLEM_HEARTBEAT.start; f < PROBLEM_HEARTBEAT.end; f++) {
    if (f === PROBLEM_HEARTBEAT.start || Math.floor(problemPhase(f)) > Math.floor(problemPhase(f - 1))) {
      frames.push(f);
    }
  }
  return frames;
};
