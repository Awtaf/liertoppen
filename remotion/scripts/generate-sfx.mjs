// Synthesizes every sound effect for AnxietyReel from scratch (no samples,
// no paid assets) and writes them as WAV files to remotion/public/audio/sfx/.
//
//   npm run remotion:sfx
//
// Deterministic: the same code always produces the same files.
// Timing of each cue lives in remotion/AnxietyReel/audio.ts.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 48000;
const TAU = Math.PI * 2;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "audio", "sfx");

// ─── DSP helpers ─────────────────────────────────────────────────────────────

const buffer = (seconds) => new Float32Array(Math.round(seconds * SR));

const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const noise = (seconds, seed) => {
  const r = rng(seed);
  const x = buffer(seconds);
  for (let i = 0; i < x.length; i++) x[i] = r() * 2 - 1;
  return x;
};

// One-pole low-pass; cutoff may be a number or a function of time (s).
const lowpass = (x, cutoff) => {
  const y = new Float32Array(x.length);
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    const fc = typeof cutoff === "function" ? cutoff(i / SR) : cutoff;
    const a = 1 - Math.exp((-TAU * fc) / SR);
    s += a * (x[i] - s);
    y[i] = s;
  }
  return y;
};

const highpass = (x, cutoff) => {
  const low = lowpass(x, cutoff);
  return x.map((v, i) => v - low[i]);
};

// State-variable band-pass; centre may be a function of time (s).
const bandpass = (x, centre, q = 1) => {
  const y = new Float32Array(x.length);
  let low = 0;
  let band = 0;
  const damp = 1 / q;
  for (let i = 0; i < x.length; i++) {
    const fc = typeof centre === "function" ? centre(i / SR) : centre;
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
    low += f * band;
    const high = x[i] - low - damp * band;
    band += f * high;
    y[i] = band;
  }
  return y;
};

// Small Schroeder/Freeverb-style room.
const reverb = (x, { wet = 0.3, room = 0.84, damp = 0.35 } = {}) => {
  const scale = SR / 44100;
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => ({
    buf: new Float32Array(Math.round(d * scale)),
    idx: 0,
    store: 0,
  }));
  const allpasses = [556, 441, 341, 225].map((d) => ({ buf: new Float32Array(Math.round(d * scale)), idx: 0 }));
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const input = x[i] * 0.015;
    let out = 0;
    for (const c of combs) {
      const v = c.buf[c.idx];
      c.store = v * (1 - damp) + c.store * damp;
      c.buf[c.idx] = input + c.store * room;
      c.idx = (c.idx + 1) % c.buf.length;
      out += v;
    }
    for (const a of allpasses) {
      const v = a.buf[a.idx];
      a.buf[a.idx] = out + v * 0.5;
      a.idx = (a.idx + 1) % a.buf.length;
      out = v - out;
    }
    y[i] = x[i] + out * wet * 3;
  }
  return y;
};

const mixInto = (target, source, atSeconds = 0, gain = 1) => {
  const offset = Math.round(atSeconds * SR);
  for (let i = 0; i < source.length && offset + i < target.length; i++) target[offset + i] += source[i] * gain;
  return target;
};

const softclip = (x, drive = 1) => x.map((v) => Math.tanh(v * drive));

const fade = (x, inSeconds, outSeconds) => {
  const fin = Math.round(inSeconds * SR);
  const fout = Math.round(outSeconds * SR);
  for (let i = 0; i < fin && i < x.length; i++) x[i] *= Math.sin(((i / fin) * Math.PI) / 2) ** 2;
  for (let i = 0; i < fout && i < x.length; i++) x[x.length - 1 - i] *= Math.sin(((i / fout) * Math.PI) / 2) ** 2;
  return x;
};

const normalize = (x, peak = 0.89) => {
  let max = 0;
  for (const v of x) max = Math.max(max, Math.abs(v));
  return max > 0 ? x.map((v) => (v / max) * peak) : x;
};

// Per-sample generator: fn(t, i) → sample.
const render = (seconds, fn) => {
  const x = buffer(seconds);
  for (let i = 0; i < x.length; i++) x[i] = fn(i / SR, i);
  return x;
};

// Oscillator with a time-varying frequency (phase-accumulating).
const sweep = (seconds, freq, env, shape = Math.sin) => {
  let phase = 0;
  return render(seconds, (t) => {
    phase += (TAU * freq(t)) / SR;
    return shape(phase) * env(t);
  });
};

const bell = (seconds, f, decay, partials = [[1, 1], [2.76, 0.2], [5.4, 0.08]]) =>
  render(seconds, (t) => {
    const env = Math.min(1, t / 0.003) * Math.exp(-t * decay);
    let s = 0;
    for (const [ratio, amp] of partials) s += amp * Math.sin(TAU * f * ratio * t);
    return s * env;
  });

