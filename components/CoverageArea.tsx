import { MapPin } from "lucide-react";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { MotionWrapper } from "./MotionWrapper";
import { companyInfo } from "@/config/company";

export function CoverageArea() {
  return (
    <section aria-labelledby="omrade-heading" className="bg-bg-light py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <MotionWrapper direction="left">
              <SectionHeading
                id="omrade-heading"
                eyebrow="Dekningsområde"
                title="Vi tar oppdrag på Østlandet og videre"
                description={`Vi har base i ${companyInfo.postalArea} og kan håndtere transportoppdrag i blant annet ${companyInfo.serviceAreas.join(", ")} og andre områder etter avtale.`}
              />
            </MotionWrapper>
          </div>

          <div className="lg:col-span-6">
            <MotionWrapper delay={0.1}>
              {/* Stylized, map-inspired graphic — not a real map integration */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border-light bg-white p-6">
                <svg
                  aria-hidden
                  viewBox="0 0 400 300"
                  className="absolute inset-0 h-full w-full opacity-[0.35]"
                >
                  <g stroke="#5E6D82" strokeWidth="0.5" opacity="0.4">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="300" />
                    ))}
                    {Array.from({ length: 7 }).map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} />
                    ))}
                  </g>
                </svg>

                <div className="relative flex h-full flex-col justify-between">
                  <ul className="space-y-3">
                    {companyInfo.serviceAreas.map((area, index) => (
                      <li
                        key={area}
                        className="flex items-center gap-2.5"
                        style={{ marginLeft: `${index * 18}px` }}
                      >
                        <span className="relative flex h-3 w-3 items-center justify-center">
                          <span className="absolute h-3 w-3 animate-ping rounded-full bg-green/40 motion-reduce:animate-none" />
                          <span className="relative h-1.5 w-1.5 rounded-full bg-green" />
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                          <MapPin aria-hidden className="h-3.5 w-3.5 text-slate" />
                          {area}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate">
                    Oppdrag utenfor disse områdene vurderes etter avtale.
                  </p>
                </div>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </Container>
    </section>
  );
}
