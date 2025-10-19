import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCentreActivities } from "@/hooks/activities/useCentreActivities";
import { type FormErrors, type CentreActivityAvailabilityFormValues,} from "@/lib/validation/activityAvailability";
import dayjs from "dayjs";

type Props = {
  initial?: CentreActivityAvailabilityFormValues & {id?: number} & {editing?: boolean};
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

export default function ActivityAvailabilityForm({ 
  initial, 
  submitting,
  onSubmit,
  onCancel
}: Props) {
    const [centre_activity_id, setCentreActivityID] = useState<string>(initial?.centre_activity_id?.toString() ?? "");
    const [date, setDate] = useState(dayjs(initial?.start_time).format("YYYY-MM-DD") ?? "");
    const [start_time, setStartTime] = useState(dayjs(initial?.start_time).format("HH:mm") ?? "");
    const [end_time, setEndTime] = useState(dayjs(initial?.end_time).format("HH:mm") ?? "");
    const [is_everyday, setIsEveryday] = useState(false);
    const [deleted] = useState(initial?.is_deleted ?? false);
    const [is_deleted, setIsDeleted] = useState(initial?.is_deleted ?? false);
    const {centreActivities} = useCentreActivities(false);
    const [errors, setErrors] = useState<FormErrors>({ _summary: [] });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({ _summary: [] });
        
        try {
            // let date_of_activity = new Date(date)

            let [startHours, startMinutes] = start_time.split(":").map(Number);
            let [endHours, endMinutes] = end_time.split(":").map(Number);
            const [year, month, day] = date.split("-").map(Number);

            let startDateTime = new Date(Date.UTC(year, month -1, day, startHours, startMinutes)).toISOString();
            let endDateTime = new Date(Date.UTC(year, month -1, day, endHours, endMinutes)).toISOString();

            const formValues = { 
                centre_activity_id: parseInt(centre_activity_id),
                start_time: startDateTime.toString(),
                end_time: endDateTime.toString(),
                is_deleted: is_deleted,
                is_everyday: is_everyday
            };
            
            // const local = runSync(formValues);
            // if (local._summary && local._summary.length) return;

            await onSubmit(formValues, setErrors);
        }
        catch(error: any) {
            console.error("Form submission error:", error);
        }
    };
    
    const radioBtnOptions : RadioBtnOption[] = [
        { value: true, label: "Yes"},
        { value: false, label: "No"}
    ];

    return(
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {deleted && (
                <div className="space-y-2">
                    <Label htmlFor="is_deleted">Undo deletion of this centre activity?</Label>
                    <div className="space-x-2">
                        <Label className="space-x-1">
                            <input
                                type="checkbox"
                                id = "is_deleted"
                                onChange={(e) =>{
                                    if (e.target.value) {
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
            <div className="space-y-2 space-x-2">
                <Label htmlFor="is_everyday">Recurr this activity over a selected week?</Label>
                <div className="space-x-2">
                    {radioBtnOptions.map((choice) => (
                    <Label className="space-x-1">
                        <input
                            type="radio"
                            id = {choice.value.toString()}
                            name="is_everyday"
                            value={choice.value.toString()}
                            checked={is_everyday === choice.value ? true : false}
                            onChange={(e) => setIsEveryday(choice.value)}
                        />
                        <label>{choice.label}</label>
                        </Label>
                    ))}
                </div>
            </div>

            {is_everyday && (
                <div className="space-y-2">
                    <Label>Note: Select a date on the week that the activity will recurr everyday.</Label>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="date_of_activity">Date of this activity</Label>
                <Input
                    id="date_of_activity"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="start_time">Start time of this activity</Label>
                <Input
                    id="start_time"
                    type="time"
                    value={start_time}
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
                    onChange={(e) => setEndTime(e.target.value)}
                />
                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
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