# Østfold Bud Service AS — nettside

Nettsiden til Østfold Bud Service AS, bygget med Next.js (App Router),
TypeScript, Tailwind CSS og Framer Motion.

## Komme i gang

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

### Produksjonsbygg

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

Både `npm run lint` og `npm run build` kjører uten feil i dette prosjektet
per nå.

## Prosjektstruktur

```
app/                    Sider (App Router)
  layout.tsx            Rot-layout, metadata, JSON-LD
  page.tsx              Forsiden (setter sammen alle seksjoner)
  personvern/            /personvern
  informasjonskapsler/   /informasjonskapsler
  api/contact/route.ts   API-route for kontaktskjemaet
  sitemap.ts             Genererer sitemap.xml
  robots.ts              Genererer robots.txt
  icon.tsx                Genererer favicon (PLASSHOLDER, se under)
  apple-icon.tsx          Genererer apple touch icon (PLASSHOLDER)
  opengraph-image.tsx     Genererer Open Graph-bilde (PLASSHOLDER)

components/             Gjenbrukbare UI-komponenter
config/
  company.ts             All kontaktinformasjon og bedriftsdata — ETT sted å endre
  site.ts                 Metadata for hele siden (tittel, url, osv.)
data/                    Innhold for seksjoner (tjenester, bilpark, verdier, osv.)
lib/                     Delte hjelpefunksjoner (validering, klassenavn)
public/
  logos/                  Legg ekte logofiler her
  images/fleet/           Legg ekte bilbilder her
```

## Kontaktinformasjon — endre ett sted

All kontaktinformasjon (telefon, e-post, org.nr, adresse, åpningstider,
dekningsområde) hentes fra **`config/company.ts`**. Oppdater feltene der,
så oppdateres hele nettsiden automatisk (header, footer, kontaktseksjon,
strukturert data osv.):

```ts
export const companyInfo = {
  name: "Østfold Bud Service AS",
  shortName: "Østfold Bud Service",
  domain: "ostfoldbud.no",
  phone: "[TELEFONNUMMER]",
  phoneHref: "tel:+47XXXXXXXX",
  email: "post@ostfoldbud.no",
  organizationNumber: "[ORGANISASJONSNUMMER]",
  address: "[ADRESSE]",
  openingHours: "Etter avtale",
  serviceAreas: ["Østfold", "Oslo", "Akershus", "Buskerud"],
};
```

## Logo

**Dette prosjektet inneholder ikke de faktiske logofilene til Østfold Bud
Service AS.** De var ikke tilgjengelige da nettsiden ble bygget, så en
enkel, nøytral SVG-erstatning (navy firkant med grønn pilform) brukes i
stedet i `components/LogoIcon.tsx` og `components/Logo.tsx`.

Slik bytter du til den ekte logoen:

1. Legg logofilene i `public/logos/`, for eksempel:
   - `obs-logo@2x.png` (mørk tekst, for lyse bakgrunner)
   - `obs-logo-white-bg@2x.png` (lys tekst, for mørke bakgrunner)
   - `obs-icon-256.png` (kvadratisk ikon)
2. Oppdater `components/Logo.tsx` og `components/LogoIcon.tsx` til å
   rendre disse filene med `next/image` i stedet for SVG-erstatningen.
   Bruk riktig variant (`obs-logo@2x.png` på lyse bakgrunner,
   `obs-logo-white-bg@2x.png` på mørke bakgrunner) — se kommentarene i
   filene.
3. Erstatt `app/icon.tsx`, `app/apple-icon.tsx` og
   `app/opengraph-image.tsx` (som i dag genererer plassholdere
   programmatisk) med versjoner bygget fra det ekte ikonet, eller bytt dem
   ut med statiske filer (`app/icon.png`, `app/apple-icon.png`).

Ikke strekk, beskjær eller fargeendre den ekte logoen når den legges inn.

## Bilder av bilparken

Det finnes ingen ekte bilder av kjøretøyene i prosjektet. `components/Fleet.tsx`
viser derfor en stilisert illustrasjon (`components/VehiclePlaceholder.tsx`)
i stedet for foto.

Slik legger du inn ekte bilder:

1. Legg bildefiler i `public/images/fleet/`, f.eks.
   `maxus-e-deliver.jpg` og `mercedes-benz-sprinter.jpg`.
