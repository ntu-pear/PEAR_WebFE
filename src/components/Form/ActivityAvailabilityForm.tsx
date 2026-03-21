import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCentreActivities } from "@/hooks/activities/useCentreActivities";
import { type FormErrors, type CentreActivityAvailabilityFormValues, validateLocal} from "@/lib/validation/activityAvailability";
import { CentreActivityWithTitle } from "@/api/activities/centreActivities";
import { useCareCentreHours } from "@/hooks/activities/useCareCentreHours";
import type { WorkingHours } from "@/api/activities/careCentres";



type Props = {
  initial: CentreActivityAvailabilityFormValues & {id?: number} & {editing?: boolean} & {selectedCentreActivityData : CentreActivityWithTitle};
  submitting?: boolean;
  onSubmit: (
    values: CentreActivityAvailabilityFormValues,
    setErrors: (e: FormErrors) => void
  ) => void | Promise<void>;
  onCancel?: () => void;
};

export interface RadioBtnOption {
  label: string;
  value: boolean;
}

const DAYS_MAP = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 8 },
  { label: "Fri", value: 16 },
  { label: "Sat", value: 32 },
  { label: "Sun", value: 64 },
];

const BIT_TO_DAY: Record<number, keyof WorkingHours> = {
  1: "monday",
  2: "tuesday",
  4: "wednesday",
  8: "thursday",
  16: "friday",
  32: "saturday",
  64: "sunday",
};


