import { interpolate } from "remotion";
import { CLAMP } from "./utils";
import VOICE_LENGTHS from "./voiceover-manifest.json";

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
  durationInFrames: 45 * FPS, // exactly 45 seconds
} as const;

// ─── Voiceover-driven timeline ───────────────────────────────────────────────
// The spoken lines set the rhythm. Each line starts `gap` frames after the
// previous one ends; its length comes from voiceover-manifest.json (written by
// `npm run remotion:voiceover`). Captions start on the same frame as their
// line, so changing the copy and regenerating the voice keeps everything in sync.
// Tune the pacing with the gaps below.
const VO_GAPS: Record<VoiceLineId, number> = {
  trick: 61, // absolute start: right after the thoughts vanish
  demand: 8,
  problem1: 18, // whoosh into the timeline
  problem2: 8,
  problem3: 8,
  stop: 40, // HARD STOP: frozen frame + silence
  question: 14,
  bigQuestion: 16, // "short pause"
  doIt: 22, // let the question sink in
  letGo: 10,
  back: 12,
  payoff1: 30, // big "اليوم." breathes
  payoff2: 12,
  final1: 18,
  final2: 14,
};
const MIN_END_HOLD = 50; // frames the last line stays readable before the end

export type VoiceLineId = keyof typeof VOICE_LENGTHS;

type Span = { start: number; frames: number; end: number };

export const VO: Record<VoiceLineId, Span> = (() => {
  const spans = {} as Record<VoiceLineId, Span>;
  let cursor = 0;
  for (const id of Object.keys(VOICE_LENGTHS) as VoiceLineId[]) {
    const start = cursor + VO_GAPS[id];
    const frames = VOICE_LENGTHS[id];
    spans[id] = { start, frames, end: start + frames };
    cursor = start + frames;
  }
  if (cursor > VIDEO.durationInFrames - MIN_END_HOLD) {
    throw new Error(
      `Voiceover runs until frame ${cursor}, past ${VIDEO.durationInFrames - MIN_END_HOLD}. ` +
        "Shorten VO_GAPS in timing.ts or speed up lines in voiceover.json.",
    );
  }
  return spans;
})();

// Frames between words so a caption reveals at roughly the speaking pace.
export const voStagger = (id: VoiceLineId, wordCount: number) =>
  Math.max(2, Math.min(16, Math.round((VO[id].frames * 0.8) / Math.max(1, wordCount))));

// ─── Scenes ──────────────────────────────────────────────────────────────────
// Scene `from` values are absolute; BEATS are relative to their scene start,
// so scenes can move or stretch without touching their internals.
const THOUGHTS_END = 58;
export const HARD_STOP = VO.problem3.end + 6;
const SOLUTION_FROM = VO.doIt.start - 3;
const PAYOFF_FROM = VO.payoff1.start - 3;
const FINAL_FROM = VO.final1.start - 2;
const HOOK_END = VO.problem1.start - 8;

export const SCENES = {
  hook: { from: 0, duration: HOOK_END },
  problem: { from: HOOK_END, duration: HARD_STOP - HOOK_END },
  turn: { from: HARD_STOP, duration: SOLUTION_FROM - HARD_STOP },
  solution: { from: SOLUTION_FROM, duration: PAYOFF_FROM - SOLUTION_FROM },
  payoff: { from: PAYOFF_FROM, duration: FINAL_FROM - PAYOFF_FROM },
  final: { from: FINAL_FROM, duration: VIDEO.durationInFrames - FINAL_FROM },
} as const;

export type SceneName = keyof typeof SCENES;

const rel = (scene: SceneName, absolute: number) => absolute - SCENES[scene].from;

const line1 = rel("problem", VO.problem1.start);
const line2 = rel("problem", VO.problem2.start);
const line3 = rel("problem", VO.problem3.start);

