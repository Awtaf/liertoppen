import { Phone, Mail, Building2, MapPin, Clock } from "lucide-react";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { MotionWrapper } from "./MotionWrapper";
import { ContactForm } from "./ContactForm";
import { companyInfo } from "@/config/company";

const contactDetails = [
  { icon: Phone, label: "Telefon", value: companyInfo.phone, href: companyInfo.phoneHref },
  { icon: Mail, label: "E-post", value: companyInfo.email, href: `mailto:${companyInfo.email}` },
  { icon: Building2, label: "Organisasjonsnummer", value: companyInfo.organizationNumber },
  { icon: MapPin, label: "Adresse", value: companyInfo.address },
  { icon: Clock, label: "Åpningstider", value: companyInfo.openingHours },
];

export function ContactSection() {
  return (
    <section id="kontakt" aria-labelledby="kontakt-heading" className="bg-bg-light py-20 sm:py-28">
      <Container>
        <MotionWrapper>
          <SectionHeading
            id="kontakt-heading"
            eyebrow="Kontakt"
            title="La oss finne en løsning sammen"
            description="Har bedriften din behov for fast transport, ekstra kapasitet eller en langsiktig samarbeidspartner? Send oss en henvendelse, så tar vi kontakt for å diskutere behovet."
          />
        </MotionWrapper>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <MotionWrapper direction="left">
              <div className="rounded-2xl border border-border-light bg-white p-6 sm:p-8">
                <h3 className="text-base font-bold text-navy">
                  Kontaktinformasjon
                </h3>
                <dl className="mt-5 space-y-5">
                  {contactDetails.map((detail) => {
                    const Icon = detail.icon;
                    return (
                      <div key={detail.label} className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-light text-green">
                          <Icon aria-hidden className="h-4 w-4" />
                        </span>
                        <div>
                          <dt className="text-xs font-medium text-slate">
                            {detail.label}
                          </dt>
                          <dd className="text-sm font-semibold text-navy">
                            {detail.href ? (
                              <a href={detail.href} className="hover:text-green">
                                {detail.value}
                              </a>
                            ) : (
                              detail.value
                            )}
                          </dd>
                        </div>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </MotionWrapper>
          </div>

          <div className="lg:col-span-8">
            <MotionWrapper delay={0.1}>
              <ContactForm />
            </MotionWrapper>
          </div>
        </div>
      </Container>
    </section>
  );
}
