import { Button } from "./Button";
import { Container } from "./Container";
import { trustIndicators } from "@/data/stats";

export function Hero() {
  return (
    <section
      id="forside"
      aria-label="Introduksjon"
      className="relative isolate overflow-hidden bg-navy pt-36 pb-24 sm:pt-44 sm:pb-32"
    >
      {/* Decorative graphic elements inspired by the arrow motif in the logo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(32,214,107,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.06),transparent_45%)]" />
        <svg
          className="absolute inset-y-0 right-0 h-full w-1/2 min-w-[420px] opacity-[0.35] sm:opacity-60"
          viewBox="0 0 500 800"
          fill="none"
        >
          <path
            d="M120 60 L280 400 L120 740"
            stroke="url(#heroArrow1)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M220 20 L420 400 L220 780"
            stroke="url(#heroArrow2)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M330 100 L470 400 L330 700"
            stroke="#20D66B"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="heroArrow1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#20D66B" stopOpacity="0" />
              <stop offset="1" stopColor="#20D66B" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="heroArrow2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.25" />
            </linearGradient>
          </defs>
        </svg>
        {/* Horizontal movement lines */}
        <div className="absolute top-1/3 left-0 h-px w-2/5 bg-gradient-to-r from-transparent via-green/40 to-transparent" />
        <div className="absolute top-1/2 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <Container>
        <div className="max-w-2xl animate-slide-in">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-green uppercase">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
            Pålitelig transport. Levert.
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Vi holder leveransene dine i bevegelse
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Østfold Bud Service AS leverer fleksible og pålitelige
            transporttjenester for bedrifter. Vi håndterer faste
            distribusjonsoppdrag, budleveranser, last mile-levering og
            skreddersydde transportbehov.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href="/tilbud" size="lg">
              Få prisestimat på 1 minutt
            </Button>
            <Button href="/#kontakt" variant="secondary" size="lg">
              Diskuter et samarbeid
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {trustIndicators.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-white/70"
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
