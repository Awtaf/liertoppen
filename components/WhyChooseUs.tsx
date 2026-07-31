import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { MotionWrapper } from "./MotionWrapper";
import { whyChooseUs } from "@/data/whyChooseUs";

export function WhyChooseUs() {
  return (
    <section aria-labelledby="hvorfor-heading" className="bg-white py-20 sm:py-28">
      <Container>
        <MotionWrapper>
          <SectionHeading
            id="hvorfor-heading"
            eyebrow="Hvorfor velge oss"
            title="Grunner til å samarbeide med oss"
            align="center"
          />
        </MotionWrapper>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <MotionWrapper key={reason.title} delay={index * 0.05}>
                <div className="flex h-full items-start gap-4 rounded-xl border border-border-light p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-bg-light text-green">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-navy">
                      {reason.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
