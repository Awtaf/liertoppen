/**
 * Calendar-period helpers, all computed in Europe/Oslo local time (the
 * store's timezone) so daily/weekly task resets and week/month leaderboard
 * filters line up with the staff's actual working day, regardless of the
 * server's own timezone.
 */

const TIME_ZONE = "Europe/Oslo";

function osloDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { year: Number(map.year), month: Number(map.month), day: Number(map.day) };
}

/** "YYYY-MM-DD" for the given instant's Oslo-local calendar date. */
export function dailyPeriodKey(date: Date = new Date()): string {
  const { year, month, day } = osloDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** ISO-8601 week key "YYYY-Www" (Monday-start) for the Oslo-local date. */
export function weeklyPeriodKey(date: Date = new Date()): string {
  const { year, month, day } = osloDateParts(date);
  // ISO week algorithm, operated on the Oslo calendar date treated as a
  // plain date (timezone no longer matters once we have y/m/d).
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const weekNum = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export const ONE_TIME_PERIOD_KEY = "once";

/** Start of the current Oslo-local ISO week (Monday 00:00), as a Date. */
export function startOfOsloWeek(date: Date = new Date()): Date {
  const { year, month, day } = osloDateParts(date);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum);
  return d;
}

/** Start of the current Oslo-local calendar month, as a Date. */
export function startOfOsloMonth(date: Date = new Date()): Date {
  const { year, month } = osloDateParts(date);
  return new Date(Date.UTC(year, month - 1, 1));
}
