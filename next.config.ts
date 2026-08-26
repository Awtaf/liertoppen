import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Ensures updates to the ansatt PWA service worker propagate
        // promptly instead of getting stuck behind a cached copy.
        source: "/ansatt-sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