export const BEATS = {
  hook: {
    thoughtsEnd: THOUGHTS_END, // thoughts vanish on this frame (hard cut)
    thoughtCount: 22,
    thoughtSpawnWindow: THOUGHTS_END - 4,
    trick: VO.trick.start, // "للقلق خدعة واحدة."
    demand: VO.demand.start, // "يطلب منك أن تحلّ الغد… اليوم."
    demandStagger: voStagger("demand", 6),
    exit: SCENES.hook.duration - 8,
  },
  problem: {
    line1,
    line1Duration: VO.problem2.start - VO.problem1.start - 1,
    line2,
    line2Duration: VO.problem3.start - VO.problem2.start - 1,
    line3, // "وكلّما بحثتَ أكثر… ازداد الضجيج." — the chaos peaks here
    line3Duration: SCENES.problem.duration - line3 - 1,
    loader: line1 + Math.round(VO.problem1.frames * 0.6), // search/loading UI
    flashes: [line2 + Math.round(VO.problem2.frames * 0.6), line3 + 10, line3 + 34], // "مضمون؟" "أكيد؟" "ثم ماذا؟"
    flashDuration: 17,
    echo: line3 + 4, // "أكيد" repeating in the background
    echoFadeOut: SCENES.problem.duration - 12,
  },
  turn: {
    freezeHold: 12, // frozen frame of the previous scene, then it dissolves
    freezeFade: 22,
    stop: rel("turn", VO.stop.start), // "لكن… توقّف لحظة."
    question: rel("turn", VO.question.start), // "واسأل نفسك سؤالًا واحدًا:"
    bigQuestion: rel("turn", VO.bigQuestion.start), // "ما الذي بين يديّ الآن؟"
    exit: SCENES.turn.duration - 12,
  },
  solution: {
    doIt: rel("solution", VO.doIt.start), // "إن كان بيدك شيء… فافعله."
    doItDuration: VO.letGo.start - VO.doIt.start,
    check: Math.round(VO.doIt.frames * 0.8), // task gets checked on "فافعله" (relative to doIt)
    letGo: rel("solution", VO.letGo.start), // "وإن لم يكن بيدك شيء… فلا تحاول حلّه في رأسك."
    letGoDuration: VO.back.start - VO.letGo.start,
    knotLoosen: [Math.round(VO.letGo.frames * 0.45), VO.letGo.frames + 4], // relative to letGo
    backToToday: rel("solution", VO.back.start), // "عُد إلى اليوم."
    backToTodayDuration: SCENES.solution.duration - rel("solution", VO.back.start),
    today: Math.round(VO.back.frames * 0.55), // big "اليوم." lands on the spoken word
  },
  payoff: {
    line1: rel("payoff", VO.payoff1.start),
    line1Duration: VO.payoff2.start - VO.payoff1.start - 2,
    line2: rel("payoff", VO.payoff2.start),
    line2Duration: SCENES.payoff.duration - rel("payoff", VO.payoff2.start),
    stepLight: rel("payoff", VO.payoff2.start) + Math.round(VO.payoff2.frames * 0.45), // on "خطوتك التالية"
  },
  final: {
    line1: rel("final", VO.final1.start), // "لليوم ما يكفيه."
    line2: rel("final", VO.final2.start), // "والغد… نستقبله غدًا."
    sub: rel("final", VO.final2.start) + 40, // "خذ نفسًا عميقًا… وعُد إلى ما بين يديك."
    fadeOut: SCENES.final.duration - 18, // gentle fade to black until the last frame
  },
} as const;

export const at = (scene: SceneName, beat: number) => SCENES[scene].from + beat;

// Thought i of `count` spawns on this frame: large gaps first (suspense), then
// almost every frame. Shared by ThoughtCloud (picture) and audio.ts (pings).
export const thoughtSpawnFrame = (i: number, count: number, spawnWindow: number) =>
  Math.round(spawnWindow * Math.pow(i / count, 0.5));

// Every 4th thought is drawn as a phone notification (and gets a ping).
export const isNotificationThought = (i: number) => i % 4 === 1;

// Short white flash frames that punctuate the hardest cuts.
export const FLASH_FRAMES = [VO.trick.start, SCENES.problem.from + 2];

// Cinematic letterbox bars (px): they close in as the pressure builds and
// open up completely once the video calms down.
const LETTERBOX_FRAMES = [
  0,
  VO.trick.start,
  SCENES.problem.from,
  HARD_STOP - 1,
  HARD_STOP,
  SCENES.solution.from,
  SCENES.solution.from + 90,
  SCENES.payoff.from,
  VIDEO.durationInFrames,
];
const LETTERBOX_HEIGHT = [150, 130, 120, 185, 185, 120, 50, 0, 0];

export const letterboxAt = (frame: number) => interpolate(frame, LETTERBOX_FRAMES, LETTERBOX_HEIGHT, CLAMP);

