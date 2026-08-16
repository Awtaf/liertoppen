import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { companyInfo } from "@/config/company";

export const metadata: Metadata = {
  title: "Personvern",
  description:
    "Informasjon om hvordan Østfold Bud Service AS behandler personopplysninger fra kontaktskjemaet.",
  alternates: {
    canonical: "/personvern",
  },
};

/**
 * LEGAL NOTICE FOR DEVELOPERS: The text on this page is a good-faith,
 * plain-language description written for this project and is NOT legal
 * advice. It must be reviewed and approved by someone with legal
 * competence (e.g. relevant to the Norwegian Personal Data Act /
 * personopplysningsloven and GDPR) before the site is published.
 */
export default function PersonvernPage() {
  return (
    <div className="bg-white py-24 sm:py-28">
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-green uppercase">
          Personvern
        </p>
        <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          Personvernerklæring
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate">
          Denne siden forklarer hvordan {companyInfo.name} behandler
          personopplysninger som samles inn gjennom kontaktskjemaet på{" "}
          {companyInfo.domain}. Teksten er ikke juridisk rådgivning og må
          kontrolleres juridisk før publisering.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate">
          <section>
            <h2 className="text-lg font-bold text-navy">
              Hvilke opplysninger samler vi inn?
            </h2>
            <p className="mt-2">
              Vi samler kun inn opplysninger du selv oppgir gjennom
              kontaktskjemaet på nettsiden, som navn, bedrift,
              telefonnummer, e-postadresse, type oppdrag, område, ønsket
              oppstart og innholdet i meldingen din.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">
              Hvorfor behandler vi opplysningene?
            </h2>
            <p className="mt-2">
              Opplysningene behandles utelukkende for å kunne besvare
              henvendelsen din og vurdere et eventuelt samarbeid. Vi bruker
              ikke opplysningene til andre formål.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">
              Hvor lenge lagres opplysningene?
            </h2>
            <p className="mt-2">
              Opplysninger fra kontaktskjemaet lagres normalt så lenge det
              er nødvendig for å følge opp henvendelsen og et eventuelt
              samarbeid, og slettes deretter innen rimelig tid.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">
              Deler eller selger vi opplysninger?
            </h2>
            <p className="mt-2">
              Vi selger aldri personopplysninger til tredjeparter.
              Opplysninger deles kun i den grad det er nødvendig for å
              besvare henvendelsen din, for eksempel med en e-posttjeneste
              som brukes til å motta henvendelser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">
              Dine rettigheter
            </h2>
            <p className="mt-2">
              Du kan når som helst be om innsyn i hvilke opplysninger vi har
              lagret om deg, be om at opplysningene rettes dersom de er
              feil, eller be om at de slettes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">Kontakt oss</h2>
            <p className="mt-2">
              Har du spørsmål om personvern, eller ønsker du innsyn,
              retting eller sletting av dine opplysninger, kan du kontakte
              oss på{" "}
              <a href={`mailto:${companyInfo.email}`} className="font-semibold text-green">
                {companyInfo.email}
              </a>{" "}
              eller{" "}
              <a href={companyInfo.phoneHref} className="font-semibold text-green">
                {companyInfo.phone}
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
