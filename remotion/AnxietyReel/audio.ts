import { at, BEATS, heartbeatFrames, SCENES, VIDEO } from "./timing";

// ─────────────────────────────────────────────────────────────────────────────
// SOUND DESIGN MAP
// Every cue is placeholder-only (src: null) so the project renders with no
// audio files. To enable a sound:
//   1. put a free/licensed file in remotion/public/audio/... (e.g. remotion/public/audio/sfx/heartbeat.mp3)
//   2. set `src` to the path relative to remotion/public (e.g. "audio/sfx/heartbeat.mp3")
// SoundLayer.tsx places each enabled cue at the right frame automatically.
// ─────────────────────────────────────────────────────────────────────────────

export type SoundCue = {
  id: string;
  from: number; // absolute frame (30 fps)
  durationInFrames?: number; // omit for one-shots
  src: string | null;
  volume: number;
  note: string;
};

// ▶ VOICEOVER — insert the voiceover MP3 here.
// Record the script in copy.ts (VOICEOVER_SCRIPT), export one 30 s MP3 that
// follows the caption timing in timing.ts, save it as
// remotion/public/audio/voiceover.mp3 and set src to "audio/voiceover.mp3".
// Line starts (seconds): 1.5 / 2.3 / 3.7 / 5.7 / 10.1 / 12.0 / 14.0 / 16.3 / 19.3 / 22.2 / 24.3 / 26.3 / 27.4
export const VOICEOVER: { src: string | null; volume: number } = {
  src: null,
  volume: 1,
};

const hb = heartbeatFrames();

export const SOUND_CUES: SoundCue[] = [
  // 0:00–0:01.5 · HEARTBEAT — one short "lub-dub" one-shot per beat. The beats
  // speed up with the thoughts (76 → 156 bpm), two single thumps land on the
  // hook headlines, and a softer 104 bpm pulse runs under 0:03.5–0:09.
  ...hb.map((frame, i) => ({
    id: `heartbeat-${i}`,
    from: frame,
    src: null,
    volume: frame < SCENES.problem.from ? 0.9 : 0.45,
    note: "heartbeat one-shot (low, muffled, felt more than heard)",
  })),

  // 0:00–0:01.5 · NOTIFICATIONS — soft phone pings on some of the thoughts.
  ...[0, 11, 20, 27, 33, 38].map((frame, i) => ({
    id: `notification-${i}`,
    from: frame,
    src: null,
    volume: 0.35 + i * 0.08,
    note: "notification ping, pitched slightly differently each time",
  })),

  // 0:01.5 · HARD CUT — everything disappears: all sound cuts at once.
  {
    id: "cut-to-silence",
    from: at("hook", BEATS.hook.thoughtsEnd),
    src: null,
    volume: 0.8,
    note: "reverse-cymbal suck ending exactly on this frame, then silence",
  },
  // 0:01.5 · "القلق عنده خدعة."
  { id: "impact-trick", from: at("hook", BEATS.hook.trick), src: null, volume: 0.9, note: "deep sub impact" },
  // 0:02.3 · "بيطلب منك تحل بكرا… اليوم." — accents on بكرا and اليوم
  { id: "hit-demand", from: at("hook", BEATS.hook.demand + 8), src: null, volume: 0.6, note: "short tonal hit" },
  // 0:03.2 · WHOOSH into the mental timeline
  { id: "whoosh-timeline", from: at("hook", BEATS.hook.exit), src: null, volume: 0.7, note: "fast whoosh / air rush" },
  // 0:03.5–0:09 · timeline rushing past
  {
    id: "timeline-drone",
    from: SCENES.problem.from,
    durationInFrames: SCENES.problem.duration,
    src: null,
    volume: 0.4,
    note: "rising tense drone, slowly getting louder",
  },
  // 0:05.4 · the loader keeps spinning
  {
    id: "loader-ticking",
    from: at("problem", BEATS.problem.loader),
    durationInFrames: SCENES.problem.duration - BEATS.problem.loader,
    src: null,
    volume: 0.3,
    note: "dry clock ticking / UI processing loop",
  },
  // 0:06.7 / 0:07.3 / 0:07.9 · flashes "مضمون؟" "أكيد؟" "شو بعدين؟"
  ...BEATS.problem.flashes.map((beat, i) => ({
    id: `flash-${i}`,
    from: at("problem", beat),
    src: null,
    volume: 0.5,
    note: "short glitch tick",
  })),
  // 0:09 · HARD STOP — the sound cuts. Everything above must end on this frame.
  {
    id: "hard-stop",
    from: SCENES.turn.from,
    src: null,
    volume: 0.7,
    note: "tape-stop (≤ 6 frames), then ~1 s of true silence",
  },
  // 0:10 → end · CALM AMBIENCE — warm pad / room tone, fade in over ~2 s.
  {
    id: "calm-ambience",
    from: SCENES.turn.from + 30,
    durationInFrames: VIDEO.durationInFrames - SCENES.turn.from - 30,
    src: null,
    volume: 0.35,
    note: "calm ambient pad, fade in over 60 frames, grows slightly warmer at 0:14",
  },
  // 0:15 · task gets checked off
  { id: "check", from: at("solution", BEATS.solution.check), src: null, volume: 0.5, note: "soft, warm UI tick" },
  // 0:17–0:19 · the knot loosens
  {
    id: "knot-release",
    from: at("solution", BEATS.solution.letGo + BEATS.solution.knotLoosen[0]),
    durationInFrames: BEATS.solution.knotLoosen[1] - BEATS.solution.knotLoosen[0],
    src: null,
    volume: 0.35,
    note: "string tension releasing / long exhale",
  },
  // 0:20 · "اليوم."
  {
    id: "whoosh-today",
    from: at("solution", BEATS.solution.backToToday + BEATS.solution.today - 6),
    src: null,
    volume: 0.4,
    note: "soft, slow whoosh + single piano note",
  },
  // 0:24.3 · the next step lights up
  { id: "step-light", from: at("payoff", BEATS.payoff.stepLight), src: null, volume: 0.45, note: "warm shimmer / light swell" },
  // 0:27.4 · "وبكرا… منستقبله بكرا."
  { id: "final-swell", from: at("final", BEATS.final.line2), src: null, volume: 0.4, note: "gentle resolve chord" },
  // 0:29.4 · fade out — everything fades with the picture.
];
