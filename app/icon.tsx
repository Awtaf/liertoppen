import { ImageResponse } from "next/og";

/**
 * PLACEHOLDER FAVICON — generated from the same arrow mark as LogoIcon.tsx
 * since no real icon file (e.g. obs-icon-256.png) exists in this project
 * yet. Replace this file with a static `app/icon.png` built from the real
 * square icon once it is available.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#152239",
          borderRadius: 6,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 64 64">
          <path
            d="M14 20 L30 32 L14 44"
            stroke="#FFFFFF"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M30 20 L46 32 L30 44"
            stroke="#20D66B"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
