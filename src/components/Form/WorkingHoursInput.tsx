import { Day, WorkingHours } from "@/types/careCentre";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useMemo } from "react";
import { isOnHalfHourGrid, isWithinHours, compareTimes, OPEN_HHMM, CLOSE_HHMM } from "@/lib/validation/time";

const DAYS: Day[] = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
];

type Props = {
  value: WorkingHours;
  onChange: (next: WorkingHours) => void;
};

export default function WorkingHoursInput({ value, onChange }: Props) {
  const errs = useMemo(() => {
    const byDay: Record<string, string[]> = {};
    for (const d of DAYS) {
      const v = value[d];
      const msgs: string[] = [];
      const closed = v.open == null && v.close == null;
      if (closed) { byDay[d] = msgs; continue; }

      if (!v.open || !v.close) {
        msgs.push("Both open and close times are required or mark day as Closed.");
      } else {
        if (!isOnHalfHourGrid(v.open) || !isOnHalfHourGrid(v.close)) {
          msgs.push("Times must be on 00 or 30 minutes (e.g., 13:00, 13:30).");
        }
        if (!isWithinHours(v.open) || !isWithinHours(v.close)) {
          msgs.push("Select a time between 09:00 and 17:00.");
        }
        if (compareTimes(v.close, v.open) <= 0) {
          msgs.push("End time must be after the start time.");
        }
      }
      byDay[d] = msgs;
    }
    return byDay;
  }, [value]);

  const toggleClosed = (day: Day, closed: boolean) => {
    const next = { ...value };
    next[day] = closed ? { open: null, close: null } : { open: OPEN_HHMM, close: CLOSE_HHMM };
    onChange(next);
  };

  const updateTime = (day: Day, which: "open" | "close", v: string) => {
    const next = { ...value };
    next[day] = { ...next[day], [which]: v || null };
    onChange(next as WorkingHours);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {DAYS.map((d) => {
        const hours = value[d];
        const closed = hours.open === null && hours.close === null;
        const dayErrs = errs[d] || [];
        return (
          <div key={d} className="rounded-2xl border p-4 flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label className="capitalize">{d}</Label>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Closed</Label>
                  <Switch checked={closed} onCheckedChange={(c) => toggleClosed(d, c)} />
                </div>
              </div>

              {!closed && (
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="time"
                    min={OPEN_HHMM}
                    max={CLOSE_HHMM}
                    step={1800}
                    value={hours.open ?? ""}
                    onChange={(e) => updateTime(d, "open", e.target.value)}
                  />
                  <span>–</span>
                  <Input
                    type="time"
                    min={OPEN_HHMM}
                    max={CLOSE_HHMM}
                    step={1800}
                    value={hours.close ?? ""}
                    onChange={(e) => updateTime(d, "close", e.target.value)}
                  />
                </div>
              )}

              {dayErrs.length > 0 && !closed && (
                <ul className="mt-2 list-disc pl-5 text-xs text-destructive space-y-1">
                  {dayErrs.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const defaultWorkingHours = (): WorkingHours => ({
  monday: { open: "09:00", close: "17:00" },
  tuesday: { open: "09:00", close: "17:00" },
  wednesday: { open: "09:00", close: "17:00" },
  thursday: { open: "09:00", close: "17:00" },
  friday: { open: "09:00", close: "17:00" },
  saturday: { open: null, close: null },
  sunday: { open: null, close: null },
});