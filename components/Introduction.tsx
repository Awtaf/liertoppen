import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { MotionWrapper } from "./MotionWrapper";

export function Introduction() {
  return (
    <section aria-label="Kort introduksjon" className="bg-white py-20 sm:py-28">
      <Container>
        <MotionWrapper>
          <SectionHeading
            eyebrow="Om samarbeidet"
            title="En transportpartner du kan stole på"
            align="center"
          />
        </MotionWrapper>
        <MotionWrapper delay={0.1}>
          <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-base leading-relaxed text-slate sm:text-lg">
            <p>
              Østfold Bud Service AS er et transport- og logistikkfirma med
              fokus på kvalitet, fleksibilitet og langsiktige samarbeid. Vi
              hjelper bedrifter med faste leveranser, distribusjon og
              transportoppdrag som krever rask tilpasning.
            </p>
            <p>
              Vi er opptatt av at varer skal komme trygt frem, til avtalt tid
              og med profesjonell oppfølging underveis. Selskapet er i vekst,
              og bilparken vår skal utvikles i takt med nye oppdrag og
              samarbeid.
            </p>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
