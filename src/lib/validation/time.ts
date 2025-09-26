export const OPEN_HHMM = "09:00";
export const CLOSE_HHMM = "17:00";

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

export function isOnHalfHourGrid(hhmm: string): boolean {
  const mins = hhmmToMinutes(hhmm);
  return mins % 30 === 0;
}

export function isWithinHours(hhmm: string, start = OPEN_HHMM, end = CLOSE_HHMM): boolean {
  const v = hhmmToMinutes(hhmm);
  return v >= hhmmToMinutes(start) && v <= hhmmToMinutes(end);
}

export function compareTimes(a: string, b: string): number {
  return hhmmToMinutes(a) - hhmmToMinutes(b);
}

export type DayError = { day: string; messages: string[] };
export type WorkingHoursErrors = { byDay: Record<string, string[]>; anyError: boolean };

export function validateWorkingHours(
  wh: Record<string, { open: string | null; close: string | null }>
): WorkingHoursErrors {
  const errorsByDay: Record<string, string[]> = {};
  const push = (day: string, msg: string) => {
    (errorsByDay[day] ||= []).push(msg);
  };

  for (const [day, hours] of Object.entries(wh)) {
    const { open, close } = hours || {};
    if (open == null && close == null) continue;

    if (!open || !close) {
      push(day, "Both open and close times are required or mark day as Closed.");
      continue;
    }

    if (!isOnHalfHourGrid(open) || !isOnHalfHourGrid(close)) {
      push(day, "Times must be on 00 or 30 minutes (e.g., 13:00, 13:30).");
    }

    if (!isWithinHours(open) || !isWithinHours(close)) {
      push(day, "Select a time between 09:00 and 17:00.");
    }

    if (compareTimes(close, open) <= 0) {
      push(day, "End time must be after the start time.");
    }
  }

  return { byDay: errorsByDay, anyError: Object.keys(errorsByDay).length > 0 };
}

export function normalizeWorkingHours(
  wh: Record<string, { open: string | null; close: string | null }>
) {
  const next: typeof wh = {} as any;
  for (const [day, v] of Object.entries(wh)) {
    next[day] = {
      open: v?.open ? v.open : null,
      close: v?.close ? v.close : null,
    };
  }
  return next;
}