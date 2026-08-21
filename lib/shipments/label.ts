// lib/shipments/label.ts
// =============================================================================
// Genererer fraktlappen som en ekte PDF i nøyaktig 100x150 mm, med en ekte
// skannbar Code128-strekkode. Layouten reproduserer designet fra
// fraktlapp-generator.html (navy header, amber tjenestetag, FRA/TIL-blokker).
//
// Nøyaktig millimeter-størrelse (ikke bare CSS @media print) er avgjørende
// for at lappen skal skrive riktig ut på vanlige norske thermo-etikettskrivere
// (f.eks. Zebra/DYMO/Brother QL i 100x150 mm-format) — nettleserens
// print-skalering kan ellers gi feil størrelse avhengig av skriverdriver.
// =============================================================================
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import bwipjs from "bwip-js/node";
import { companyInfo } from "@/config/company";
import { formatTrackingNumber } from "./tracking";
import { SERVICE_LABELS } from "./shipment";
import type { Shipment } from "./shipment";

const MM = 2.8346456693;
const WIDTH = 100 * MM;
const HEIGHT = 150 * MM;

const NAVY = rgb(0x15 / 255, 0x22 / 255, 0x39 / 255);
const AMBER = rgb(0xe8 / 255, 0xa3 / 255, 0x3d / 255);
const AMBER_INK = rgb(0x3a / 255, 0x2a / 255, 0x06 / 255);
const INK = rgb(0x0b / 255, 0x0f / 255, 0x16 / 255);
const GRAY = rgb(0x59 / 255, 0x65 / 255, 0x7a / 255);
const LINE = rgb(0xc3 / 255, 0xcc / 255, 0xd8 / 255);
const WHITE = rgb(1, 1, 1);

function centered(font: PDFFont, text: string, size: number, centerX: number) {
  const width = font.widthOfTextAtSize(text, size);
  return centerX - width / 2;
}

