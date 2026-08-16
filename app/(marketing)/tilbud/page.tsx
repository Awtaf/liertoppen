import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Få tilbud",
  description:
    "Få et veiledende pristilbud på transportoppdraget ditt hos Østfold Bud Service AS på under ett minutt.",
  alternates: {
    canonical: "/tilbud",
  },
};

export default function TilbudPage() {
  return (
    <div className="bg-bg-light py-24 sm:py-28">
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-navy uppercase">
          <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-green align-middle" />
          Få tilbud
        </p>
        <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          Hva koster transporten din?
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate">
          Fyll inn detaljene under for et veiledende estimat på under ett
          minutt. Estimatet er ikke bindende — vi bekrefter alltid pris og
          henting direkte med deg.
        </p>

        <div className="mt-10">
          <QuoteForm />
        </div>
      </Container>
    </div>
  );
}
