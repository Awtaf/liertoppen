// lib/shipments/label.ts
// =============================================================================
// Genererer fraktlappen som en ekte PDF, med en ekte skannbar Code128-
// strekkode. Layouten reproduserer designet fra fraktlapp-generator.html
// (navy header, amber tjenestetag, FRA/TIL-blokker).
//
// To formater:
//  - generateLabelPdf(): nøyaktig 100x150 mm, fyller hele siden. For
//    vanlige norske thermo-etikettskrivere (Zebra/DYMO/Brother QL).
//    Nøyaktig millimeter-størrelse er avgjørende her — nettleserens
//    print-skalering kan ellers gi feil størrelse avhengig av skriverdriver.
//  - generateLabelPdfA4(): samme design i større skala, sentrert på en
//    vanlig A4-side med klippelinje + instruks. Midlertidig løsning for
//    kunder uten etikettskriver — se CLAUDE.md-historikk/PR-beskrivelse.
// =============================================================================
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import bwipjs from "bwip-js/node";
import { companyInfo } from "@/config/company";
import { formatTrackingNumber } from "./tracking";
import { SERVICE_LABELS } from "./shipment";
import type { Shipment } from "./shipment";

const MM = 2.8346456693;

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

/**
 * Tegner selve fraktlapp-designet inn i en PDF-side, forskjøvet til
 * (originX, originY) og skalert med `scale` (1 = de originale 100x150 mm-
 * målene). Alle absoluttverdier under (skriftstørrelser, høyder, paddinger)
 * er tunet for scale=1 og multipliseres med S().
 */
