import { sendAdminNotification } from "@/lib/mailer";
import { companyInfo } from "@/config/company";
import { SERVICE_LABELS } from "./shipment";
import type { ServiceKey } from "./pricing";
import { formatTrackingNumber } from "./tracking";

/** Varsler sjåføren (companyInfo.driverEmail) om en ny sending på ruten —
 * uavhengig av om den ble booket av admin eller av en kunde i portalen.
 * Feiler aldri bookingen: sendAdminNotification svelger egne feil. */
export async function notifyDriverOfNewShipment(params: {
  shipmentId: string;
  trackingNumber: string;
  serviceKey: ServiceKey;
  senderName: string;
  senderAddr: string;
  senderZip: string;
  senderCity: string;
  receiverName: string;
  receiverAddr: string;
  receiverZip: string;
  receiverCity: string;
  reference?: string | null;
  requestedDelivery?: string | null;
  notes?: string | null;
}): Promise<void> {
  await sendAdminNotification({
    to: companyInfo.driverEmail,
    subject: `Ny sending på ruten — ${params.receiverCity}`,
    text: [
      `Sporingsnr: ${formatTrackingNumber(params.trackingNumber)}`,
      `Tjeneste: ${SERVICE_LABELS[params.serviceKey]}`,
      "",
      `Hent hos: ${params.senderName}`,
      `${params.senderAddr}, ${params.senderZip} ${params.senderCity}`,
      "",
      `Lever hos: ${params.receiverName}`,
      `${params.receiverAddr}, ${params.receiverZip} ${params.receiverCity}`,
      ...(params.requestedDelivery ? [`Ønsket levering: ${params.requestedDelivery}`] : []),
      ...(params.reference ? [`Referanse: ${params.reference}`] : []),
      ...(params.notes ? [`Leveringsinstruks: ${params.notes}`] : []),
      "",
      `Se i sjåfør-appen: ${companyInfo.url}/sjafor/${params.shipmentId}`,
    ].join("\n"),
  });
}
