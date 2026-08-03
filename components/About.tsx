import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { MotionWrapper } from "./MotionWrapper";
import { values } from "@/data/values";

export function About() {
  return (
    <section id="om-oss" aria-labelledby="om-oss-heading" className="bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <MotionWrapper direction="left">
              <SectionHeading
                id="om-oss-heading"
                eyebrow="Om oss"
                title="Om Østfold Bud Service AS"
              />
            </MotionWrapper>
            <MotionWrapper direction="left" delay={0.1}>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-slate">
                <p>
                  Østfold Bud Service AS er etablert for å levere effektive
                  og pålitelige transporttjenester til bedrifter som trenger
                  en seriøs og fleksibel samarbeidspartner.
                </p>
                <p>
                  Vi utfører oppdrag som underleverandør for etablerte
                  aktører, samtidig som vi arbeider aktivt med å bygge
                  langsiktige samarbeid med nye kunder og logistikkpartnere.
                </p>
                <p>
                  Vi ønsker å vokse kontrollert, investere i flere kjøretøy
                  og bygge et stabilt team av profesjonelle sjåfører. Målet
                  vårt er ikke bare å transportere varer, men å gjøre
                  hverdagen enklere for kundene og samarbeidspartnerne våre.
                </p>
              </div>
            </MotionWrapper>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <MotionWrapper key={value.title} delay={index * 0.06}>
                    <div className="group h-full rounded-xl border border-border-light bg-bg-light p-6 transition-colors hover:border-green/40">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-green">
                        <Icon aria-hidden className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-base font-bold text-navy">
                        {value.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate">
                        {value.description}
                      </p>
                    </div>
                  </MotionWrapper>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