export default function ActivityAvailabilityForm({ 
  initial, 
  submitting,
  onSubmit,
  onCancel
}: Props) {
    const [centre_activity_id, setCentreActivityID] = useState<string>(initial?.centre_activity_id?.toString() ?? "");

    // EDIT: Separate start_date and end_date
    const [start_date, setStartDate] = useState(initial?.start_date ?? "");
    const [end_date, setEndDate] = useState(initial?.end_date ?? "");

    const hourOptions = Array.from({ length: 9 }, (_, i) => (i + 9).toString().padStart(2, "0"));

    const minuteOptions = Array.from({ length: 12 }, (_, i) =>
        (i * 5).toString().padStart(2, "0")
    );

    const [startHour, setStartHour] = useState("09");
    const [startMinute, setStartMinute] = useState("00");

    const [endHour, setEndHour] = useState("10");
    const [endMinute, setEndMinute] = useState("00");

    useEffect(() => {
        if (initial?.start_time) {
            const [h, m] = initial.start_time.split(":");
            setStartHour(h);
            setStartMinute(m);
        }

        if (initial?.end_time) {
            const [h, m] = initial.end_time.split(":");
            setEndHour(h);
            setEndMinute(m);
        }
    }, [initial]);

    const formattedStart = `${startHour}:${startMinute}`;
    const formattedEnd = `${endHour}:${endMinute}`;

    const [is_everyday, setIsEveryday] = useState(false);
    const [deleted] = useState(initial?.is_deleted ?? false);
    const [is_deleted, setIsDeleted] = useState(initial?.is_deleted ?? false);
    const {centreActivities} = useCentreActivities(false);
    const { centre: selectedCentre} = useCareCentreHours("weqw");
    const [errors, setErrors] = useState<FormErrors>({ _summary: [] });
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    useEffect(() => {
        if (initial?.centre_activity_id && initial.centre_activity_id !== 0) {
            setCentreActivityID(initial.centre_activity_id.toString());
        }
        }, [initial]);

    // Prefill selectedDays if editing
    useEffect(() => {
        const dw = initial?.days_of_week ?? 0; 
        const days: number[] = [];
        DAYS_MAP.forEach((d) => {
            if ((dw & d.value) > 0) days.push(d.value);
        });
        setSelectedDays(days);

        // Automatically select recurring if any day is set
        setIsEveryday(dw > 0);
    }, [initial]);




    const runSync = (v: CentreActivityAvailabilityFormValues & {selectedCentreActivity: CentreActivityWithTitle}) => {
        const e = validateLocal(v);
        setErrors(e);
        return e;
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({ _summary: [] });

        if (!centre_activity_id || centre_activity_id === "0") {
            setErrors({
                _summary: ["Please select a centre activity before submitting."],
            });
            return;
            }

            if (formattedEnd <= formattedStart) {
                setErrors({
                    _summary: ["End time must be later than start time"],
                });
                return;
            }

        try {
            const daysOfWeekBitmask = is_everyday && selectedDays.length > 0
            ? selectedDays.reduce((acc, day) => acc | day, 0)
            : 0;
            const formValues: CentreActivityAvailabilityFormValues = {
            centre_activity_id: parseInt(centre_activity_id),
            start_date: start_date,
            end_date: end_date,
            start_time: formattedStart,
            end_time: formattedEnd,
            is_deleted: is_deleted,
            is_everyday: is_everyday,
            days_of_week: daysOfWeekBitmask,        
            created_by_id: "string",                 
            };

            const local = runSync({ ...formValues, selectedCentreActivity: initial.selectedCentreActivityData });
            if (local._summary?.length) return;

            await onSubmit(formValues, setErrors);

        } catch (error: any) {
            console.error("Form submission error:", error);
        }
        };


    
    const radioBtnOptions : RadioBtnOption[] = [
        { value: true, label: "Yes"},
        { value: false, label: "No"}
    ];

    return(
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {errors?._summary && errors._summary.length > 0 && (
                <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800 text-sm">
                    <ul className="list-disc pl-5 space-y-1">
                        {errors._summary.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                </div>
            )}
            {deleted && (
                <div className="space-y-2">
                    <Label htmlFor="is_deleted">Undo deletion of this centre activity?</Label>
                    <div className="space-x-2">
                        <Label className="space-x-1">
                            <input
                                type="checkbox"
                                id = "is_deleted"
                                onChange={(e) =>{
                                    if (e.target.checked) {
                                        setIsDeleted(false);
                                    }
                                    else {
                                        setIsDeleted(true);
                                    }
                                }}
                            />
                            <label>Yes</label>
                        </Label>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="centre_activity_id">Centre Activity</Label>
                <select
                    id="centre_activity_id"
                    value={centre_activity_id}
                    disabled={is_deleted ? true : false}
                    onChange={(e) => {
                        setCentreActivityID(e.target.value)
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                >
                    <option value="" disabled>Select an centre activity</option>
                    {centreActivities.map((a) => (
                        <option key={a.id} value={a.id.toString()}>
                            {a.activity_title}
                        </option>
                    ))}
                </select>
            </div>
            {/* Recurring radio + Days of Week */}
            <div className="space-y-2">
            <Label htmlFor="is_everyday">Recurring this activity over a selected week?</Label>
            
            {/* Yes / No radio buttons */}
            <div className="space-x-2">
                {radioBtnOptions.map((choice) => (
                <Label className="space-x-1" key={choice.label}>
                    <input
                    type="radio"
                    name="is_everyday"
                    value={choice.value.toString()}
                    checked={is_everyday === choice.value}
                    onChange={() => {
                        setIsEveryday(choice.value);
                        
                        if (choice.value) {
                        setSelectedDays(DAYS_MAP.map(d => d.value));
                        } else {
                        setSelectedDays([]);
                        }
                    }}
                    />
                    <span>{choice.label}</span>
                </Label>
                ))}
            </div>

            {/* Days-of-week checkboxes */}
                {is_everyday && selectedCentre && (
                    <div className="space-y-2">
                        <Label>Select days of the week:</Label>
                        <div className="flex flex-wrap space-x-2">
                        {DAYS_MAP.filter(day => {
                            // Only show days where the centre has open & close times
                            const dayKey = BIT_TO_DAY[day.value];
                            const hours = selectedCentre.working_hours[dayKey];
                            return hours?.open && hours?.close;
                        }).map(day => (
                            <label key={day.value} className="flex items-center space-x-1">
                            <input
                                type="checkbox"
                                value={day.value}
                                checked={selectedDays.includes(day.value)}
                                onChange={e => {
                                const val = day.value;
                                if (e.target.checked) setSelectedDays([...selectedDays, val]);
                                else setSelectedDays(selectedDays.filter(v => v !== val));
                                }}
                            />
                            <span>{day.label}</span>
                            </label>
                        ))}

                        {/* Every open day toggle */}
                        <label className="flex items-center space-x-1 ml-4">
                            <input
                            type="checkbox"
                            checked={
                                selectedDays.length ===
                                DAYS_MAP.filter(day => {
                                const dayKey = BIT_TO_DAY[day.value];
                                const hours = selectedCentre.working_hours[dayKey];
                                return hours?.open && hours?.close;
                                }).length
                            }
                            onChange={e => {
                                if (e.target.checked)
                                setSelectedDays(
                                    DAYS_MAP.filter(day => {
                                    const dayKey = BIT_TO_DAY[day.value];
                                    const hours = selectedCentre.working_hours[dayKey];
                                    return hours?.open && hours?.close;
                                    }).map(d => d.value)
                                );
                                else setSelectedDays([]);
                            }}
                            />
                            <span>Every open day</span>
                        </label>
                        </div>
                    </div>
                )}


            </div>

            {/* Dates and times */}
            <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                    id="start_date"
                    type="date"
                    value={start_date}
                    disabled={is_deleted ? true : false}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                    id="end_date"
                    type="date"
                    value={end_date}
                    disabled={is_deleted ? true : false}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
            </div>


            <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="flex gap-2">
                    <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="border rounded px-2 py-1"
                    >
                    {hourOptions.map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                    </select>

                    <span>:</span>

                    <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    className="border rounded px-2 py-1"
                    >
                    {minuteOptions.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>End Time</Label>
                <div className="flex gap-2">
                    <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="border rounded px-2 py-1"
                    >
                    {hourOptions.map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                    </select>

                    <span>:</span>

                    <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    className="border rounded px-2 py-1"
                    >
                    {minuteOptions.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={submitting} className="min-w-24">
                    {submitting ? "Saving…" : initial?.id ? "Update" : "Create"}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}