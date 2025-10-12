import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Activity} from "@/api/activities/activities";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useCentreActivities } from "@/hooks/activities/useCentreActivities";
import { type FormErrors, type CentreActivityAvailabilityFormValues,} from "@/lib/validation/activityAvailability";
import { start } from "repl";

type Props = {
  initial?: CentreActivityAvailabilityFormValues & {id?: number};
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
    const [start_time, setStart_date] = useState(initial?.start_time ?? "");
    const [end_time, setEnd_date] = useState(initial?.end_time ?? "");
    const [is_deleted] = useState(false);
    const {centreActivities} = useCentreActivities(false);
    const [errors, setErrors] = useState<FormErrors>({ _summary: [] });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({ _summary: [] });

        try {
        const formValues = { 
            centre_activity_id: parseInt(centre_activity_id),
            start_time: start_time,
            end_time: end_time,
            is_deleted: is_deleted
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
            <div className="space-y-2">
                <Label htmlFor="start_date">Start Date of this activity</Label>
                <Input
                    id="start_time"
                    type="datetime-local"
                    step={1800}
                    value={start_time}
                    onChange={(e) => setStart_date(e.target.value)}
                />
                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="end_date">End Date of this activity</Label>
                <Input
                    id="end_time"
                    type="datetime-local"
                    value={end_time}
                    onChange={(e) => setEnd_date(e.target.value)}
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