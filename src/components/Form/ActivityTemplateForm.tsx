import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCareCentreHours } from "@/hooks/activities/useCareCentreHours";
import type { ActivityTemplateFormValues } from "@/api/activities/activityTemplates";

type Props = {
  initial?: Partial<ActivityTemplateFormValues>;
  submitting?: boolean;
  submitLabel?: string;
  nameLabel?: string;
  lockTitle?: boolean;
  lockedNote?: string;
  onSubmit: (values: ActivityTemplateFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

const WEEKDAY_MAP = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

const ALLOWED_DURATIONS = [30, 60];

const buildTimeOptions = (open: string, close: string) => {
  const result: string[] = [];
  let current = dayjs(open, "HH:mm");
  const end = dayjs(close, "HH:mm");
  while (current.isBefore(end)) {
    result.push(current.format("HH:mm"));
    current = current.add(30, "minute");
  }
  return result;
};

const parseSlots = (slots?: string | null) => {
  const days: string[] = [];
  const times: Record<string, string> = {};
  (slots ?? "").split(",").forEach((part) => {
    const [day, time] = part.trim().split(" ");
    if (day && time) {
      days.push(day);
      times[day] = time;
    }
  });
  return { days, times };
};

export default function ActivityTemplateForm({
  initial,
  submitting,
  submitLabel = "Save",
  nameLabel = "Template Name",
  lockTitle = false,
  lockedNote,
  onSubmit,
  onCancel,
}: Props) {
  const prefilled = parseSlots(initial?.fixed_time_slots);

  const [name, setName] = useState(initial?.name ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isCompulsory, setIsCompulsory] = useState(initial?.is_compulsory ?? false);
  const [isFixed, setIsFixed] = useState(initial?.is_fixed ?? false);
  const [isGroup, setIsGroup] = useState(initial?.is_group ?? false);
  const [minPeopleReq, setMinPeopleReq] = useState(initial?.min_people_req ?? 1);
  const [duration, setDuration] = useState(initial?.min_duration ?? 60);
  const [startDate, setStartDate] = useState(initial?.start_date ?? dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(initial?.end_date ?? "2999-01-01");
  const [selectedDays, setSelectedDays] = useState<string[]>(prefilled.days);
  const [dayTimes, setDayTimes] = useState<Record<string, string>>(prefilled.times);
  const [errors, setErrors] = useState<string[]>([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const { centre } = useCareCentreHours();
  const workingHours = centre?.working_hours;

  const openDays = useMemo(() => {
    if (!workingHours) return [];
    return WEEKDAY_MAP.filter((d) => {
      const wh = workingHours[d.key as keyof typeof workingHours];
      return Boolean(wh?.open && wh?.close);
    });
  }, [workingHours]);

  const fixedTimeSlots = selectedDays
    .filter((day) => dayTimes[day])
    .map((day) => `${day} ${dayTimes[day]}`)
    .join(",");

  const validate = () => {
    const found: string[] = [];

    if (!name.trim()) found.push(`${nameLabel} is required.`);
    if (!title.trim()) found.push("Activity title is required.");
    if (isGroup && minPeopleReq < 2) found.push("Group activities must have a minimum of 2 people required.");
    if (!isGroup && minPeopleReq !== 1) found.push("Individual activities must have a minimum of 1 person required.");
    if (!ALLOWED_DURATIONS.includes(duration)) found.push("Duration must be either 30 or 60 minutes.");
    if (endDate && startDate && dayjs(endDate).isBefore(dayjs(startDate))) {
      found.push("End date cannot be before start date.");
    }
    if (isCompulsory && !isFixed) found.push("Compulsory activities must be fixed.");
    if ((isCompulsory || isFixed) && !fixedTimeSlots) {
      found.push("Fixed activities must have fixed time slots specified.");
    }

    return found;
  };

  // only complain once they have tried to submit, then keep it in step as they fix things
  useEffect(() => {
    if (attemptedSubmit) setErrors(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptedSubmit, name, title, isCompulsory, isFixed, isGroup, minPeopleReq, duration, startDate, endDate, fixedTimeSlots]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttemptedSubmit(true);

    const found = validate();
    setErrors(found);
    if (found.length) return;

    await onSubmit({
      name: name.trim(),
      title: title.trim(),
      description: description?.trim() || null,
      care_centre_id: initial?.care_centre_id ?? centre?.id ?? null,
      is_compulsory: isCompulsory,
      is_fixed: isFixed,
      is_group: isGroup,
      start_date: startDate,
      end_date: endDate,
      min_duration: duration,
      max_duration: duration,
      min_people_req: minPeopleReq,
      fixed_time_slots: fixedTimeSlots || null,
    });
  };

  const yesNo = (value: boolean, onChange: (next: boolean) => void, groupName: string, disabled = false) => (
    <div className="space-x-2">
      {[true, false].map((choice) => (
        <Label className="space-x-1" key={`${groupName}-${choice}`}>
          <input
            type="radio"
            name={groupName}
            checked={value === choice}
            disabled={disabled}
            onChange={() => onChange(choice)}
          />
          <span>{choice ? "Yes" : "No"}</span>
        </Label>
      ))}
    </div>
  );

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      {lockedNote && (
        <div className="rounded-md border border-blue-300 bg-blue-50 p-3 text-blue-900 text-sm">
          {lockedNote}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="template_name">{nameLabel}</Label>
        <Input
          id="template_name"
          value={name}
          maxLength={200}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template_title">Activity Title</Label>
        <Input
          id="template_title"
          value={title}
          maxLength={200}
          disabled={lockTitle}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template_description">Activity Description</Label>
        <Textarea
          id="template_description"
          value={description ?? ""}
          disabled={lockTitle}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Compulsory?</Label>
        {yesNo(isCompulsory, (next) => {
          setIsCompulsory(next);
          if (next) setIsFixed(true);
        }, "is_compulsory")}
      </div>

      <div className="space-y-2">
        <Label>Fixed timing?</Label>
        {yesNo(isFixed, setIsFixed, "is_fixed", isCompulsory)}
      </div>

      <div className="space-y-2">
        <Label>Group activity?</Label>
        {yesNo(isGroup, (next) => {
          setIsGroup(next);
          setMinPeopleReq(next ? Math.max(2, minPeopleReq) : 1);
        }, "is_group")}
      </div>

      {isGroup && (
        <div className="space-y-2">
          <Label htmlFor="min_people_req">Minimum People Required</Label>
          <Input
            id="min_people_req"
            type="number"
            min={2}
            value={minPeopleReq}
            onChange={(e) => setMinPeopleReq(Number(e.target.value))}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="duration">Duration</Label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {ALLOWED_DURATIONS.map((d) => (
            <option key={d} value={d}>{d} minutes</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">End Date</Label>
        <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {(isFixed || isCompulsory) && (
        <div className="space-y-2">
          <Label>Fixed Time Slots</Label>
          <div className="flex flex-wrap gap-3">
            {openDays.map((day) => {
              const wh = workingHours?.[day.key as keyof typeof workingHours];
              if (!wh?.open || !wh?.close) return null;
              const timeOptions = buildTimeOptions(wh.open, wh.close);

              return (
                <div key={day.key} className="flex items-center gap-2 border px-3 py-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.label)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDays([...selectedDays, day.label]);
                        setDayTimes({ ...dayTimes, [day.label]: timeOptions[0] });
                      } else {
                        setSelectedDays(selectedDays.filter((d) => d !== day.label));
                        const next = { ...dayTimes };
                        delete next[day.label];
                        setDayTimes(next);
                      }
                    }}
                  />
                  <span>{day.label}</span>
                  {selectedDays.includes(day.label) && (
                    <select
                      className="border rounded px-2 py-1"
                      value={dayTimes[day.label] ?? timeOptions[0]}
                      onChange={(e) => setDayTimes({ ...dayTimes, [day.label]: e.target.value })}
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting} className="min-w-24">
          {submitting ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
