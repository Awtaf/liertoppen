import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#990AE3",
        }}
      >
        <svg width="320" height="320" viewBox="0 0 64 64">
          <path
            d="M14 34 L26 46 L50 18"
            stroke="#FFFFFF"
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
