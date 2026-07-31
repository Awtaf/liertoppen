import { Check } from "lucide-react";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { MotionWrapper } from "./MotionWrapper";
import { Button } from "./Button";
import { collaborationOptions } from "@/data/stats";

export function Collaboration() {
  return (
    <section
      id="samarbeid"
      aria-labelledby="samarbeid-heading"
      className="relative overflow-hidden bg-navy py-20 sm:py-28"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(32,214,107,0.12),transparent_50%)]" />
        <svg className="absolute right-0 bottom-0 h-2/3 w-1/3 opacity-30" viewBox="0 0 200 200" fill="none">
          <path d="M200 200 L80 100 L200 0" stroke="#20D66B" strokeWidth="2" />
        </svg>
      </div>

      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <MotionWrapper direction="left">
              <SectionHeading
                id="samarbeid-heading"
                eyebrow="Nye samarbeid"
                title="Trenger dere mer transportkapasitet?"
                light
              />
            </MotionWrapper>
            <MotionWrapper direction="left" delay={0.1}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
                Vi er åpne for samarbeid med transportfirmaer, nettbutikker,
                restauranter, grossister, byggevareaktører, møbelforhandlere
                og andre virksomheter som trenger en fleksibel
                transportpartner.
              </p>
            </MotionWrapper>
            <MotionWrapper direction="left" delay={0.2} className="mt-8">
              <Button href="/#kontakt" size="lg">
                La oss diskutere et samarbeid
              </Button>
            </MotionWrapper>
          </div>

          <div className="lg:col-span-7">
            <MotionWrapper delay={0.1}>
              <p className="mb-4 text-sm font-semibold tracking-wide text-white/50 uppercase">
                Dette kan vi diskutere
              </p>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {collaborationOptions.map((option) => (
                  <li
                    key={option}
                    className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
                  >
                    <Check aria-hidden className="h-4 w-4 shrink-0 text-green" />
                    {option}
                  </li>
                ))}
              </ul>
            </MotionWrapper>
          </div>
        </div>
      </Container>
    </section>
  );
}