2. Sett `image`-feltet for riktig kjøretøy i `data/vehicles.ts` til
   filstien, f.eks. `/images/fleet/maxus-e-deliver.jpg`.

`Fleet.tsx` bruker automatisk `next/image` med det ekte bildet så snart
`image`-feltet er satt.

## Koble kontaktskjemaet til e-post

Kontaktskjemaet (`components/ContactForm.tsx`) sender data til
`app/api/contact/route.ts`, som validerer innsendingen og prøver å sende
den videre på e-post via SMTP (med [Nodemailer](https://nodemailer.com)) —
koden er allerede skrevet og klar i `app/api/contact/route.ts`. Den
trenger bare fire miljøvariabler for å bli aktiv:

```
SMTP_HOST=send.eksempel.no
SMTP_PORT=587
SMTP_USER=post@ostfoldbud.no
SMTP_PASSWORD=passordet_til_denne_e-postkontoen
```

Disse fire finner du i e-post-innstillingene hos e-postleverandøren
(f.eks. Webhuset) — se etter "SMTP" eller "utgående server" for
mailboksen `post@ostfoldbud.no`.

**Så lenge disse fire ikke er satt**, sender ikke API-routen noe selv.
Kontaktskjemaet faller da automatisk tilbake til å åpne den besøkendes
eget e-postprogram med meldingen ferdig utfylt (en `mailto:`-lenke, se
`buildContactMailto` i `lib/contact.ts`) — de må selv trykke Send. Så
snart alle fire miljøvariabler er satt (i `.env.local` lokalt, og i
Vercel for den live siden), sender skjemaet automatisk uten at noen
trenger å gjøre noe mer.

Foretrekker du en tjeneste som [Resend](https://resend.com) eller
SendGrid i stedet for SMTP? Bytt ut `getTransporter`/`sendMail`-kallet i
`app/api/contact/route.ts` med deres SDK — samme prinsipp, bare en annen
sendemetode.

### Miljøvariabler

Opprett en `.env.local`-fil i prosjektroten (den er allerede lagt til i
`.gitignore` og skal aldri commit'es) med de fire SMTP-variablene over.

## Publisere på Vercel

1. Push prosjektet til et GitHub/GitLab/Bitbucket-repo.
2. Gå til [vercel.com/new](https://vercel.com/new) og importer repoet.
   Next.js-prosjekter gjenkjennes automatisk — ingen spesiell
   konfigurasjon er nødvendig.
3. Legg inn miljøvariablene (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
   `SMTP_PASSWORD`) under prosjektets **Settings → Environment
   Variables**.
4. Koble domenet `ostfoldbud.no` til Vercel-prosjektet under
   **Settings → Domains**.
5. Deploy.

## Sjekkliste før lansering

- [ ] Legg inn riktig telefonnummer i `config/company.ts`
- [ ] Legg inn riktig e-postadresse i `config/company.ts`
- [ ] Bekreft at `post@ostfoldbud.no` er riktig e-postadresse (eller bytt den)
- [ ] Legg inn organisasjonsnummer i `config/company.ts`
- [ ] Legg inn selskapets adresse i `config/company.ts`
- [ ] Last opp ekte bilder av Maxus e-Deliver (`public/images/fleet/`)
- [ ] Last opp ekte bilder av Mercedes-Benz Sprinter (`public/images/fleet/`)
- [ ] Legg inn de ekte logofilene og bytt ut plassholder-logoen (se over)
- [ ] Få personvernteksten (`/personvern`) kontrollert juridisk
- [ ] Hent SMTP-innstillinger for `post@ostfoldbud.no` fra e-postleverandøren
- [ ] Legg inn `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` i `.env.local` og i Vercel
- [ ] Kontroller favicon/Open Graph-bilde når ekte logo er på plass
- [ ] Kontroller at domenet ostfoldbud.no peker til prosjektet
- [ ] Test nettsiden på mobil, nettbrett og PC
- [ ] Test kontaktskjemaet (validering, feilmeldinger og innsending)
- [ ] Kjør `npm run lint`
- [ ] Kjør `npm run build`

## Teknologi

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) — diskrete scroll-animasjoner
- [Lucide](https://lucide.dev/) — ikoner
