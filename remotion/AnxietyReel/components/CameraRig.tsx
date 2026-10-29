import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";

export type CameraRigProps = {
  children: React.ReactNode;
  // 0 = locked off, 1 = strong handheld panic.
  shake?: number;
  // Slow, large-scale floating drift (0–1).
  drift?: number;
  zoom?: number;
  // Heartbeat pulse (0–1) from timing.heartbeatAt.
  pulse?: number;
  seed?: string;
};

// A virtual camera: noise-based shake and drift, zoom, and a heartbeat push.
export const CameraRig: React.FC<CameraRigProps> = ({
  children,
  shake = 0,
  drift = 0,
  zoom = 1,
  pulse = 0,
  seed = "camera",
}) => {
  const frame = useCurrentFrame();
  const shakeX = noise2D(`${seed}-sx`, frame * 0.45, 0) * shake * 26;
  const shakeY = noise2D(`${seed}-sy`, 0, frame * 0.45) * shake * 26;
  const shakeR = noise2D(`${seed}-sr`, frame * 0.2, frame * 0.2) * shake * 0.9;
  const driftX = noise2D(`${seed}-dx`, frame * 0.008, 0) * drift * 34;
  const driftY = noise2D(`${seed}-dy`, 0, frame * 0.008) * drift * 34;
  const scale = zoom * (1 + pulse * 0.018);

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shakeX + driftX}px, ${shakeY + driftY}px) rotate(${shakeR}deg) scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
