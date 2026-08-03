import { Container } from "./Container";
import { MotionWrapper } from "./MotionWrapper";
import { stats } from "@/data/stats";

export function Stats() {
  return (
    <section aria-label="Nøkkeltall" className="bg-bg-light py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <MotionWrapper key={stat.label} delay={index * 0.05}>
                <div className="flex h-full flex-col items-start gap-3 rounded-xl border border-border-light bg-white p-5 shadow-sm shadow-navy/[0.03]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-green">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <p className="text-sm leading-snug font-semibold text-navy">
                    {stat.label}
                  </p>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
