import { ImageResponse } from "next/og";

/**
 * PLACEHOLDER APPLE TOUCH ICON — see app/icon.tsx for context. Replace
 * with a static `app/apple-icon.png` built from the real icon file once
 * it is available.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg width="112" height="112" viewBox="0 0 64 64">
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
