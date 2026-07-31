import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { companyInfo } from "@/config/company";

export const metadata: Metadata = {
  title: "Informasjonskapsler",
  description:
    "Informasjon om bruk av informasjonskapsler (cookies) på Østfold Bud Service AS sin nettside.",
  alternates: {
    canonical: "/informasjonskapsler",
  },
};

export default function InformasjonskapslerPage() {
  return (
    <div className="bg-white py-24 sm:py-28">
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-green uppercase">
          Informasjonskapsler
        </p>
        <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          Bruk av informasjonskapsler
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate">
          <p>
            {companyInfo.domain} bruker i dag kun informasjonskapsler
            (cookies) som er strengt nødvendige for at nettsiden skal
            fungere som den skal. Vi bruker ikke informasjonskapsler til
            analyse, markedsføring eller sporing på tvers av nettsider.
          </p>

          <section>
            <h2 className="text-lg font-bold text-navy">
              Nødvendige informasjonskapsler
            </h2>
            <p className="mt-2">
              Disse informasjonskapslene er nødvendige for grunnleggende
              funksjonalitet, som å huske innstillinger under besøket ditt.
              De kan ikke skrus av, og krever ikke samtykke etter
              gjeldende regelverk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">
              Analyse og markedsføring
            </h2>
            <p className="mt-2">
              Nettsiden bruker per i dag ikke analyseverktøy som Google
              Analytics eller markedsføringsverktøy som Meta Pixel. Dersom
              dette tas i bruk i fremtiden, vil det legges til et
              samtykkebasert cookie-banner slik at besøkende kan velge
              hvilke informasjonskapsler som godtas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">Kontakt</h2>
            <p className="mt-2">
              Har du spørsmål om informasjonskapsler, kan du kontakte oss
              på{" "}
              <a
                href={`mailto:${companyInfo.email}`}
                className="font-semibold text-green"
              >
                {companyInfo.email}
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
