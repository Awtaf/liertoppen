import { ImageResponse } from "next/og";
import { companyInfo } from "@/config/company";

/**
 * PLACEHOLDER OPEN GRAPH IMAGE — built programmatically from the same
 * placeholder mark as LogoIcon.tsx, since no real logo files exist in
 * this project yet. Replace with a designed image built from the real
 * logo once it is available (keep the 1200x630 size).
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#152239",
          padding: "80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "45%",
            height: "100%",
            display: "flex",
            background:
              "radial-gradient(circle at 80% 50%, rgba(32,214,107,0.25), transparent 60%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              background: "#0D1626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="46" height="46" viewBox="0 0 64 64">
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 700, color: "#FFFFFF" }}>
              {companyInfo.shortName}
            </span>
            <span style={{ fontSize: 18, color: "#20D66B", letterSpacing: 2 }}>
              TRANSPORT &amp; DISTRIBUSJON
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 56,
            fontWeight: 800,
            color: "#FFFFFF",
            maxWidth: 820,
            lineHeight: 1.15,
          }}
        >
          Fleksibel transport for bedrifter
        </div>
      </div>
    ),
    { ...size }
  );
}
