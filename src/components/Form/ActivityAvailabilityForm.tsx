import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCentreActivities } from "@/hooks/activities/useCentreActivities";
import { type FormErrors, type CentreActivityAvailabilityFormValues, validateLocal} from "@/lib/validation/activityAvailability";
import { CentreActivityWithTitle } from "@/api/activities/centreActivities";



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

    // EDIT: Time-only inputs for start_time and end_time
    const [start_time, setStartTime] = useState(initial?.start_time ?? "");
    const [end_time, setEndTime] = useState(initial?.end_time ?? "");

    const [is_everyday, setIsEveryday] = useState(false);
    const [deleted] = useState(initial?.is_deleted ?? false);
    const [is_deleted, setIsDeleted] = useState(initial?.is_deleted ?? false);
    const {centreActivities} = useCentreActivities(false);
    const [errors, setErrors] = useState<FormErrors>({ _summary: [] });
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

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

        try {
            const daysOfWeekBitmask = is_everyday && selectedDays.length > 0
            ? selectedDays.reduce((acc, day) => acc | day, 0)
            : 0;
            const formValues: CentreActivityAvailabilityFormValues = {
            centre_activity_id: parseInt(centre_activity_id),
            start_date: start_date,
            end_date: end_date,
            start_time: start_time,
            end_time: end_time,
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
                            {a.id}. {a.activity_title}
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
            {is_everyday && (
                <div className="space-y-2">
                <Label>Select days of the week:</Label>
                <div className="flex flex-wrap space-x-2">
                    {DAYS_MAP.map((day) => (
                    <label key={day.value} className="flex items-center space-x-1">
                        <input
                        type="checkbox"
                        value={day.value}
                        checked={selectedDays.includes(day.value)}
                        onChange={(e) => {
                            const val = day.value;
                            if (e.target.checked) setSelectedDays([...selectedDays, val]);
                            else setSelectedDays(selectedDays.filter((v) => v !== val));
                        }}
                        />
                        <span>{day.label}</span>
                    </label>
                    ))}

                    {/* Every day toggle */}
                    <label className="flex items-center space-x-1 ml-4">
                    <input
                        type="checkbox"
                        checked={selectedDays.length === DAYS_MAP.length}
                        onChange={(e) => {
                        if (e.target.checked) setSelectedDays(DAYS_MAP.map(d => d.value));
                        else setSelectedDays([]);
                        }}
                    />
                    <span>Every day</span>
                    </label>
                </div>
                </div>
            )}
            </div>

            {/* Dates and times */}
            <div className="space-y-2">
                <Label htmlFor="date_of_activity">Start Date</Label>
                <Input
                    id="date_of_activity"
                    type="date"
                    value={start_date}
                    disabled={is_deleted ? true : false}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="date_of_activity">End Date</Label>
                <Input
                    id="date_of_activity"
                    type="date"
                    value={end_date}
                    disabled={is_deleted ? true : false}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
            </div>


            <div className="space-y-2">
                <Label htmlFor="start_time">Start time of this activity</Label>
                <Input
                    id="start_time"
                    type="time"
                    value={start_time}
                    disabled={is_deleted ? true : false}
                    min="08:00"
                    max="21:00"
                    onChange={(e) => setStartTime(e.target.value)}
                />
                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="end_time">End time of this activity</Label>
                <Input
                    id="end_time"
                    type="time"
                    value={end_time}
                    disabled={is_deleted ? true : false}
                    min="08:00"
                    max="21:00"
                    onChange={(e) => setEndTime(e.target.value)}
                />
                {errors.end_time && <p className="text-sm text-red-600">{errors.end_time}</p>}
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