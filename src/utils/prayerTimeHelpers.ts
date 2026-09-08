const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

export type PrayerName = (typeof PRAYERS)[number];

/**
 * Add minutes to a 12-hour Adhan time string (e.g. "5:41 PM" + 10 → "5:51 PM").
 * Returns '--:--' if inputs are invalid.
 */
export function calculateIqamaTime(
  adhanTime: string | undefined,
  offset: number | undefined
): string {
  if (!adhanTime || typeof offset !== "number" || !Number.isFinite(offset)) {
    return "--:--";
  }

  try {
    const timeMatch = adhanTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return "--:--";

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    const dayMinutes = 24 * 60;
    let totalMinutes = hours * 60 + minutes + offset;
    totalMinutes = ((totalMinutes % dayMinutes) + dayMinutes) % dayMinutes;

    let newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    const newPeriod = newHours >= 12 ? "PM" : "AM";
    if (newHours > 12) {
      newHours -= 12;
    } else if (newHours === 0) {
      newHours = 12;
    }

    return `${newHours}:${newMinutes.toString().padStart(2, "0")} ${newPeriod}`;
  } catch {
    return "--:--";
  }
}

/**
 * For every prayer with iqama_type === 'offset', set *_iqama from Adhan + offset.
 * Fixed prayers are left unchanged.
 */
export function applyOffsetIqamasToPrayerTimes<T extends Record<string, any>>(
  prayerTimes: T
): T {
  const updates: Record<string, string> = {};

  for (const prayer of PRAYERS) {
    const iqamaType = prayerTimes[`${prayer}_iqama_type`];
    if (iqamaType !== "offset") {
      continue;
    }

    const adhanTime = prayerTimes[`${prayer}_adhan`] as string | undefined;
    const offsetRaw = prayerTimes[`${prayer}_iqama_offset`];
    const offset =
      typeof offsetRaw === "number"
        ? offsetRaw
        : typeof offsetRaw === "string"
          ? parseInt(offsetRaw, 10)
          : NaN;

    const iqamaTime = calculateIqamaTime(adhanTime, offset);
    if (iqamaTime !== "--:--") {
      updates[`${prayer}_iqama`] = iqamaTime;
    }
  }

  return { ...prayerTimes, ...updates };
}