async function drawLabel(
  doc: PDFDocument,
  page: PDFPage,
  shipment: Shipment,
  originX: number,
  originY: number,
  scale: number
) {
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const S = (n: number) => n * scale;

  const WIDTH = 100 * MM * scale;
  const HEIGHT = 150 * MM * scale;
  const X0 = originX;
  const Y0 = originY;

  // Outer border, matches the reference design's 2px black frame.
  page.drawRectangle({
    x: X0 + S(1),
    y: Y0 + S(1),
    width: WIDTH - S(2),
    height: HEIGHT - S(2),
    borderColor: INK,
    borderWidth: S(2),
  });

  let y = Y0 + HEIGHT;

  // ---- Top navy bar -------------------------------------------------------
  const topBarHeight = S(44);
  y -= topBarHeight;
  page.drawRectangle({ x: X0, y, width: WIDTH, height: topBarHeight, color: NAVY });
  page.drawText("ØSTFOLD BUD SERVICE AS", {
    x: X0 + S(12),
    y: y + topBarHeight - S(18),
    size: S(10.5),
    font: helvBold,
    color: WHITE,
  });
  page.drawText("TRANSPORT & DISTRIBUSJON", {
    x: X0 + S(12),
    y: y + topBarHeight - S(30),
    size: S(6),
    font: helv,
    color: rgb(0.85, 0.88, 0.93),
  });
  const serviceLabel = (SERVICE_LABELS[shipment.service_key] ?? shipment.service_key).toUpperCase();
  const tagFontSize = S(7.5);
  const tagPaddingX = S(7);
  const tagWidth = helvBold.widthOfTextAtSize(serviceLabel, tagFontSize) + tagPaddingX * 2;
  const tagHeight = S(16);
  const tagX = X0 + WIDTH - S(12) - tagWidth;
  const tagY = y + (topBarHeight - tagHeight) / 2;
  page.drawRectangle({ x: tagX, y: tagY, width: tagWidth, height: tagHeight, color: AMBER });
  page.drawText(serviceLabel, {
    x: tagX + tagPaddingX,
    y: tagY + S(5),
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
  const barcodeTargetWidth = WIDTH - S(48);
  const barcodeTargetHeight = barcodeImage.height * (barcodeTargetWidth / barcodeImage.width);
  y -= S(14);
  page.drawImage(barcodeImage, {
    x: X0 + (WIDTH - barcodeTargetWidth) / 2,
    y: y - barcodeTargetHeight,
    width: barcodeTargetWidth,
    height: barcodeTargetHeight,
  });
  y -= barcodeTargetHeight + S(14);
  const trackingText = formatTrackingNumber(shipment.tracking_number);
  page.drawText(trackingText, {
    x: centered(helvBold, trackingText, S(12), X0 + WIDTH / 2),
    y,
    size: S(12),
    font: helvBold,
    color: INK,
  });
  y -= S(12);
  drawDashedLine(page, X0, y, X0 + WIDTH, y, scale);

  // ---- FRA / TIL ------------------------------------------------------------
  const addrTop = y;
  const addrHeight = S(62);
  y -= addrHeight;
  const colWidth = WIDTH / 2;
  drawParty(page, helv, helvBold, "FRA", shipment.sender, X0 + S(12), addrTop - S(14), colWidth - S(24), scale);
  drawParty(page, helv, helvBold, "TIL", shipment.receiver, X0 + colWidth + S(12), addrTop - S(14), colWidth - S(24), scale);
  page.drawLine({
    start: { x: X0 + colWidth, y: addrTop },
    end: { x: X0 + colWidth, y: addrTop - addrHeight },
    thickness: S(0.75),
    color: LINE,
    dashArray: [S(2), S(2)],
  });
  drawDashedLine(page, X0, y, X0 + WIDTH, y, scale);

  // ---- Kolli / Vekt / Levering ------------------------------------------------
  const infoTop = y;
  const infoHeight = S(30);
  y -= infoHeight;
  const cellWidth = WIDTH / 3;
  const cells: [string, string][] = [
    ["KOLLI", String(shipment.goods.colli ?? 1)],
    ["VEKT", `${shipment.goods.weightKg ?? 0} kg`],
    ["LEVERING", shipment.requested_delivery || "—"],
  ];
  cells.forEach(([label, value], i) => {
    const cx = X0 + cellWidth * i + cellWidth / 2;
    page.drawText(label, { x: centered(helv, label, S(6), cx), y: infoTop - S(12), size: S(6), font: helv, color: GRAY });
    const valueSize = value.length > 14 ? S(6.5) : S(9);
    page.drawText(value, {
      x: centered(helvBold, value, valueSize, cx),
      y: infoTop - S(23),
      size: valueSize,
      font: helvBold,
      color: INK,
    });
    if (i > 0) {
      page.drawLine({
        start: { x: X0 + cellWidth * i, y: infoTop },
        end: { x: X0 + cellWidth * i, y: infoTop - infoHeight },
        thickness: S(0.75),
        color: LINE,
        dashArray: [S(2), S(2)],
      });
    }
  });
  drawDashedLine(page, X0, y, X0 + WIDTH, y, scale);

  // ---- Referanse --------------------------------------------------------------
  y -= S(18);
  page.drawText("REFERANSE", { x: X0 + S(12), y, size: S(6), font: helvBold, color: GRAY });
  page.drawText(shipment.reference || "—", {
    x: X0 + S(12) + helvBold.widthOfTextAtSize("REFERANSE", S(6)) + S(8),
    y,
    size: S(8.5),
    font: helv,
    color: INK,
  });
  y -= S(8);
  drawDashedLine(page, X0, y, X0 + WIDTH, y, scale);

  // ---- Footer -------------------------------------------------------------
  y -= S(14);
  page.drawText(`Org.nr ${companyInfo.organizationNumber}`, { x: X0 + S(12), y, size: S(6.5), font: helv, color: GRAY });
  const footerRight = `${companyInfo.domain} · ${companyInfo.phone}`;
  page.drawText(footerRight, {
    x: X0 + WIDTH - S(12) - helv.widthOfTextAtSize(footerRight, S(6.5)),
    y,
    size: S(6.5),
    font: helv,
    color: GRAY,
  });

  return { width: WIDTH, height: HEIGHT };
}

/** Ekte fraktlapp som PDF i nøyaktig 100x150 mm — for thermo-etikettskrivere. */
export async function generateLabelPdf(shipment: Shipment): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const width = 100 * MM;
  const height = 150 * MM;
  const page = doc.addPage([width, height]);
  await drawLabel(doc, page, shipment, 0, 0, 1);
  return doc.save();
}

/**
 * Samme fraktlapp i større skala, sentrert på en A4-side med klippelinje
 * og instruks — en midlertidig løsning for kunder uten etikettskriver.
 * Printes på vanlig skriver, klippes ut og festes på pakken.
 */
export async function generateLabelPdfA4(shipment: Shipment): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const a4Width = 210 * MM;
  const a4Height = 297 * MM;
  const page = doc.addPage([a4Width, a4Height]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);

  const scale = 1.5; // label blir 150x225 mm
  const labelWidth = 100 * MM * scale;
  const labelHeight = 150 * MM * scale;
  const originX = (a4Width - labelWidth) / 2;
  const originY = (a4Height - labelHeight) / 2 + 20;

  await drawLabel(doc, page, shipment, originX, originY, scale);

  // Klippelinje rundt etiketten.
  page.drawRectangle({
    x: originX - 8,
    y: originY - 8,
    width: labelWidth + 16,
    height: labelHeight + 16,
    borderColor: LINE,
    borderWidth: 1,
    borderDashArray: [4, 4],
  });

  const instruction = "Klipp ut langs stiplet linje og fest godt synlig på pakken.";
  page.drawText(instruction, {
    x: centered(helv, instruction, 10, a4Width / 2),
    y: originY - 28,
    size: 10,
    font: helv,
    color: GRAY,
  });

  return doc.save();
}

function drawDashedLine(page: PDFPage, x1: number, y1: number, x2: number, y2: number, scale: number) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.75 * scale, color: LINE, dashArray: [3 * scale, 2 * scale] });
}

function drawParty(
  page: PDFPage,
  helv: PDFFont,
  helvBold: PDFFont,
  caption: string,
  party: Shipment["sender"],
  x: number,
  yTop: number,
  maxWidth: number,
  scale: number
) {
  const S = (n: number) => n * scale;
  page.drawText(caption, { x, y: yTop, size: S(6), font: helvBold, color: GRAY });
  page.drawText(truncate(helvBold, party.name, S(10), maxWidth), { x, y: yTop - S(12), size: S(10), font: helvBold, color: INK });
  const lines = [party.addr, `${party.zip} ${party.city}`.trim(), party.tel ? `Tlf ${party.tel}` : null].filter(
    (l): l is string => Boolean(l)
  );
  lines.forEach((line, i) => {
    page.drawText(truncate(helv, line, S(8.5), maxWidth), {
      x,
      y: yTop - S(24) - i * S(11),
      size: S(8.5),
      font: helv,
      color: rgb(0.13, 0.16, 0.23),
    });
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
