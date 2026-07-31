import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { navigation } from "@/data/navigation";
import { companyInfo } from "@/config/company";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark">
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {companyInfo.name} leverer fleksible og pålitelige
              transporttjenester for bedrifter på Østlandet, med fokus på
              punktlighet, kvalitet og langsiktige samarbeid.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
              Navigasjon
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 transition-colors hover:text-green"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
              Kontakt
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Phone aria-hidden className="h-4 w-4 shrink-0 text-green" />
                <a href={companyInfo.phoneHref} className="hover:text-green">
                  {companyInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Mail aria-hidden className="h-4 w-4 shrink-0 text-green" />
                <a href={`mailto:${companyInfo.email}`} className="hover:text-green">
                  {companyInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                {companyInfo.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {companyInfo.name}. Alle rettigheter reservert. Org.nr.{" "}
            {companyInfo.organizationNumber} · {companyInfo.domain}
          </p>
          <div className="flex gap-5">
            <Link href="/personvern" className="hover:text-green">
              Personvern
            </Link>
            <Link href="/informasjonskapsler" className="hover:text-green">
              Informasjonskapsler
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
