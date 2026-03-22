import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// API schema:
//   open day   -> { open: "09:00", close: "17:00" }
//   closed day -> {}
export type WorkingHourDay = {
  open?: string;
  close?: string;
};

export type WorkingHours = {
  monday: WorkingHourDay;
  tuesday: WorkingHourDay;
  wednesday: WorkingHourDay;
  thursday: WorkingHourDay;
  friday: WorkingHourDay;
  saturday: WorkingHourDay;
  sunday: WorkingHourDay;
};

// Weekdays open with blank times, weekends closed.
export const defaultWorkingHours = (): WorkingHours => ({
  monday:    { open: "", close: "" },
  tuesday:   { open: "", close: "" },
  wednesday: { open: "", close: "" },
  thursday:  { open: "", close: "" },
  friday:    { open: "", close: "" },
  saturday:  {},
  sunday:    {},
});

// Closed = object has no "open" key at all (stored as {}).
// { open: "", close: "" } = open but times not yet filled.
const isDayClosed = (d?: WorkingHourDay): boolean => !d || !("open" in d);

type Props = {
  value: WorkingHours;
  onChange: (next: WorkingHours) => void;
  showErrors?: boolean;
};

const DAYS: { key: keyof WorkingHours; label: string; short: string }[] = [
  { key: "monday",    label: "Monday",    short: "Mon" },
  { key: "tuesday",   label: "Tuesday",   short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday",  label: "Thursday",  short: "Thu" },
  { key: "friday",    label: "Friday",    short: "Fri" },
  { key: "saturday",  label: "Saturday",  short: "Sat" },
  { key: "sunday",    label: "Sunday",    short: "Sun" },
];

function toMinutes(t?: string): number | null {
  if (!t) return null;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function getDayError(day: WorkingHourDay | undefined, touched: boolean): string | null {
  if (!day || isDayClosed(day)) return null;
  const o = toMinutes(day.open);
  const c = toMinutes(day.close);
  const openMissing  = o == null;
  const closeMissing = c == null;
  if (openMissing || closeMissing) {
    const partial = !openMissing || !closeMissing;
    if (partial || touched) {
      if (openMissing && closeMissing) return "Opening and closing times are required";
      if (openMissing)                 return "Opening time is required";
      return "Closing time is required";
    }
    return null;
  }
  if (o >= c)       return "Closing time must be after opening time";
  if (o < 9 * 60)  return "Cannot open before 09:00";
  if (c > 17 * 60) return "Cannot close after 17:00";
  return null;
}

export default function WorkingHoursInput({ value, onChange, showErrors = false }: Props) {
  const [bulkOpen,  setBulkOpen]  = useState("09:00");
  const [bulkClose, setBulkClose] = useState("17:00");
  const [touched, setTouched] = useState<Record<keyof WorkingHours, boolean>>({
    monday: false, tuesday: false, wednesday: false, thursday: false,
    friday: false, saturday: false, sunday: false,
  });

  const setTime = (day: keyof WorkingHours, field: "open" | "close", val: string) => {
    onChange({ ...value, [day]: { ...value[day], [field]: val } });
  };

  const closeDay  = (day: keyof WorkingHours) => onChange({ ...value, [day]: {} });
  const reopenDay = (day: keyof WorkingHours) => onChange({ ...value, [day]: { open: "", close: "" } });

  const applyBulkToOpenDays = () => {
    if (!bulkOpen || !bulkClose) return;
    const next = { ...value };
    DAYS.forEach(({ key }) => {
      if (!isDayClosed(value[key])) next[key] = { open: bulkOpen, close: bulkClose };
    });
    onChange(next);
  };

  const applyBulkToAllDays = () => {
    if (!bulkOpen || !bulkClose) return;
    const next = {} as WorkingHours;
    DAYS.forEach(({ key }) => { next[key] = { open: bulkOpen, close: bulkClose }; });
    onChange(next);
  };

  const hasAnyOpen = DAYS.some(({ key }) => !isDayClosed(value[key]));

  return (
    <div className="space-y-4">

      {/* Bulk apply */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <p className="text-sm font-medium">Bulk apply</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Opens</label>
            <Input type="time" value={bulkOpen}  onChange={(e) => setBulkOpen(e.target.value)}  />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Closes</label>
            <Input type="time" value={bulkClose} onChange={(e) => setBulkClose(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasAnyOpen && (
            <Button
              type="button" size="sm"
              onClick={applyBulkToOpenDays}
              disabled={!bulkOpen || !bulkClose}
            >
              Apply to open days
            </Button>
          )}
          <Button
            type="button" size="sm" variant="outline"
            onClick={applyBulkToAllDays}
            disabled={!bulkOpen || !bulkClose}
          >
            Apply to all days
          </Button>
        </div>
      </div>

      {/* Per-day rows */}
      <div className="space-y-1.5">
        {DAYS.map(({ key, short }) => {
          const d      = value[key];
          const closed = isDayClosed(d);
          const err    = getDayError(d, showErrors || touched[key]);

          return (
            <div key={key}>
              <div className={[
                "flex items-center gap-2 rounded-md border px-3 py-2 transition-colors",
                closed ? "bg-muted/50 opacity-70" : "bg-background",
                err    ? "border-destructive"      : "",
              ].join(" ")}>

                <span className="w-7 shrink-0 text-xs font-medium text-muted-foreground">
                  {short}
                </span>

                {closed ? (
                  <>
                    <span className="flex-1 text-xs text-muted-foreground">Closed</span>
                    <button
                      type="button"
                      onClick={() => reopenDay(key)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded border border-border hover:bg-muted"
                    >
                      Reopen
                    </button>
                  </>
                ) : (
                  <>
                    <Input
                      type="time"
                      className="h-8 flex-1 min-w-0 text-sm"
                      value={d?.open ?? ""}
                      onChange={(e) => setTime(key, "open", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, [key]: true }))}
                    />
                    <span className="text-xs text-muted-foreground shrink-0">–</span>
                    <Input
                      type="time"
                      className="h-8 flex-1 min-w-0 text-sm"
                      value={d?.close ?? ""}
                      onChange={(e) => setTime(key, "close", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, [key]: true }))}
                    />
                    <button
                      type="button"
                      onClick={() => closeDay(key)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-0.5 rounded border border-border hover:bg-destructive/10 hover:border-destructive/50 shrink-0"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>

              {err && (
                <p className="text-xs text-destructive mt-0.5 ml-9">{err}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedule preview */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground font-medium">Preview</p>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(({ key, short }) => {
            const d      = value[key];
            const isOpen = !isDayClosed(d) && d?.open && d?.close;
            return (
              <div key={key} className={[
                "flex flex-col items-center gap-0.5 rounded-md py-1.5 px-1 text-center",
                isOpen ? "bg-green-50 dark:bg-green-950/30" : "bg-muted/40",
              ].join(" ")}>
                <span className={[
                  "text-[10px] font-medium",
                  isOpen ? "text-green-700 dark:text-green-400" : "text-muted-foreground",
                ].join(" ")}>{short}</span>
                <span className={[
                  "text-[9px] leading-tight",
                  isOpen ? "text-green-600 dark:text-green-500" : "text-muted-foreground/60",
                ].join(" ")}>
                  {isOpen ? <>{d!.open}<br />{d!.close}</> : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}