import { Clock, ShieldCheck, Zap } from "lucide-react";
import { Button } from "./Button";
import { Container } from "./Container";
import { MotionWrapper } from "./MotionWrapper";

const points = [
  { icon: Clock, label: "Tar under 1 minutt" },
  { icon: ShieldCheck, label: "Ingen forpliktelser" },
  { icon: Zap, label: "Pris med det samme" },
];

export function QuoteCTA() {
  return (
    <section aria-label="Få prisestimat" className="bg-white pt-14 sm:pt-20">
      <Container>
        <MotionWrapper>
          <div className="relative isolate overflow-hidden rounded-2xl bg-navy px-6 py-10 sm:px-12 sm:py-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(32,214,107,0.18),transparent_55%)]" />
            </div>

            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-green uppercase">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
                  Få pris med en gang
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Få et prisestimat på under 1 minutt
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  Fyll inn hentested, leveringssted og litt om godset, så gir
                  vi deg pris umiddelbart — helt uforpliktende.
                </p>

                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5">
                  {points.map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex items-center gap-2 text-sm font-medium text-white/70"
                    >
                      <Icon aria-hidden className="h-4 w-4 text-green" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <Button href="/tilbud" size="lg" className="w-full shrink-0 sm:w-auto">
                Få prisestimat nå
              </Button>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
