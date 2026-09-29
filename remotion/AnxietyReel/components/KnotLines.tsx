import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { CLAMP } from "../utils";

export type KnotLinesProps = {
  // Frames at which the knot starts and finishes untangling.
  loosenStart: number;
  loosenEnd: number;
  // After untangling, the straight lines fade away by this frame.
  fadeEnd: number;
  centerY?: number;
  lineCount?: number;
};

const SAMPLES = 110;

// A knot of tangled lines that slowly loosens into calm parallel lines,
// then disappears — a problem you stop trying to solve in your head.
export const KnotLines: React.FC<KnotLinesProps> = ({
  loosenStart,
  loosenEnd,
  fadeEnd,
  centerY = 860,
  lineCount = 7,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // tangle: 1 = knotted, 0 = straight
  const tangle = 1 - interpolate(frame, [loosenStart, loosenEnd], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  const drawIn = interpolate(frame, [0, 22], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const fade = interpolate(frame, [loosenEnd, fadeEnd], [1, 0], CLAMP);
  const color = interpolateColors(tangle, [0, 1], [COLORS.calm, "#c9c2d6"]);
  const motion = frame * tangle; // the knot writhes only while it is tangled

  const paths = Array.from({ length: lineCount }, (_, i) => {
    const r = (k: string) => random(`knot-${i}-${k}`);
    const fx = 1.2 + r("fx") * 1.8;
    const fy = 0.9 + r("fy") * 1.7;
    const px = r("px") * Math.PI * 2;
    const py = r("py") * Math.PI * 2;
    const offset = (i - (lineCount - 1) / 2) * 30;
    let d = "";
    for (let s = 0; s <= SAMPLES; s++) {
      const t = s / SAMPLES;
      const envelope = Math.sin(Math.PI * t);
      const x = 150 + t * 780 + tangle * 180 * envelope * Math.sin(2 * Math.PI * t * fx + px + motion * 0.03);
      const y = centerY + (1 - tangle) * offset + tangle * 250 * envelope * Math.sin(2 * Math.PI * t * fy + py + motion * 0.025);
      d += `${s === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d;
  });

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={width} height={height}>
        <g style={{ filter: "blur(8px)" }} opacity={0.5}>
          {paths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={color} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawIn} />
          ))}
        </g>
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeOpacity={0.85}
            strokeWidth={interpolate(tangle, [0, 1], [2, 3])}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - drawIn}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
