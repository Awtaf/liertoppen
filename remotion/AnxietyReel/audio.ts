import { at, BEATS, heartbeatFrames, isNotificationThought, SCENES, thoughtSpawnFrame, VIDEO } from "./timing";

// ─────────────────────────────────────────────────────────────────────────────
// SOUND DESIGN MAP
// All effects are synthesized by remotion/scripts/generate-sfx.mjs
// (`npm run remotion:sfx`) into remotion/public/audio/sfx/. No samples, no
// paid assets. To swap a sound, drop another file in remotion/public/audio/
// and change its `src` (path relative to remotion/public). `src: null` mutes
// a cue. SoundLayer.tsx places every cue and fades everything out at the end.
// ─────────────────────────────────────────────────────────────────────────────

export type SoundCue = {
  id: string;
  from: number; // absolute frame (30 fps)
  // Cue is cut off after this many frames (used for the hard cuts).
  durationInFrames?: number;
  src: string | null;
  volume: number;
  note: string;
};

// ▶ VOICEOVER — insert the voiceover MP3 here.
// Record the script in copy.ts (VOICEOVER_SCRIPT), export one 30 s MP3 that
// follows the caption timing in timing.ts, save it as
// remotion/public/audio/voiceover.mp3 and set src to "audio/voiceover.mp3".
// Line starts (seconds): 1.5 / 2.3 / 3.7 / 5.7 / 10.1 / 12.0 / 14.0 / 16.3 / 19.3 / 22.2 / 24.3 / 26.3 / 27.4
// When the voice is in, consider lowering the ambience/drone volumes by ~30%.
export const VOICEOVER: { src: string | null; volume: number } = {
  src: null,
  volume: 1,
};

const sfx = (name: string) => `audio/sfx/${name}.wav`;

// Length of each generated file, in frames.
const LENGTH = {
  heartbeat: 21,
  notification: 21,
  reverseSuck: 21,
  whoosh: 27,
  glitch: 9,
} as const;

// The two hard cuts: at 0:01.5 the thoughts vanish, at 0:09 everything stops.
const HOOK_CUT = at("hook", BEATS.hook.thoughtsEnd);
const HARD_STOP = SCENES.turn.from;

// Length that makes a cue stop exactly on `cut` (if it would ring past it).
const until = (from: number, length: number, cut: number) =>
  from < cut ? Math.max(1, Math.min(length, cut - from)) : length;

const NOTIFICATION_VARIANTS = ["notification-a", "notification-b", "notification-c"];

