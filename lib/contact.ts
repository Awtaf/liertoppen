export type JobType =
  | "Fast distribusjon"
  | "Bud- eller ekspressoppdrag"
  | "Last mile-levering"
  | "Underleverandøravtale"
  | "Transport med bil og sjåfør"
  | "Annet";

export const jobTypeOptions: JobType[] = [
  "Fast distribusjon",
  "Bud- eller ekspressoppdrag",
  "Last mile-levering",
  "Underleverandøravtale",
  "Transport med bil og sjåfør",
  "Annet",
];

export type ContactFormData = {
  name: string;
  company: string;
  phone: string;
  email: string;
  jobType: string;
  area: string;
  desiredStart: string;
  message: string;
  consent: boolean;
  /** Honeypot field — must stay empty. Bots tend to fill every field. */
  website: string;
};

export type ContactFormErrors = Partial<
  Record<keyof Omit<ContactFormData, "website">, string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(
  data: ContactFormData
): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = "Skriv inn fullt navn.";
  }

  if (!data.email.trim()) {
    errors.email = "E-post er påkrevd.";
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Skriv inn en gyldig e-postadresse.";
  }

  if (!data.jobType.trim()) {
    errors.jobType = "Velg type oppdrag.";
  }

  if (!data.message.trim() || data.message.trim().length < 10) {
    errors.message = "Skriv en kort beskrivelse av behovet (minst 10 tegn).";
  }

  if (!data.consent) {
    errors.consent = "Du må samtykke til å bli kontaktet.";
  }

  return errors;
}

export function hasErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildContactSubject(data: ContactFormData): string {
  return data.company
    ? `Ny henvendelse fra ${data.name} (${data.company})`
    : `Ny henvendelse fra ${data.name}`;
}

export function buildContactMessageLines(data: ContactFormData): string[] {
  return [
    `Navn: ${data.name}`,
    data.company && `Bedrift: ${data.company}`,
    data.phone && `Telefonnummer: ${data.phone}`,
    `E-post: ${data.email}`,
    `Type oppdrag: ${data.jobType}`,
    data.area && `Område: ${data.area}`,
    data.desiredStart && `Ønsket oppstart: ${data.desiredStart}`,
    "",
    "Melding:",
    data.message,
  ].filter((line): line is string => Boolean(line));
}

export function buildContactMailto(
  toEmail: string,
  data: ContactFormData
): string {
  const subject = buildContactSubject(data);
  const body = buildContactMessageLines(data).join("\n");
  return `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const initialContactFormData: ContactFormData = {
  name: "",
  company: "",
  phone: "",
  email: "",
  jobType: "",
  area: "",
  desiredStart: "",
  message: "",
  consent: false,
  website: "",
};
