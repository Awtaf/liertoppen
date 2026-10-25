import { sendEmail } from "@/lib/mailer";
import { companyInfo } from "@/config/company";
import { formatTrackingNumber } from "./tracking";
import type { ShipmentStatus } from "./shipment";

/** Varsler mottakeren av en sending på e-post — kun sendt hvis mottakeren
 * faktisk har en e-post registrert (valgfritt felt i begge bookingskjemaene).
 * Feiler aldri bookingen/statusoppdateringen: sendEmail svelger egne feil. */

function trackingUrl(trackingNumber: string): string {
  return `${companyInfo.url}/sporing/${trackingNumber}`;
}

export async function notifyReceiverBooked(params: {
  receiverEmail: string;
  senderName: string;
  trackingNumber: string;
}): Promise<void> {
  const tn = formatTrackingNumber(params.trackingNumber);
  await sendEmail({
    to: params.receiverEmail,
    subject: `${params.senderName} har sendt deg en pakke`,
    text: [
      "Hei!",
      "",
      `${params.senderName} har booket en sending til deg via Østfold Bud Service.`,
      "",
      `Sporingsnummer: ${tn}`,
      `Følg sendingen her: ${trackingUrl(params.trackingNumber)}`,
      "",
      "Vi gir deg beskjed når pakken er hentet, underveis og levert.",
      "",
      "Mvh Østfold Bud Service AS",
    ].join("\n"),
  });
}

const STATUS_TEMPLATES: Partial<Record<ShipmentStatus, { subject: string; intro: string }>> = {
  TILDELT: {
    subject: "Pakken din er tildelt en sjåfør",
    intro: "er nå tildelt en sjåfør og klar for henting.",
  },
  HENTET: {
    subject: "Pakken din er hentet",
    intro: "er hentet og på vei videre.",
  },
  UNDERVEIS: {
    subject: "Pakken din kommer snart!",
    intro: "er nå underveis til deg.",
  },
  LEVERT: {
    subject: "Pakken din er levert",
    intro: "er levert. Takk for at du brukte Østfold Bud Service!",
  },
};

export async function notifyReceiverStatusChange(params: {
  receiverEmail: string;
  senderName: string;
  trackingNumber: string;
  status: ShipmentStatus;
}): Promise<void> {
  const template = STATUS_TEMPLATES[params.status];
  if (!template) return;

  const tn = formatTrackingNumber(params.trackingNumber);
  const isDelivered = params.status === "LEVERT";

  const lines = [
    "Hei!",
    "",
    `Pakken din fra ${params.senderName} (sporingsnr ${tn}) ${template.intro}`,
    "",
  ];

  if (isDelivered) {
    lines.push(
      `Spørsmål om sendingen? Ta kontakt på ${companyInfo.phone}.`,
      "",
      "Ønsker du å bli kunde hos oss? Send en e-post til salg@ostfoldbud.no, så tar vi en prat.",
      ""
    );
  } else {
    lines.push(`Følg sendingen her: ${trackingUrl(params.trackingNumber)}`, "");
  }

  lines.push("Mvh Østfold Bud Service AS");

  await sendEmail({
    to: params.receiverEmail,
    subject: template.subject,
    text: lines.join("\n"),
  });
}