export async function generateLabelPdf(shipment: Shipment): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([WIDTH, HEIGHT]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Outer border, matches the reference design's 2px black frame.
  page.drawRectangle({
    x: 1,
    y: 1,
    width: WIDTH - 2,
    height: HEIGHT - 2,
    borderColor: INK,
    borderWidth: 2,
  });

  let y = HEIGHT;

  // ---- Top navy bar -------------------------------------------------------
  const topBarHeight = 44;
  y -= topBarHeight;
  page.drawRectangle({ x: 0, y, width: WIDTH, height: topBarHeight, color: NAVY });
  page.drawText("ØSTFOLD BUD SERVICE AS", {
    x: 12,
    y: y + topBarHeight - 18,
    size: 10.5,
    font: helvBold,
    color: WHITE,
  });
  page.drawText("TRANSPORT & DISTRIBUSJON", {
    x: 12,
    y: y + topBarHeight - 30,
    size: 6,
    font: helv,
    color: rgb(0.85, 0.88, 0.93),
  });
  const serviceLabel = (SERVICE_LABELS[shipment.service_key] ?? shipment.service_key).toUpperCase();
  const tagFontSize = 7.5;
  const tagPaddingX = 7;
  const tagWidth = helvBold.widthOfTextAtSize(serviceLabel, tagFontSize) + tagPaddingX * 2;
  const tagHeight = 16;
  const tagX = WIDTH - 12 - tagWidth;
  const tagY = y + (topBarHeight - tagHeight) / 2;
  page.drawRectangle({ x: tagX, y: tagY, width: tagWidth, height: tagHeight, color: AMBER });
  page.drawText(serviceLabel, {
    x: tagX + tagPaddingX,
    y: tagY + 5,
    size: tagFontSize,
    font: helvBold,
    color: AMBER_INK,
  });

  // ---- Barcode --------------------------------------------------------------
  const barcodePng = await bwipjs.toBuffer({
    bcid: "code128",
    text: shipment.tracking_number,
    scale: 3,
    height: 12,
    includetext: false,
    backgroundcolor: "FFFFFF",
  });
  const barcodeImage = await doc.embedPng(barcodePng);
  const barcodeTargetWidth = WIDTH - 48;
  const barcodeTargetHeight = barcodeImage.height * (barcodeTargetWidth / barcodeImage.width);
  y -= 14;
  page.drawImage(barcodeImage, {
    x: (WIDTH - barcodeTargetWidth) / 2,
    y: y - barcodeTargetHeight,
    width: barcodeTargetWidth,
    height: barcodeTargetHeight,
  });
  y -= barcodeTargetHeight + 14;
  const trackingText = formatTrackingNumber(shipment.tracking_number);
  page.drawText(trackingText, {
    x: centered(helvBold, trackingText, 12, WIDTH / 2),
    y,
    size: 12,
    font: helvBold,
    color: INK,
  });
  y -= 12;
  drawDashedLine(page, 0, y, WIDTH, y);

  // ---- FRA / TIL ------------------------------------------------------------
  const addrTop = y;
  const addrHeight = 62;
  y -= addrHeight;
  const colWidth = WIDTH / 2;
  drawParty(page, helv, helvBold, "FRA", shipment.sender, 12, addrTop - 14, colWidth - 24);
  drawParty(page, helv, helvBold, "TIL", shipment.receiver, colWidth + 12, addrTop - 14, colWidth - 24);
  page.drawLine({ start: { x: colWidth, y: addrTop }, end: { x: colWidth, y: addrTop - addrHeight }, thickness: 0.75, color: LINE, dashArray: [2, 2] });
  drawDashedLine(page, 0, y, WIDTH, y);

  // ---- Kolli / Vekt / Levering ------------------------------------------------
  const infoTop = y;
  const infoHeight = 30;
  y -= infoHeight;
  const cellWidth = WIDTH / 3;
  const cells: [string, string][] = [
    ["KOLLI", String(shipment.goods.colli ?? 1)],
    ["VEKT", `${shipment.goods.weightKg ?? 0} kg`],
    ["LEVERING", shipment.requested_delivery || "—"],
  ];
  cells.forEach(([label, value], i) => {
    const cx = cellWidth * i + cellWidth / 2;
    page.drawText(label, { x: centered(helv, label, 6, cx), y: infoTop - 12, size: 6, font: helv, color: GRAY });
    const valueSize = value.length > 14 ? 6.5 : 9;
    page.drawText(value, { x: centered(helvBold, value, valueSize, cx), y: infoTop - 23, size: valueSize, font: helvBold, color: INK });
    if (i > 0) {
      page.drawLine({ start: { x: cellWidth * i, y: infoTop }, end: { x: cellWidth * i, y: infoTop - infoHeight }, thickness: 0.75, color: LINE, dashArray: [2, 2] });
    }
  });
  drawDashedLine(page, 0, y, WIDTH, y);

  // ---- Referanse --------------------------------------------------------------
  y -= 18;
  page.drawText("REFERANSE", { x: 12, y, size: 6, font: helvBold, color: GRAY });
  page.drawText(shipment.reference || "—", {
    x: 12 + helvBold.widthOfTextAtSize("REFERANSE", 6) + 8,
    y,
    size: 8.5,
    font: helv,
    color: INK,
  });
  y -= 8;
  drawDashedLine(page, 0, y, WIDTH, y);

  // ---- Footer -------------------------------------------------------------
  y -= 14;
  page.drawText(`Org.nr ${companyInfo.organizationNumber}`, { x: 12, y, size: 6.5, font: helv, color: GRAY });
  const footerRight = `${companyInfo.domain} · ${companyInfo.phone}`;
  page.drawText(footerRight, {
    x: WIDTH - 12 - helv.widthOfTextAtSize(footerRight, 6.5),
    y,
    size: 6.5,
    font: helv,
    color: GRAY,
  });

  return doc.save();
}

function drawDashedLine(page: PDFPage, x1: number, y1: number, x2: number, y2: number) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.75, color: LINE, dashArray: [3, 2] });
}

function drawParty(
  page: PDFPage,
  helv: PDFFont,
  helvBold: PDFFont,
  caption: string,
  party: Shipment["sender"],
  x: number,
  yTop: number,
  maxWidth: number
) {
  page.drawText(caption, { x, y: yTop, size: 6, font: helvBold, color: GRAY });
  page.drawText(truncate(helvBold, party.name, 10, maxWidth), { x, y: yTop - 12, size: 10, font: helvBold, color: INK });
  const lines = [party.addr, `${party.zip} ${party.city}`.trim(), party.tel ? `Tlf ${party.tel}` : null].filter(
    (l): l is string => Boolean(l)
  );
  lines.forEach((line, i) => {
    page.drawText(truncate(helv, line, 8.5, maxWidth), { x, y: yTop - 24 - i * 11, size: 8.5, font: helv, color: rgb(0.13, 0.16, 0.23) });
  });
}

function truncate(font: PDFFont, text: string, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && font.widthOfTextAtSize(result + "…", size) > maxWidth) {
    result = result.slice(0, -1);
  }
  return result + "…";
}