// Soft felt-piano note: slightly inharmonic partials, higher ones decay faster.
const piano = (seconds, f, velocity = 1) =>
  render(seconds, (t) => {
    const attack = Math.min(1, t / 0.004);
    let s = 0;
    for (let n = 1; n <= 9; n++) {
      const fn = n * f * Math.sqrt(1 + 0.0004 * n * n);
      s += (Math.sin(TAU * fn * t) / n ** 1.4) * Math.exp(-t * (0.9 + n * 0.55));
    }
    return s * attack * velocity;
  });

const writeWav = (name, samples) => {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(join(OUT_DIR, `${name}.wav`), Buffer.concat([header, data]));
  console.log(`  ${name}.wav  ${(samples.length / SR).toFixed(2)}s`);
};

// ─── Sounds ──────────────────────────────────────────────────────────────────

const SOUNDS = {
  // Low, muffled "lub-dub", felt more than heard.
  heartbeat: () => {
    const x = buffer(0.7);
    const thump = (at, amp) => {
      const body = sweep(0.4, (t) => 46 + 42 * Math.exp(-t * 30), (t) => (1 - Math.exp(-t * 400)) * Math.exp(-t * 14));
      const knock = lowpass(noise(0.08, 11), 260).map((v, i) => v * Math.exp((-i / SR) * 70) * 2.2);
      mixInto(x, body, at, amp);
      mixInto(x, knock, at, amp * 0.5);
    };
    thump(0, 1);
    thump(0.2, 0.62);
    return normalize(lowpass(softclip(x, 1.6), 190));
  },

  // Soft two-tone phone ping, in three pitches.
  ...Object.fromEntries(
    [
      ["notification-a", 1318.5, 1760],
      ["notification-b", 1174.7, 1568],
      ["notification-c", 1480, 1975.5],
    ].map(([name, f1, f2]) => [
      name,
      () => {
        const x = buffer(0.7);
        mixInto(x, bell(0.6, f1, 11), 0, 0.8);
        mixInto(x, bell(0.6, f2, 9), 0.085, 0.65);
        return normalize(fade(reverb(x, { wet: 0.25, room: 0.7 }), 0.001, 0.08));
      },
    ]),
  ),

  // Reverse-cymbal "suck" that ends abruptly on its last sample (the hard cut).
  "reverse-suck": () => {
    const T = 0.7;
    const air = bandpass(noise(T, 21), (t) => 400 + 7000 * (t / T) ** 2, 0.8);
    const hiss = highpass(noise(T, 22), 4000);
    const x = render(T, (t, i) => ((t / T) ** 3) * (air[i] * 1.2 + hiss[i] * 0.5));
    return normalize(fade(x, 0.01, 0.002));
  },

  // Deep cinematic sub impact with a room tail.
  impact: () => {
    const x = buffer(3.2);
    mixInto(x, sweep(3, (t) => 36 + 70 * Math.exp(-t * 16), (t) => Math.min(1, t / 0.002) * Math.exp(-t * 2)), 0, 1);
    mixInto(x, lowpass(noise(1, 31), 700).map((v, i) => v * Math.exp((-i / SR) * 9) * 2.5), 0, 0.6);
    mixInto(x, highpass(noise(0.2, 32), 3000).map((v, i) => v * Math.exp((-i / SR) * 55)), 0, 0.25);
    return normalize(fade(reverb(softclip(x, 1.4), { wet: 0.22, room: 0.88, damp: 0.5 }), 0.001, 0.6));
  },

  // Short tonal hits for "بكرا" and "اليوم".
  ...Object.fromEntries(
    [
      ["hit-high", 220],
      ["hit-low", 164.8],
    ].map(([name, f]) => [
      name,
      () => {
        const x = buffer(1.8);
        const tone = render(1.4, (t) => {
          const env = Math.min(1, t / 0.002) * Math.exp(-t * 3.8);
          return env * (Math.sin(TAU * f * t) + 0.5 * Math.sin(TAU * f * 2.01 * t) + 0.25 * Math.sin(TAU * f * 3.97 * t) + 0.8 * Math.sin(TAU * (f / 2) * t));
        });
        mixInto(x, tone, 0, 1);
        mixInto(x, highpass(noise(0.05, 41), 2000).map((v, i) => v * Math.exp((-i / SR) * 90)), 0, 0.4);
        return normalize(fade(reverb(x, { wet: 0.35, room: 0.86 }), 0.001, 0.4));
      },
    ]),
  ),

  // Fast air whoosh into the timeline.
  whoosh: () => {
    const T = 0.9;
    const peak = 0.42;
    const env = (t) => (t < peak ? (t / peak) ** 2 : Math.exp(-(t - peak) * 7));
    const air = bandpass(noise(T, 51), (t) => 350 + 3200 * Math.sin((Math.PI * Math.min(t, T)) / T) ** 2, 1.4);
    const rumble = lowpass(noise(T, 52), 120);
    return normalize(fade(render(T, (t, i) => env(t) * (air[i] + rumble[i] * 3)), 0.005, 0.1));
  },

  // Rising tense drone under the problem scene. Ends abruptly (the hard stop);
  // audio.ts trims its start so the end always lands on the hard stop.
  drone: () => {
    const T = 14;
    const voices = [55, 58.27, 82.41, 55.3];
    const raw = render(T, (t) => {
      let s = 0;
      for (const f of voices) for (let n = 1; n <= 8; n++) s += Math.sin(TAU * f * n * t + n) / n;
      s += 0.12 * Math.sin(TAU * (880 + 52 * (t / T)) * t) * (t / T);
      return s * (0.15 + 0.85 * (t / T) ** 1.6);
    });
    return normalize(fade(softclip(lowpass(raw, (t) => 180 + 1500 * (t / T) ** 2), 0.8), 0.25, 0.004));
  },

  // Dry clock ticking, speeding up (trimmed from the start like the drone).
  ticking: () => {
    const T = 10;
    const x = buffer(T);
    let t = 0;
    let n = 0;
    while (t < T - 0.05) {
      const f = n % 2 ? 2600 : 3200;
      const click = render(0.05, (u) => Math.exp(-u * 280) * Math.sin(TAU * f * u));
      mixInto(x, click, t, 1);
      mixInto(x, highpass(noise(0.004, 60 + n), 2500), t, 0.5);
      t += 0.36 - 0.2 * (t / T);
      n++;
    }
    return normalize(reverb(x, { wet: 0.12, room: 0.6 }));
  },

  // Short digital glitch tick for the flash words.
  glitch: () => {
    const r = rng(71);
    const T = 0.28;
    let freq = 400;
    let held = 0;
    return normalize(
      render(T, (t, i) => {
        if (i % 960 === 0) freq = 200 + r() * 1800; // new blip every 20 ms
        if (i % 6 === 0) held = r() * 2 - 1; // sample-and-hold crush
        const square = Math.sign(Math.sin(TAU * freq * t));
        return (square * 0.5 + held * 0.6) * Math.exp(-t * 14) * Math.min(1, t / 0.001);
      }),
    );
  },

  // Tape-stop: the drone's pitch collapses to nothing.
  "tape-stop": () => {
    const T = 0.45;
    const voices = [55, 58.27, 110, 220];
    const phases = voices.map(() => 0);
    const x = render(T, (t) => {
      const rate = (1 - t / T) ** 2;
      let s = 0;
      voices.forEach((f, k) => {
        phases[k] += (TAU * f * rate) / SR;
        for (let n = 1; n <= 5; n++) s += Math.sin(phases[k] * n) / n;
      });
      return s * (1 - t / T);
    });
    return normalize(fade(lowpass(x, (t) => 1600 * (1 - t / T) + 80), 0.002, 0.03));
  },

  // Riser into the hard stop: filtered noise and a rising tone cluster that
  // get louder and higher until the very last sample.
  riser: () => {
    const T = 5;
    const air = bandpass(noise(T, 121), (t) => 300 + 6000 * (t / T) ** 2.2, 0.9);
    const tone = sweep(T, (t) => 110 * 2 ** (2.5 * (t / T) ** 1.5), (t) => (t / T) ** 2.5, (p) => Math.sin(p) + 0.4 * Math.sin(2.01 * p) + 0.25 * Math.sin(3.02 * p));
    const x = render(T, (t, i) => (t / T) ** 3 * air[i] * 1.4 + tone[i] * 0.5);
    return normalize(fade(softclip(x, 1.2), 0.2, 0.002));
  },

  // One soft, deep boom under "توقّف".
  "sub-boom": () => {
    const x = buffer(3);
    mixInto(x, sweep(2.8, (t) => 42 + 20 * Math.exp(-t * 6), (t) => Math.min(1, t / 0.04) * Math.exp(-t * 1.6)), 0, 1);
    mixInto(x, lowpass(noise(1.2, 131), 180).map((v, i) => v * Math.exp((-i / SR) * 3) * 2), 0, 0.3);
    return normalize(fade(reverb(x, { wet: 0.3, room: 0.9, damp: 0.6 }), 0.02, 0.8));
  },

  // Calm, warm pad in D (hard stop → end). Grows brighter ~7 s in, when the
  // solution starts.
  ambience: () => {
    const T = 30;
    const r = rng(81);
    const voices = [
      [73.42, 0.9, false],
      [146.83, 0.7, false],
      [220, 0.55, false],
      [293.66, 0.45, false],
      [369.99, 0.35, true],
      [440, 0.3, true],
      [659.25, 0.18, true],
    ].map(([f, amp, bright]) => ({ f, amp, bright, lfo: 0.04 + r() * 0.08, ph: r() * TAU }));
    const pad = render(T, (t) => {
      const warmth = Math.min(1, Math.max(0.25, (t - 6.5) / 3));
      let s = 0;
      for (const v of voices) {
        const g = v.amp * (0.7 + 0.3 * Math.sin(TAU * v.lfo * t + v.ph)) * (v.bright ? warmth : 1);
        s += g * (Math.sin(TAU * v.f * 0.9985 * t) + Math.sin(TAU * v.f * 1.0015 * t + 1) + 0.3 * Math.sin(TAU * v.f * 2 * t));
      }
      return s;
    });
    const room = lowpass(lowpass(noise(T, 82), 500), 500);
    const x = pad.map((v, i) => v + room[i] * 6);
    return normalize(fade(reverb(lowpass(x, 2400), { wet: 0.3, room: 0.9, damp: 0.5 }), 2, 1.5), 0.8);
  },

  // Soft, warm UI tick when the task is checked.
  check: () => {
    const x = buffer(0.6);
    mixInto(x, render(0.05, (t) => Math.exp(-t * 120) * Math.sin(TAU * 1800 * t)), 0, 0.7);
    mixInto(x, bell(0.5, 880, 10, [[1, 1], [1.5, 0.4], [2, 0.15]]), 0.015, 0.5);
    return normalize(fade(reverb(x, { wet: 0.25, room: 0.75 }), 0.001, 0.1));
  },

  // String tension releasing + a long exhale while the knot loosens.
  release: () => {
    const T = 1.9;
    const breath = bandpass(noise(T, 91), (t) => 900 - 500 * (t / T), 0.7);
    const gliss = sweep(T, (t) => 660 * 2 ** (-t / T) * (1 + 0.004 * Math.sin(TAU * 5 * t)), (t) => Math.sin((Math.PI * t) / T) * 0.35);
    const env = (t) => Math.sin((Math.PI * t) / T) ** 1.5;
    const x = render(T, (t, i) => env(t) * breath[i] + gliss[i]);
    return normalize(fade(reverb(x, { wet: 0.35, room: 0.85 }), 0.05, 0.3));
  },

  // Slow soft whoosh landing on a single piano note (D4) for "اليوم.".
  today: () => {
    const x = buffer(3);
    const T = 0.5;
    const air = bandpass(noise(T, 101), (t) => 200 + 1100 * (t / T), 1);
    mixInto(x, render(T, (t, i) => air[i] * (t / T) ** 2), 0, 0.5);
    mixInto(x, piano(2.7, 293.66, 1), 0.2, 1);
    mixInto(x, piano(2.7, 587.33, 0.25), 0.2, 1);
    return normalize(fade(reverb(x, { wet: 0.4, room: 0.88 }), 0.01, 0.8));
  },

  // Warm shimmer as the next step lights up.
  shimmer: () => {
    const T = 2.8;
    const r = rng(111);
    const x = buffer(T);
    const notes = [1174.7, 1318.5, 1480, 1760, 1975.5, 2349.3];
    for (let k = 0; k < 14; k++) {
      mixInto(x, bell(1.4, notes[Math.floor(r() * notes.length)], 3.5, [[1, 1], [2, 0.12]]), 0.05 + r() * 1.2, 0.25 + r() * 0.3);
    }
    const air = highpass(noise(T, 112), 5000);
    mixInto(x, render(T, (t, i) => air[i] * Math.sin((Math.PI * Math.min(t, 1.6)) / 1.6) * 0.3), 0, 1);
    const swell = render(T, (t) => Math.min(1, t / 0.6));
    return normalize(fade(reverb(x.map((v, i) => v * swell[i]), { wet: 0.5, room: 0.9 }), 0.02, 0.9));
  },

  // Gentle resolving D major chord under the final line.
  resolve: () => {
    const x = buffer(3.2);
    [146.83, 220, 293.66, 369.99, 440].forEach((f, k) => mixInto(x, piano(3, f, 0.8), k * 0.03, 1));
    return normalize(fade(reverb(x, { wet: 0.4, room: 0.9 }), 0.005, 1.4));
  },
};

mkdirSync(OUT_DIR, { recursive: true });
console.log(`Writing ${Object.keys(SOUNDS).length} sounds to ${OUT_DIR}`);
for (const [name, make] of Object.entries(SOUNDS)) writeWav(name, make());
