import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "Telia Liertoppen – Ansatt",
      short_name: "Liertoppen",
      description: "Innsjekk, timer og oppgaver for ansatte på Telia Liertoppen.",
      start_url: "/ansatt",
      scope: "/ansatt/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#990AE3",
      lang: "nb",
      icons: [
        { src: "/ansatt/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/ansatt/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
