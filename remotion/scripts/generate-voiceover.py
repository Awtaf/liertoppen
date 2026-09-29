#!/usr/bin/env python3
"""Generates the Arabic (Syrian) voiceover for AnxietyReel, one file per line.

    pip install edge-tts
    npm run remotion:voiceover

Uses Microsoft's neural voices through the free Edge "Read aloud" service
(no API key). Text, voice and speaking rate per line: remotion/AnxietyReel/voiceover.json.

Outputs:
  remotion/public/audio/vo/<id>.wav        silence-trimmed line, 48 kHz mono
  remotion/AnxietyReel/voiceover-manifest.json   length of each line in frames

timing.ts builds the whole video timeline from the manifest, so after changing
a line just re-run this script and re-render: captions stay in sync.
"""

import array
import asyncio
import json
import math
import os
import ssl
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import edge_tts
import edge_tts.communicate

ROOT = Path(__file__).resolve().parents[2]
CONFIG = ROOT / "remotion" / "AnxietyReel" / "voiceover.json"
MANIFEST = ROOT / "remotion" / "AnxietyReel" / "voiceover-manifest.json"
OUT_DIR = ROOT / "remotion" / "public" / "audio" / "vo"

FPS = 30
SR = 48000
THRESHOLD_DB = -45  # anything quieter counts as silence
PRE_ROLL = 0.03  # seconds kept before the first syllable
POST_ROLL = 0.08  # seconds kept after the last syllable
FADE = 0.01

# Behind a TLS-inspecting proxy, trust the CA bundle from the environment
# (edge-tts pins certifi's bundle otherwise).
if os.environ.get("SSL_CERT_FILE"):
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ["SSL_CERT_FILE"])


def decode(mp3: Path) -> array.array:
    """Decodes to 48 kHz mono 16-bit samples with Remotion's bundled ffmpeg."""
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "line.wav"
        subprocess.run(
            ["npx", "remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3),
             "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", str(wav)],
            check=True, cwd=ROOT,
        )
        with wave.open(str(wav)) as w:
            samples = array.array("h")
            samples.frombytes(w.readframes(w.getnframes()))
            return samples


def trim(samples: array.array) -> array.array:
    win = SR // 100
    loud = []
    for start in range(0, len(samples), win):
        chunk = samples[start:start + win]
        rms = math.sqrt(sum(v * v for v in chunk) / max(1, len(chunk))) / 32768
        loud.append(20 * math.log10(rms + 1e-9) > THRESHOLD_DB)
    first = loud.index(True)
    last = len(loud) - 1 - loud[::-1].index(True)
    a = max(0, first * win - int(PRE_ROLL * SR))
    b = min(len(samples), (last + 1) * win + int(POST_ROLL * SR))
    out = samples[a:b]
    n = int(FADE * SR)
    for i in range(n):
        out[i] = int(out[i] * i / n)
        out[-1 - i] = int(out[-1 - i] * i / n)
    return out


def write(path: Path, samples: array.array) -> None:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(samples.tobytes())


async def main() -> None:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {}
    with tempfile.TemporaryDirectory() as tmp:
        for line in config["lines"]:
            mp3 = Path(tmp) / f"{line['id']}.mp3"
            await edge_tts.Communicate(
                line["text"], config["voice"], rate=line.get("rate", "+0%"), pitch=config.get("pitch", "+0Hz")
            ).save(str(mp3))
            samples = trim(decode(mp3))
            write(OUT_DIR / f"{line['id']}.wav", samples)
            frames = math.ceil(len(samples) / SR * FPS)
            manifest[line["id"]] = frames
            print(f"  {line['id']:<12} {len(samples) / SR:5.2f}s  {frames:3d} frames  {line['text']}")
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Total speech: {sum(manifest.values()) / FPS:.2f}s  →  {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
