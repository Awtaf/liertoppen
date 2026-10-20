import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getShiftsForStaff,
  getAllShiftsWithStaff,
  shiftDurationMinutes,
  formatDurationLabel,
  formatClock,
  formatDate,
} from "@/lib/staff/shifts";
import type { StaffRole } from "@/lib/staff/session";

export type HoursExportRow = {
  staffName: string;
  date: string; // already formatted, e.g. "24.02.2026"
  checkinLabel: string; // "09:14"
  checkoutLabel: string; // "17:02" or "Pågår"
  durationLabel: string; // "7t 48m"
};

function csvField(value: string): string {
  if (/[;"\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** ";"-delimited (not ",") so the file opens correctly in Excel with a
 * Norwegian locale, where "," is the decimal separator. */
export function buildHoursCsv(rows: HoursExportRow[]): string {
  const header = ["Ansatt", "Dato", "Inn", "Ut", "Timer"];
  const lines = [header.join(";")];
  for (const row of rows) {
    lines.push(
      [row.staffName, row.date, row.checkinLabel, row.checkoutLabel, row.durationLabel]
        .map(csvField)
        .join(";")
    );
  }
  return "﻿" + lines.join("\r\n");
}

/**
 * Resolves which shifts an export request may see: an "ansatt" caller is
 * always forced to their own id regardless of the requested staffId (query
 * params are client-controlled and must not grant access to others' hours),
 * while a "leder" may request one employee or all of them.
 */
export async function resolveHoursExportRows(
  admin: SupabaseClient,
  params: {
    requestedStaffId: string | null;
    role: StaffRole;
    ownStaffId: string;
    ownName: string;
    from?: Date;
    to?: Date;
  }
): Promise<{ rows: HoursExportRow[]; scopeLabel: string }> {
  const { requestedStaffId, role, ownStaffId, ownName, from, to } = params;

  if (role === "ansatt" || (requestedStaffId && requestedStaffId !== "all")) {
    const staffId = role === "ansatt" ? ownStaffId : requestedStaffId!;
    const shifts = await getShiftsForStaff(admin, staffId, from, to);
    const staffName =
      staffId === ownStaffId
        ? ownName
        : ((
            await admin.from("staff_members").select("name").eq("id", staffId).maybeSingle()
          ).data?.name ?? "Ukjent");

    return {
      scopeLabel: staffName,
      rows: shifts.map((shift) => ({
        staffName,
        date: formatDate(shift.checkin_at),
        checkinLabel: formatClock(shift.checkin_at),
        checkoutLabel: shift.checkout_at ? formatClock(shift.checkout_at) : "Pågår",
        durationLabel: formatDurationLabel(shiftDurationMinutes(shift)),
      })),
    };
  }

  const shifts = await getAllShiftsWithStaff(admin, from, to);
  return {
    scopeLabel: "Alle ansatte",
    rows: shifts.map((shift) => ({
      staffName: (shift.staff_members as { name: string } | null)?.name ?? "Ukjent",
      date: formatDate(shift.checkin_at),
      checkinLabel: formatClock(shift.checkin_at),
      checkoutLabel: shift.checkout_at ? formatClock(shift.checkout_at) : "Pågår",
      durationLabel: formatDurationLabel(shiftDurationMinutes(shift)),
    })),
  };
}

const NAVY = rgb(0x33 / 255, 0x0a / 255, 0x5c / 255);
const PURPLE = rgb(0x99 / 255, 0x0a / 255, 0xe3 / 255);
const INK = rgb(0.08, 0.08, 0.1);
const GRAY = rgb(0.4, 0.4, 0.45);
const LINE = rgb(0.85, 0.85, 0.9);

const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const ROW_HEIGHT = 20;
const COLS = [
  { label: "Ansatt", width: 150 },
  { label: "Dato", width: 90 },
  { label: "Inn", width: 70 },
  { label: "Ut", width: 70 },
  { label: "Timer", width: 90 },
];

export async function generateHoursPdf(
  rows: HoursExportRow[],
  meta: { title: string; periodLabel: string }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = drawPageHeader(page, helv, helvBold, meta);

  for (const row of rows) {
    if (y < MARGIN + ROW_HEIGHT) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = drawPageHeader(page, helv, helvBold, meta);
    }
    drawRow(page, helv, y, [
      row.staffName,
      row.date,
      row.checkinLabel,
      row.checkoutLabel,
      row.durationLabel,
    ]);
    y -= ROW_HEIGHT;
  }

  if (rows.length === 0) {
    page.drawText("Ingen økter i perioden.", { x: MARGIN, y: y - 4, size: 10, font: helv, color: GRAY });
  }

  return doc.save();
}

function drawPageHeader(
  page: PDFPage,
  helv: PDFFont,
  helvBold: PDFFont,
  meta: { title: string; periodLabel: string }
): number {
  let y = PAGE_HEIGHT - MARGIN;
  page.drawText(meta.title, { x: MARGIN, y, size: 16, font: helvBold, color: NAVY });
  y -= 20;
  page.drawText(meta.periodLabel, { x: MARGIN, y, size: 10, font: helv, color: GRAY });
  y -= 24;

  let x = MARGIN;
  for (const col of COLS) {
    page.drawText(col.label, { x, y, size: 9, font: helvBold, color: PURPLE });
    x += col.width;
  }
  y -= 8;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LINE });
  y -= 14;
  return y;
}

function drawRow(page: PDFPage, helv: PDFFont, y: number, values: string[]) {
  let x = MARGIN;
  values.forEach((value, i) => {
    page.drawText(value, { x, y, size: 9.5, font: helv, color: INK });
    x += COLS[i].width;
  });
}
