import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Activity} from "@/api/activities/activities";
import { CentreActivity } from "@/api/activities/centreActivities";
import { toast } from "sonner";
import { getAllActivities } from "@/api/activity/activityPreference";
import { FormErrors, validateLocal } from "@/lib/validation/centreActivity";

export type CentreActivityFormValues = { 
    id?: number | null; 
    activity_id: number;
    is_fixed: boolean;
    is_group: boolean;
    is_compulsory: boolean;
    start_date: string;
    end_date: string;
    min_duration: number;
    max_duration: number;
    min_people_req: number;
};

type Props = {
  initial?: CentreActivityFormValues;
  submitting?: boolean;
  onSubmit: (
    values: { 
      activity_id: number; 
      is_fixed: boolean;
      is_group: boolean;
      is_compulsory: boolean;
      start_date: string;
      end_date: string;
      min_duration: number;
      max_duration: number;
      min_people_req: number;
      is_deleted: boolean | false;
    },
    setErrors: (e: FormErrors) => void, 
    setSubmitting: (b: boolean) => void
  ) => void | Promise<void>;
  onCancel?: () => void;
};

export default function CentreActivityForm({ 
  initial, 
  submitting,
  onSubmit,
  onCancel
}: Props) {
  const [activity_id, setActivityID] = useState(initial?.activity_id ?? 0);
  const [is_fixed, setIs_Fixed] = useState(initial?.is_fixed ?? false);
  const [is_compulsory, setIs_Compulsory] = useState(initial?.is_compulsory ?? false);
  const [start_date, setStart_date] = useState(initial?.start_date ?? "");
  const [end_date, setEnd_date] = useState(initial?.end_date ?? "");
  const [min_duration, setMin_duration] = useState(initial?.min_duration ?? 60);
  const [max_duration, setMax_duration] = useState(initial?.max_duration ?? 60);
  const [is_group, setIs_group] = useState(initial?.is_group ?? false);
  const [min_people_req, setMin_people_req] = useState(initial?.min_people_req ?? 0);
  const [is_deleted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({ _summary: [] });

  const [activities, setActivities] = useState<Activity[]>([]);

  const runSync = (v: { 
      activity_id:number, 
      start_date: string,
      end_date: string,
      min_duration: number,
      max_duration: number,
      is_group: boolean,
      min_people_req: number
    }) => {
    const e = validateLocal(v);
    setErrors(e);
    return e;
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            const[activitiesData] = await Promise.all([
              getAllActivities()
            ]);
          setActivities(activitiesData);
        }
        catch(error) {
            console.error("Error fetching form data:", error);
            toast.error("Failed to load form data");
        }
    };
  
    fetchData();
  }, []);

  return (
    <form 
      className="mt-4 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrors({ _summary: [] });

        await onSubmit({ 
            activity_id: activity_id,
            is_fixed: is_fixed,
            is_compulsory: is_compulsory,
            is_group: is_group,
            start_date: start_date,
            end_date: end_date,
            min_duration: min_duration,
            max_duration: max_duration,
            min_people_req: min_people_req,
            is_deleted: is_deleted
          }
          , setErrors, () => {}
        );
      }}
    >
      {errors?._summary && errors._summary.length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {errors._summary.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      {/* Activity Selection */}
      <div className="space-y-2">
        <Label htmlFor="activity_id">Activity</Label>
        <select
          id="activity_id"
          value={activity_id}
          onChange={(e) => setActivityID(parseInt(e.target.value))}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
        >
          <option value="" disabled>Select an activity</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id.toString()}>
              {a.title}
            </option>
          ))}
        </select>
        {errors.activity_id && <p className="text-sm text-red-600">{errors.activity_id}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="is_fixed">is_fixed</Label>
        <Label>
          <input 
            type="radio"
            onChange={(e) => {
              setIs_Fixed(true)
            }}
          />
          Yes
        </Label>
        <Label>
          <input 
            type="radio" 
            onChange={(e) => {
              setIs_Fixed(false)
            }}
          />
          No
        </Label>
        {errors.is_fixed && <p className="text-sm text-red-600">{errors.is_fixed}</p>}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting} className="min-w-24">
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}