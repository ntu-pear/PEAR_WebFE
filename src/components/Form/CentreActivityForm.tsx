import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Activity} from "@/api/activities/activities";
import dayjs from "dayjs";
import { toast } from "sonner";
import { getAllActivities } from "@/api/activity/activityPreference";
import { type FormErrors, type CentreActivityFormValues } from "@/lib/validation/centreActivity";

export interface RadioBtnOption {
  value: string;
  label: string;
}

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
  const [activity_id, setActivityID] = useState(initial?.activity_id ?? 1);
  const [is_fixed, setIs_Fixed] = useState<boolean>(initial?.is_fixed ?? false);
  const [is_compulsory, setIs_Compulsory] = useState(initial?.is_compulsory ?? false);
  const [start_date, setStart_date] = useState(initial?.start_date ?? "");
  const [end_date, setEnd_date] = useState(initial?.end_date ?? "");
  const [min_duration, setMin_duration] = useState(initial?.min_duration ?? 60);
  const [max_duration, setMax_duration] = useState(initial?.max_duration ?? 60);
  const [is_group, setIs_Group] = useState(initial?.is_group ?? false);
  const [min_people_req, setMin_people_req] = useState(initial?.min_people_req ?? 0);
  const [is_deleted] = useState(false);
  const [is_indefinite, setIsIndefinite] = useState(false);
  const indefiniteDate = dayjs(new Date(2999, 0, 1).toDateString()).format("YYYY-MM-DD");
  const [errors, setErrors] = useState<FormErrors>({ _summary: [] });

  const [activities, setActivities] = useState<Activity[]>([]);

  // const radioBtnOptions : RadioBtnOption[] = [
  //   { value: "true", label: "Yes"},
  //   { value: "false", label: "No"}
  // ];

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
  
  // const runSync = (v: { 
  //     activity_id:number, 
  //     start_date: string,
  //     end_date: string,
  //     min_duration: number,
  //     max_duration: number,
  //     is_group: boolean,
  //     min_people_req: number
  //   }) => {
  //   const e = validateLocal(v);
  //   setErrors(e);
  //   return e;
  // };

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
          value={activity_id.toString()}         
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

      {/* From this point onwards, create centre activity */}
      <div className="space-y-2 space-x-2">
        {/* <div className="space-x-2"> */}
          {/* {radioBtnOptions.map((choice) => (
            <Label key={choice.value} className="space-x-1">
              <input
                type="radio"
                id = "is_fixed"
                name="is_fixed"
                value={choice.value}
                onChange={(e) => setIs_Fixed(Boolean(e.target.value))}
              />
              <label>{choice.label}</label>
            </Label>
          ))} */}
        {/* </div> */}
        <input
          id="is_fixed"
          type="checkbox"
          checked={is_fixed}
          onChange={(e) => {
            setIs_Fixed(e.target.checked);
          }}
        />
        <Label htmlFor="is_fixed">Is this activity fixed to a timeslot?</Label>
        {errors.is_fixed && <p className="text-sm text-red-600">{errors.is_fixed}</p>}
      </div>

      <div className="space-y-2 space-x-2">
        {/* <div className="space-x-2"> */}
          {/* {radioBtnOptions.map((choice) => (
            <Label key={choice.value} className="space-x-1">
              <input
                type="radio"
                id = "is_compulsory"
                name="is_compulsory"
                value={choice.value}
                onChange={(e) => setIs_Compulsory(Boolean(e.target.value))}
              />
              <label>{choice.label}</label>
            </Label>
          ))} */}
        {/* </div> */}
        <input
          id="is_compulsory"
          type="checkbox"
          checked={is_compulsory}
          onChange={(e) => {
            setIs_Compulsory(e.target.checked);
          }}
        />
        <Label htmlFor="is_compulsory">Is this activity compulsory for patients?</Label>
        {errors.is_compulsory && <p className="text-sm text-red-600">{errors.is_compulsory}</p>}
      </div>

      {/* Indefinite Checkbox */}
      <div className="space-y-2 space-x-2">
        <input
          id="is_indefinite"
          type="checkbox"
          checked={is_indefinite}
          onChange={(e) => {
            setIsIndefinite(e.target.checked);
            if (e.target.checked) {
              setEnd_date(indefiniteDate);
            }
            else {
              setEnd_date("");
            }
          }}
        />
        <Label htmlFor="is_indefinite">is this activity end date indefinite?</Label>
      </div>

      <div className="space-y-2 space-x-2">
        <input
          id="is_group"
          type="checkbox"
          checked={is_group}
          onChange={(e) => {
            setIs_Group(e.target.checked);
          }}
        />
        <Label htmlFor="is_group">Is this a group activity?</Label>
        {errors.is_group && <p className="text-sm text-red-600">{errors.is_group}</p>}
      </div>

      {/* Minmum people required (Display only if group is checked) */}
      {is_group && (
        <div className="space-y-2">
          <Label htmlFor="min_people_req">Minimum people required (Must be atleast 2 people)</Label>
            <Input
              id="min_people_req"
              value={min_people_req}
              onChange={(e) => setMin_people_req(parseInt(e.target.value))}
            />
          {errors.min_people_req && <p className="text-sm text-red-600">{errors.min_people_req}</p>}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="min_duration">Minimum Duration </Label>
        <Input
          id="min_duration"
          value={min_duration}
          onChange={(e) => setMin_duration(parseInt(e.target.value))}
        />
        {errors.min_duration && <p className="text-sm text-red-600">{errors.min_duration}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_duration">Maximum Duration </Label>
        <Input
          id="max_duration"
          value={max_duration}
          onChange={(e) => setMax_duration(parseInt(e.target.value))}
        />
        {errors.max_duration && <p className="text-sm text-red-600">{errors.max_duration}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_date">Start date </Label>
        <Input
          id="start_date"
          type="date"
          value={start_date}
          onChange={(e) => setStart_date(e.target.value)}
        />
        {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">End date </Label>
        {!is_indefinite && (
          <Input
            id="end_date"
            type="date"
            value={end_date}
            onChange={(e) => setEnd_date(e.target.value)}
          />
        )}
        {is_indefinite && (
          <Input
            id="end_date"
            type="date"
            value={indefiniteDate}
            disabled={true}
          />
        )}
        {errors.end_date && <p className="text-sm text-red-600">{errors.end_date}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting} className="min-w-24">
          {submitting ? "Saving…" : "Save"}
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