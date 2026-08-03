import Image from "next/image";
import { Check, PackagePlus } from "lucide-react";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { MotionWrapper } from "./MotionWrapper";
import { VehiclePlaceholder } from "./VehiclePlaceholder";
import { vehicles } from "@/data/vehicles";

export function Fleet() {
  return (
    <section
      id="bilparken"
      aria-labelledby="bilparken-heading"
      className="bg-white py-20 sm:py-28"
    >
      <Container>
        <MotionWrapper>
          <SectionHeading
            id="bilparken-heading"
            eyebrow="Bilparken"
            title="En bilpark bygget for effektive leveranser"
            description="Vi bygger en moderne og fleksibel bilpark som kan håndtere ulike typer transportoppdrag. I takt med at selskapet vokser, skal flere kjøretøy legges til."
          />
        </MotionWrapper>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {vehicles.map((vehicle, index) => (
            <MotionWrapper key={vehicle.slug} delay={index * 0.1}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border-light shadow-sm shadow-navy/[0.04]">
                <div className="relative aspect-[16/9] w-full bg-navy-dark">
                  {vehicle.image ? (
                    <Image
                      src={vehicle.image}
                      alt={`${vehicle.name} – ${vehicle.type}`}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <VehiclePlaceholder className="h-full w-full" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-navy uppercase">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
                    {vehicle.type}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-navy">
                    {vehicle.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    {vehicle.description}
                  </p>
                  <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {vehicle.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2 text-sm text-navy"
                      >
                        <Check
                          aria-hidden
                          className="mt-0.5 h-4 w-4 shrink-0 text-green"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </MotionWrapper>
          ))}
        </div>

        <MotionWrapper delay={0.15} className="mt-8">
          <div className="relative overflow-hidden rounded-2xl bg-navy px-8 py-10 sm:px-12">
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/3 opacity-30"
              viewBox="0 0 200 200"
              fill="none"
            >
              <path d="M0 0 L120 100 L0 200" stroke="#20D66B" strokeWidth="2" />
              <path d="M50 0 L170 100 L50 200" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="2" />
            </svg>
            <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-green">
                  <PackagePlus aria-hidden className="h-5 w-5" />
                  <h3 className="text-lg font-bold text-white">
                    Bilparken vokser
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Vi investerer i flere kjøretøy etter hvert som vi inngår
                  nye transportavtaler. Dette gjør at vi kan øke kapasiteten
                  og tilpasse bilparken til behovene til kundene og
                  samarbeidspartnerne våre.
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-green">
                Flere biler kommer snart
              </p>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
