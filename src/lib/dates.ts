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

/** Human label for a stored iso date, e.g. "Thu, 18 Jun". */
export function formatIso(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return describe(new Date(y, m - 1, d)).full
}

/**
 * The Hijri (Islamic) date for a stored iso date, in English transliteration —
 * e.g. "5 Muharram 1448 AH". Uses the Umm al-Qura calendar (the one used in
 * Saudi Arabia). Shown alongside the Gregorian date for the community.
 */
export function hijriFromIso(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  try {
    return new Intl.DateTimeFormat('en-GB-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    // Older runtimes without the Umm al-Qura calendar — fall back to plain islamic.
    return new Intl.DateTimeFormat('en-GB-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }
}
