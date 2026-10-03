// ============================================================================
// Civil time helpers (shared time-system contract)
//
// Ported from mosque_app_functions/functions/src/utils/iqamaSchedule.ts and
// functions/src/prayerTimes/calculatePrayerTimes.ts. Keep behaviour in sync;
// see TIME_SYSTEM.md in mosque_app_functions.
//
//   Civil date  -> `YYYY-MM-DD` string (storage, queries, <input type="date">)
//   Civil time  -> `HH:mm` string      (storage)
//   Instant     -> Firestore Timestamp
//
// Every user-visible date is `DD-MM-YYYY`.
// ============================================================================

const MINUTES_PER_DAY = 24 * 60;

export const DEFAULT_MOSQUE_TIMEZONE = 'Australia/Sydney';

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export interface ZonedDateTime extends CalendarDate {
  hour: number;
  minute: number;
}

/**
 * Add calendar days using UTC so month/year rollover is correct
 * (Jan 31 + 1 → Feb 1, Dec 31 + 1 → Jan 1).
 */
export function addCalendarDays(
  year: number,
  month: number,
  day: number,
  days: number
): CalendarDate {
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/** Civil date, `YYYY-MM-DD`. This is a calendar day, not an instant. */
export function formatCivilDate(date: CalendarDate): string {
  const month = date.month.toString().padStart(2, '0');
  const day = date.day.toString().padStart(2, '0');
  return `${date.year}-${month}-${day}`;
}

/** Accepts `YYYY-MM-DD`; rejects impossible dates such as 2026-02-31. */
export function parseCivilDate(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() + 1 !== month ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function getZonedDateTimeParts(date: Date, timeZone: string): ZonedDateTime {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  let hour = parseInt(parts.find((p) => p.type === 'hour')!.value, 10);
  // Some ICU builds still report midnight as 24
  if (hour === 24) hour = 0;

  return {
    year: parseInt(parts.find((p) => p.type === 'year')!.value, 10),
    month: parseInt(parts.find((p) => p.type === 'month')!.value, 10),
    day: parseInt(parts.find((p) => p.type === 'day')!.value, 10),
    hour,
    minute: parseInt(parts.find((p) => p.type === 'minute')!.value, 10),
  };
}

/** Alias used by the shared time-system contract. */
export const zonedParts = getZonedDateTimeParts;

/** User-visible civil date: `DD-MM-YYYY`. */
export function formatCivilDateDisplay(date: CalendarDate): string {
  const month = date.month.toString().padStart(2, '0');
  const day = date.day.toString().padStart(2, '0');
  return `${day}-${month}-${date.year}`;
}

/** User-visible instant in a zone: `DD-MM-YYYY HH:mm` (hourCycle h23). */
export function formatInstantDisplay(instant: Date, timeZone: string): string {
  const parts = getZonedDateTimeParts(instant, timeZone);
  const hour = parts.hour.toString().padStart(2, '0');
  const minute = parts.minute.toString().padStart(2, '0');
  return `${formatCivilDateDisplay(parts)} ${hour}:${minute}`;
}

/** Today's civil date in the mosque zone. */
export function mosqueCivilToday(now: Date, timeZone: string): CalendarDate {
  const parts = getZonedDateTimeParts(now, timeZone);
  return { year: parts.year, month: parts.month, day: parts.day };
}

/** Storage clock: minutes since midnight → `HH:mm`. */
export function formatClock(totalMinutes: number): string {
  const minutes = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const minute = (minutes % 60).toString().padStart(2, '0');
  return `${hour}:${minute}`;
}

/**
 * Parse a 12-hour time string (e.g. "5:30 AM") to minutes since midnight.
 * Does not interpret the clock in a timezone.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Parse a civil clock. Accepts `HH:mm` and `h:mm AM/PM`.
 * Returns minutes since midnight, or null if invalid.
 */
export function parseClock(value: string): number | null {
  const trimmed = value.trim();
  const twentyFour = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (twentyFour) {
    const hours = parseInt(twentyFour[1], 10);
    const minutes = parseInt(twentyFour[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }
  return parseTimeToMinutes(trimmed);
}

export function formatMinuteOfDay(totalMinutes: number): string {
  const minutes = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
}

/** UI clock: minutes since midnight → `h:mm AM`. */
export function formatClockDisplay(totalMinutes: number): string {
  return formatMinuteOfDay(totalMinutes);
}

/**
 * UTC offset of `date` in `timeZone`, in minutes east of UTC.
 * Positive for Australia/Sydney (UTC+10 / UTC+11).
 */
function timeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = getZonedDateTimeParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    0,
    0
  );
  return Math.round((asUtc - date.getTime()) / 60000);
}

/**
 * UTC millis for a civil date and clock time in an IANA timezone.
 *
 * The offset is read at the candidate instant, then once more at the
 * result. On a daylight-saving transition the offset at 00:00 UTC is not
 * the offset at local midnight, so a single sample stores the wrong day.
 */
export function zonedDateTimeToUtcMillis(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): number {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const offset = timeZoneOffsetMinutes(new Date(utcGuess), timeZone);
  let millis = utcGuess - offset * 60 * 1000;
  const offsetAtResult = timeZoneOffsetMinutes(new Date(millis), timeZone);
  if (offsetAtResult !== offset) {
    millis = utcGuess - offsetAtResult * 60 * 1000;
  }
  return millis;
}

/**
 * Local midnight as a UTC instant. Compatibility output only; a civil date
 * is a `YYYY-MM-DD` string, not a storage timestamp.
 */
export function mosqueMidnightMillis(
  year: number,
  month: number,
  day: number,
  mosqueTimezone: string
): number {
  return zonedDateTimeToUtcMillis(year, month, day, 0, 0, mosqueTimezone);
}

/**
 * Civil date encoded by an instant that was meant to be local midnight.
 *
 * A correct midnight decodes to that calendar day. An older writer sampled
 * the wrong UTC offset on DST-change days and missed midnight by an hour
 * (23:00 the evening before, or 01:00). The date those writes were encoding
 * is the calendar day whose true local midnight is closest to the instant.
 * Only for documents already stored as a midnight timestamp; not for new writes.
 */
export function civilDateFromMidnightInstant(
  instant: Date,
  timeZone: string
): CalendarDate {
  const parts = getZonedDateTimeParts(instant, timeZone);
  const stampedDay: CalendarDate = {
    year: parts.year,
    month: parts.month,
    day: parts.day,
  };
  if (parts.hour === 0 && parts.minute === 0) {
    return stampedDay;
  }

  const instantMs = instant.getTime();
  const candidates = [
    addCalendarDays(stampedDay.year, stampedDay.month, stampedDay.day, -1),
    stampedDay,
    addCalendarDays(stampedDay.year, stampedDay.month, stampedDay.day, 1),
  ];

  let best = stampedDay;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const midnight = mosqueMidnightMillis(
      candidate.year,
      candidate.month,
      candidate.day,
      timeZone
    );
    const distance = Math.abs(midnight - instantMs);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}

/**
 * Date to hand to adhan-js for the mosque's civil day: the mosque
 * year/month/day at noon in the process zone, so adhan-js (which reads the
 * process-local calendar day) sees that day. Format the resulting adhan
 * instants with `timeZone` set to the mosque zone.
 */
export function dateForAdhanCalculation(now: Date, mosqueTimezone: string): Date {
  const parts = getZonedDateTimeParts(now, mosqueTimezone);
  return new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0);
}
