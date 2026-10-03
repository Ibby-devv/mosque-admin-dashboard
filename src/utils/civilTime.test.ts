import {
  addCalendarDays,
  civilDateFromMidnightInstant,
  dateForAdhanCalculation,
  formatCivilDate,
  formatCivilDateDisplay,
  formatClock,
  formatClockDisplay,
  formatInstantDisplay,
  getZonedDateTimeParts,
  mosqueCivilToday,
  mosqueMidnightMillis,
  parseClock,
  parseCivilDate,
  zonedDateTimeToUtcMillis,
  zonedParts,
} from './civilTime';

const SYDNEY = 'Australia/Sydney';

describe('formatCivilDateDisplay', () => {
  it('renders 4 October 2026 as 04-10-2026', () => {
    const display = formatCivilDateDisplay({ year: 2026, month: 10, day: 4 });
    expect(display).toBe('04-10-2026');
    expect(display).not.toBe('10/04/2026');
    expect(display).not.toBe('04/10/2026');
    expect(display).not.toBe('2026-10-04');
  });

  it('round-trips through parseCivilDate and formatCivilDate', () => {
    const parsed = parseCivilDate('2026-10-04');
    expect(parsed).toEqual({ year: 2026, month: 10, day: 4 });
    expect(formatCivilDate(parsed!)).toBe('2026-10-04');
    expect(formatCivilDateDisplay(parsed!)).toBe('04-10-2026');
  });
});

describe('parseCivilDate', () => {
  it('rejects impossible and malformed dates', () => {
    expect(parseCivilDate('2026-02-31')).toBeNull();
    expect(parseCivilDate('2026-2-1')).toBeNull();
    expect(parseCivilDate('04-10-2026')).toBeNull();
  });
});

describe('getZonedDateTimeParts', () => {
  it('reads the mosque civil day, not the UTC day', () => {
    // 2026-10-03T14:00Z is 4 Oct 00:00 AEST (UTC+10)
    const parts = zonedParts(new Date('2026-10-03T14:00:00.000Z'), SYDNEY);
    expect(parts).toEqual({ year: 2026, month: 10, day: 4, hour: 0, minute: 0 });
  });

  it('never reports hour 24 at local midnight', () => {
    const parts = getZonedDateTimeParts(new Date('2026-10-03T14:00:00.000Z'), SYDNEY);
    expect(parts.hour).toBe(0);
  });
});

describe('formatInstantDisplay', () => {
  it('renders 4 Oct 2026 14:30 Sydney as 04-10-2026 14:30', () => {
    // 14:30 AEDT (UTC+11) = 03:30Z
    expect(formatInstantDisplay(new Date('2026-10-04T03:30:00.000Z'), SYDNEY)).toBe(
      '04-10-2026 14:30'
    );
  });

  it('renders local midnight as 00:00, not 24:00', () => {
    expect(formatInstantDisplay(new Date('2026-10-03T14:00:00.000Z'), SYDNEY)).toBe(
      '04-10-2026 00:00'
    );
  });
});

describe('clock helpers', () => {
  it('parses HH:mm and h:mm AM/PM', () => {
    expect(parseClock('14:30')).toBe(14 * 60 + 30);
    expect(parseClock('2:30 PM')).toBe(14 * 60 + 30);
    expect(parseClock('12:05 AM')).toBe(5);
    expect(parseClock('24:00')).toBeNull();
    expect(parseClock('nope')).toBeNull();
  });

  it('formats storage and display clocks', () => {
    expect(formatClock(14 * 60 + 30)).toBe('14:30');
    expect(formatClock(5)).toBe('00:05');
    expect(formatClockDisplay(14 * 60 + 30)).toBe('2:30 PM');
    expect(formatClockDisplay(0)).toBe('12:00 AM');
  });
});

describe('addCalendarDays', () => {
  it('rolls over months and years', () => {
    expect(addCalendarDays(2026, 1, 31, 1)).toEqual({ year: 2026, month: 2, day: 1 });
    expect(addCalendarDays(2026, 12, 31, 1)).toEqual({ year: 2027, month: 1, day: 1 });
    expect(addCalendarDays(2026, 3, 1, -7)).toEqual({ year: 2026, month: 2, day: 22 });
  });
});

describe('DST handling in Australia/Sydney', () => {
  it('finds true local midnight on the spring-forward day', () => {
    // 4 Oct 2026 00:00 AEST = 3 Oct 14:00Z
    expect(mosqueMidnightMillis(2026, 10, 4, SYDNEY)).toBe(
      Date.parse('2026-10-03T14:00:00.000Z')
    );
  });

  it('converts a 14:30 AEDT clock to the right instant', () => {
    expect(zonedDateTimeToUtcMillis(2026, 10, 4, 14, 30, SYDNEY)).toBe(
      Date.parse('2026-10-04T03:30:00.000Z')
    );
  });

  it('decodes a midnight instant and the old Saturday 23:00 DST bug to Sunday', () => {
    const exact = civilDateFromMidnightInstant(new Date('2026-10-03T14:00:00.000Z'), SYDNEY);
    expect(formatCivilDate(exact)).toBe('2026-10-04');

    // Saturday 23:00 AEST = 13:00Z
    const shifted = civilDateFromMidnightInstant(new Date('2026-10-03T13:00:00.000Z'), SYDNEY);
    expect(formatCivilDate(shifted)).toBe('2026-10-04');
  });

  it('mosqueCivilToday uses the mosque day, not the UTC day', () => {
    // 3 Oct 22:00Z is 4 Oct 09:00 AEDT
    const today = mosqueCivilToday(new Date('2026-10-03T22:00:00.000Z'), SYDNEY);
    expect(formatCivilDate(today)).toBe('2026-10-04');
  });
});

describe('dateForAdhanCalculation', () => {
  it('uses the mosque calendar day at midnight AEST on DST start day', () => {
    const date = dateForAdhanCalculation(new Date('2026-10-03T14:00:00.000Z'), SYDNEY);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(4);
    expect(date.getHours()).toBe(12);
  });

  it('uses 5 Apr after DST ends at 3 AM', () => {
    const date = dateForAdhanCalculation(new Date('2026-04-04T13:00:00.000Z'), SYDNEY);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(3);
    expect(date.getDate()).toBe(5);
  });
});
