export type ScheduleDayKey =
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat";

const DAY_KEYS: ScheduleDayKey[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

/** Maps a JS Date's getDay() (0=Sun..6=Sat) to the schedule_days.day enum. */
export function dayOfWeekKey(date: Date): ScheduleDayKey {
  return DAY_KEYS[date.getDay()];
}

/** Fallback used when an employee has no schedule assigned, or their
 *  schedule has no row for today (e.g. a non-working day) -- preserves
 *  the previous fixed 9:00 AM behavior rather than refusing to mark
 *  anyone late. */
export const DEFAULT_SHIFT_START = "09:00:00";

/** Default grace period in minutes before a check-in counts as late,
 *  matching the previous hardcoded 9:15 cutoff (9:00 + 15). */
export const DEFAULT_GRACE_MINUTES = 15;

/**
 * Determines whether `now` counts as a late arrival against a scheduled
 * shift start time (Postgres `time` string, e.g. "09:00:00" or "09:00"),
 * allowing a grace period in minutes.
 */
export function isLateArrival(
  now: Date,
  startTime: string | null | undefined,
  graceMinutes: number = DEFAULT_GRACE_MINUTES,
): boolean {
  const effectiveStart = startTime ?? DEFAULT_SHIFT_START;
  const [hoursStr, minutesStr] = effectiveStart.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  const scheduledStart = new Date(now);
  scheduledStart.setHours(hours, minutes, 0, 0);

  const threshold = new Date(
    scheduledStart.getTime() + graceMinutes * 60_000,
  );

  return now > threshold;
}