import { ArrowRight } from "lucide-react";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { MotionWrapper } from "./MotionWrapper";
import { Button } from "./Button";
import { services } from "@/data/services";

export function Services() {
  return (
    <section
      id="tjenester"
      aria-labelledby="tjenester-heading"
      className="bg-bg-light py-20 sm:py-28"
    >
      <Container>
        <MotionWrapper>
          <SectionHeading
            id="tjenester-heading"
            eyebrow="Tjenester"
            title="Transporttjenester tilpasset behovet ditt"
            description="Fra faste ruter til enkeltoppdrag – vi tilpasser leveransen til virksomheten din."
          />
        </MotionWrapper>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <MotionWrapper key={service.title} delay={index * 0.05}>
                <div className="group relative flex h-full flex-col rounded-xl border border-border-light bg-white p-6 shadow-sm shadow-navy/[0.03] transition-all duration-200 hover:-translate-y-1 hover:border-green/40 hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/5 text-green transition-colors group-hover:bg-navy group-hover:text-green">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-navy">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                    {service.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                    Les mer
                    <ArrowRight aria-hidden className="h-4 w-4 text-green" />
                  </span>
                </div>
              </MotionWrapper>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center">
          <Button href="/#kontakt" size="lg">
            Snakk med oss om ditt transportbehov
          </Button>
        </div>
      </Container>
    </section>
  );
}