// ─── Mood ────────────────────────────────────────────────────────────────────
// One continuous curve for the whole video: tense/cold/dark → calm/warm/bright.
const MOOD_FRAMES = [
  0,
  THOUGHTS_END,
  THOUGHTS_END + 2,
  SCENES.problem.from,
  HARD_STOP - 5,
  HARD_STOP,
  HARD_STOP + 60,
  SCENES.solution.from,
  SCENES.solution.from + 150,
  SCENES.payoff.from,
  SCENES.final.from,
  VIDEO.durationInFrames,
];
const MOOD = {
  tension: [0.75, 1, 0.55, 0.8, 1, 0.25, 0.1, 0.05, 0, 0, 0, 0],
  warmth: [0, 0, 0, 0, 0, 0, 0.05, 0.25, 0.55, 0.75, 0.9, 0.9],
  brightness: [0.25, 0.4, 0.1, 0.3, 0.45, 0.06, 0.1, 0.3, 0.5, 0.55, 0.62, 0.45],
};

export type Mood = { tension: number; warmth: number; brightness: number };

export const getMood = (frame: number): Mood => ({
  tension: interpolate(frame, MOOD_FRAMES, MOOD.tension, CLAMP),
  warmth: interpolate(frame, MOOD_FRAMES, MOOD.warmth, CLAMP),
  brightness: interpolate(frame, MOOD_FRAMES, MOOD.brightness, CLAMP),
});

// ─── Ambient clock ───────────────────────────────────────────────────────────
// Background light, particles and grain run on this clock instead of the raw
// frame. It races in the first half, stops dead at the hard stop and then
// slows down until the image is almost still at the end.
const SPEED_FRAMES = [
  0,
  THOUGHTS_END,
  THOUGHTS_END + 1,
  SCENES.problem.from,
  HARD_STOP - 5,
  HARD_STOP - 1,
  HARD_STOP,
  HARD_STOP + 30,
  HARD_STOP + 60,
  SCENES.solution.from,
  SCENES.payoff.from,
  SCENES.final.from,
  VIDEO.durationInFrames,
];
const SPEED_VALUES = [1, 1.8, 0.6, 1.4, 2.4, 2.4, 0, 0, 0.35, 0.45, 0.3, 0.12, 0.08];

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
// Each ramp accelerates linearly from bpmFrom to bpmTo.
type HeartRamp = { start: number; end: number; bpmFrom: number; bpmTo: number; gain: number };
const HEART_RAMPS: HeartRamp[] = [
  { start: 0, end: THOUGHTS_END, bpmFrom: 70, bpmTo: 160, gain: 1 },
  { start: SCENES.problem.from, end: HARD_STOP, bpmFrom: 92, bpmTo: 138, gain: 0.55 },
];
const HEARTBEAT_THUMPS = [VO.trick.start, VO.demand.start];

const rampPhase = (frame: number, r: HeartRamp) => {
  const t = (frame - r.start) / FPS;
  const T = (r.end - r.start) / FPS;
  return (r.bpmFrom * t + ((r.bpmTo - r.bpmFrom) * t * t) / (2 * T)) / 60;
};

// "lub-dub": a hard hit followed by a softer second beat.
const beatShape = (frac: number) =>
  Math.exp(-frac * 26) + (frac > 0.24 ? 0.55 * Math.exp(-(frac - 0.24) * 30) : 0);

export const heartbeatAt = (frame: number): number => {
  for (const thump of HEARTBEAT_THUMPS) {
    if (frame >= thump && frame < thump + 24) return Math.exp(-(frame - thump) * 0.35);
  }
  for (const r of HEART_RAMPS) {
    if (frame >= r.start && frame < r.end) return r.gain * beatShape(rampPhase(frame, r) % 1);
  }
  return 0;
};

// Absolute frames on which a heartbeat "lub" lands.
export const heartbeatFrames = (): number[] => {
  const frames: number[] = [...HEARTBEAT_THUMPS];
  for (const r of HEART_RAMPS) {
    for (let f = r.start; f < r.end; f++) {
      if (f === r.start || Math.floor(rampPhase(f, r)) > Math.floor(rampPhase(f - 1, r))) frames.push(f);
    }
  }
  return frames.sort((a, b) => a - b);
};
