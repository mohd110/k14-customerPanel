// Date helpers for the menu's date selector.
// The menu is offered per-date; ordering opens from *tomorrow* onward
// (same-day is disabled to allow prep lead time).

export interface DateOption {
  iso: string // 2026-06-18  (local calendar date, used as the DB key)
  weekday: string // Thu
  day: string // 18
  month: string // Jun
  full: string // Thu, 18 Jun
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Local calendar date as YYYY-MM-DD (no timezone shift, unlike toISOString). */
export function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function describe(d: Date): DateOption {
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' })
  const month = d.toLocaleDateString('en-IN', { month: 'short' })
  const day = pad(d.getDate())
  return { iso: toIso(d), weekday, month, day, full: `${weekday}, ${day} ${month}` }
}

/** The earliest selectable date (tomorrow), as YYYY-MM-DD. */
export function minMenuIso(startOffset = 1): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + startOffset)
  return toIso(d)
}

/** Upcoming selectable dates, starting `startOffset` days from today. */
export function upcomingDates(count = 14, startOffset = 1): DateOption[] {
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  const out: DateOption[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + startOffset + i)
    out.push(describe(d))
  }
  return out
}

/** 31 Aug as YYYY-MM-DD — this year, or next year if August has already passed. */
export function endOfAugustIso(): string {
  const now = new Date()
  const year = now.getMonth() > 7 ? now.getFullYear() + 1 : now.getFullYear()
  return `${year}-08-31`
}

/**
 * Selectable dates from `startOffset` days out through `endIso` (inclusive).
 * Used to open ordering for every date up to the end of August.
 */
export function upcomingDatesThrough(endIso: string, startOffset = 1): DateOption[] {
  const [ey, em, ed] = endIso.split('-').map(Number)
  const end = new Date(ey, em - 1, ed)
  end.setHours(0, 0, 0, 0)

  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + startOffset)

  const out: DateOption[] = []
  while (d <= end) {
    out.push(describe(new Date(d)))
    d.setDate(d.getDate() + 1)
  }
  return out
}

/** Human label for a stored iso date, e.g. "Thu, 18 Jun". */
export function formatIso(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return describe(new Date(y, m - 1, d)).full
}

// ── Hijri (Islamic) date — Muharram only ───────────────────────────────────
// This is a Muharram-only Tabarruk service, so we only ever surface the
// Muharram day count. Rather than rely on Intl's `islamic-umalqura` calendar —
// which some clients (older Android WebViews / iOS) don't support and silently
// fall back to Gregorian or the day-off `islamic-civil`, giving wrong or
// inconsistent dates across phones — we embed the exact Umm al-Qura start day
// and length of Muharram for each year. This yields the *same*, correct result
// on every device (so e.g. Ashura always lands on the right day).
//
// Table keyed by Hijri year → [Julian Day Number of 1 Muharram, days in Muharram].
// Generated from the Umm al-Qura calendar; covers 1447–1461 AH (≈ 2025–2039).
const MUHARRAM_TABLE: Record<number, [start: number, days: number]> = {
  1447: [2460853, 30], 1448: [2461208, 29], 1449: [2461563, 29], 1450: [2461917, 30],
  1451: [2462271, 30], 1452: [2462626, 30], 1453: [2462980, 30], 1454: [2463334, 30],
  1455: [2463689, 29], 1456: [2464044, 29], 1457: [2464398, 30], 1458: [2464753, 29],
  1459: [2465107, 29], 1460: [2465461, 29], 1461: [2465815, 29],
}

/** Gregorian calendar date → Julian Day Number. */
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

/**
 * The Hijri date for a stored iso date, in English transliteration —
 * e.g. "5 Muharram 1448 AH". Returns an empty string for any date that does
 * NOT fall in Muharram.
 */
export function hijriFromIso(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const jdn = gregorianToJDN(y, m, d)
  for (const [yearStr, [start, days]] of Object.entries(MUHARRAM_TABLE)) {
    if (jdn >= start && jdn < start + days) {
      return `${jdn - start + 1} Muharram ${yearStr} AH`
    }
  }
  return '' // not Muharram (or outside the table's year range)
}