export const SOUND_CUES: SoundCue[] = [
  // 0:00–0:01.5 · HEARTBEAT — one "lub-dub" per beat, accelerating with the
  // thoughts (76 → 156 bpm) and cut dead at 0:01.5. Two single thumps land on
  // the hook headlines; a softer 104 bpm pulse runs under 0:03.5–0:09.
  ...heartbeatFrames().map((frame, i) => {
    const inHook = frame < HOOK_CUT;
    return {
      id: `heartbeat-${i}`,
      from: frame,
      durationInFrames: until(frame, LENGTH.heartbeat, inHook ? HOOK_CUT : HARD_STOP),
      src: sfx("heartbeat"),
      // The thumps under the headlines sit lower so they don't clip with the impact.
      volume: inHook ? 1 : frame < SCENES.problem.from ? 0.6 : 0.55,
      note: "heartbeat one-shot (low, muffled, felt more than heard)",
    };
  }),

  // 0:00–0:01.5 · NOTIFICATIONS — a soft ping on every thought drawn as a
  // phone notification, getting a little louder as the panic builds.
  ...Array.from({ length: BEATS.hook.thoughtCount }, (_, i) => i)
    .filter(isNotificationThought)
    .map((i, k) => {
      const frame = thoughtSpawnFrame(i, BEATS.hook.thoughtCount, BEATS.hook.thoughtSpawnWindow);
      return {
        id: `notification-${k}`,
        from: frame,
        durationInFrames: until(frame, LENGTH.notification, HOOK_CUT),
        src: sfx(NOTIFICATION_VARIANTS[k % NOTIFICATION_VARIANTS.length]),
        volume: 0.22 + k * 0.05,
        note: "notification ping, three pitches",
      };
    }),

  // 0:00.8–0:01.5 · HARD CUT — reverse-cymbal suck that ends exactly on the
  // frame the thoughts vanish. After it: silence.
  {
    id: "cut-to-silence",
    from: HOOK_CUT - LENGTH.reverseSuck,
    durationInFrames: LENGTH.reverseSuck,
    src: sfx("reverse-suck"),
    volume: 0.85,
    note: "reverse-cymbal suck ending exactly on the cut",
  },
  // 0:01.5 · "القلق عنده خدعة."
  { id: "impact-trick", from: at("hook", BEATS.hook.trick), src: sfx("impact"), volume: 0.6, note: "deep sub impact" },
  // 0:02.7 · "بيطلب منك تحل بكرا… اليوم." — tonal hits on بكرا and اليوم
  { id: "hit-bukra", from: at("hook", BEATS.hook.demand + 14), src: sfx("hit-high"), volume: 0.4, note: "tonal hit on بكرا" },
  { id: "hit-alyom", from: at("hook", BEATS.hook.demand + 18), src: sfx("hit-low"), volume: 0.5, note: "tonal hit on اليوم" },
  // 0:03.2 · WHOOSH into the mental timeline (peaks on the scene change)
  { id: "whoosh-timeline", from: at("hook", BEATS.hook.exit), src: sfx("whoosh"), volume: 0.55, note: "fast whoosh / air rush" },
  // 0:03.5–0:09 · timeline rushing past
  {
    id: "timeline-drone",
    from: SCENES.problem.from,
    durationInFrames: HARD_STOP - SCENES.problem.from,
    src: sfx("drone"),
    volume: 0.4,
    note: "rising tense drone, slowly getting louder",
  },
  // 0:05.4–0:09 · the loader keeps spinning
  {
    id: "loader-ticking",
    from: at("problem", BEATS.problem.loader),
    durationInFrames: HARD_STOP - at("problem", BEATS.problem.loader),
    src: sfx("ticking"),
    volume: 0.22,
    note: "dry clock ticking, speeding up",
  },
  // 0:06.7 / 0:07.3 / 0:07.9 · flashes "مضمون؟" "أكيد؟" "شو بعدين؟"
  ...BEATS.problem.flashes.map((beat, i) => ({
    id: `flash-${i}`,
    from: at("problem", beat),
    durationInFrames: LENGTH.glitch,
    src: sfx("glitch"),
    volume: 0.28,
    note: "short glitch tick",
  })),
  // 0:09 · HARD STOP — everything above is cut on this frame; the drone's
  // pitch collapses (tape-stop), then ~1 s of true silence.
  { id: "hard-stop", from: HARD_STOP, src: sfx("tape-stop"), volume: 0.45, note: "tape-stop, then silence" },
  // 0:10 → end · CALM AMBIENCE — warm pad in D; brightens at 0:14.
  {
    id: "calm-ambience",
    from: HARD_STOP + 30,
    durationInFrames: VIDEO.durationInFrames - HARD_STOP - 30,
    src: sfx("ambience"),
    volume: 0.4,
    note: "calm ambient pad, 2 s fade-in, warmer from 0:14",
  },
  // 0:15 · the task gets checked off
  { id: "check", from: at("solution", BEATS.solution.check), src: sfx("check"), volume: 0.4, note: "soft, warm UI tick" },
  // 0:17–0:19 · the knot loosens
  {
    id: "knot-release",
    from: at("solution", BEATS.solution.letGo + BEATS.solution.knotLoosen[0]),
    src: sfx("release"),
    volume: 0.35,
    note: "string tension releasing / long exhale",
  },
  // 0:19.7 · soft whoosh landing on a single piano note with "اليوم."
  {
    id: "whoosh-today",
    from: at("solution", BEATS.solution.backToToday + BEATS.solution.today - 6),
    src: sfx("today"),
    volume: 0.5,
    note: "soft slow whoosh + single piano note (D4)",
  },
  // 0:24.4 · the next step lights up
  { id: "step-light", from: at("payoff", BEATS.payoff.stepLight), src: sfx("shimmer"), volume: 0.35, note: "warm shimmer / light swell" },
  // 0:27.5 · "وبكرا… منستقبله بكرا."
  { id: "final-swell", from: at("final", BEATS.final.line2), src: sfx("resolve"), volume: 0.45, note: "gentle resolving D major chord" },
  // 0:29.4 → 0:30 · everything fades out with the picture (SoundLayer).
];

// Master fade-out, in sync with the picture's FadeToBlack.
export const MASTER_FADE = {
  from: at("final", BEATS.final.fadeOut),
  to: VIDEO.durationInFrames - 1,
} as const;
