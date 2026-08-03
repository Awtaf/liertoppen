import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { MotionWrapper } from "./MotionWrapper";
import { partners } from "@/config/company";

export function Partners() {
  return (
    <section aria-labelledby="samarbeidspartnere-heading" className="bg-bg-light py-20 sm:py-28">
      <Container>
        <MotionWrapper>
          <SectionHeading
            id="samarbeidspartnere-heading"
            eyebrow="Erfaring"
            title="Erfaring fra etablerte leveringsnettverk"
            description="Østfold Bud Service AS utfører oppdrag som underleverandør i samarbeid med etablerte aktører innen levering og logistikk."
          />
        </MotionWrapper>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {partners.map((partner, index) => (
            <MotionWrapper key={partner.name} delay={index * 0.08}>
              <div className="flex h-full flex-col justify-center rounded-xl border border-border-light bg-white p-8">
                <p className="text-2xl font-bold text-navy">{partner.name}</p>
                <p className="mt-2 text-sm text-slate">{partner.description}</p>
                <p className="mt-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-navy uppercase">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
                  Underleverandøroppdrag
                </p>
              </div>
            </MotionWrapper>
          ))}
        </div>

        <MotionWrapper delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-slate">
            Erfaringen fra disse oppdragene har gitt oss verdifull innsikt i
            punktlig distribusjon, kundebehandling, ruteplanlegging og
            leveranser med høye krav til kvalitet.
          </p>
        </MotionWrapper>
      </Container>
    </section>
  );
}
